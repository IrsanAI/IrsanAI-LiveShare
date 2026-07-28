declare const process: { exit(code?: number): void };

import { SessionApplicationService } from "./application/session/SessionApplicationService";
import { InMemorySessionRepository } from "./infrastructure/persistence/InMemorySessionRepository";
import { InMemoryTrackingRepository } from "./infrastructure/persistence/InMemoryTrackingRepository";
import { InMemoryShareRepository } from "./infrastructure/persistence/InMemoryShareRepository";
import { InMemoryEventBus } from "./infrastructure/events/InMemoryEventBus";
import { TrackingApplicationService } from "./application/tracking/TrackingApplicationService";
import { SharingApplicationService } from "./application/sharing/SharingApplicationService";
import { ViewerApplicationService } from "./application/viewer/ViewerApplicationService";
import { Position } from "./domain/tracking/Position";
import { CryptoTokenGenerator } from "./infrastructure/security/CryptoTokenGenerator";
import { ManualClock } from "./infrastructure/time/ManualClock";
import { getCopy } from "./ui/personality/PersonalityTheme";
import { renderViewerScreen } from "./ui/viewer/renderViewerScreen";
import { IllegalTransitionError } from "./domain/session/IllegalTransitionError";
import { InvalidOrExpiredTokenError } from "./domain/sharing/InvalidOrExpiredTokenError";

function pointAt(base: Date, latitude: number, longitude: number, secondsFromBase: number): Position {
  return new Position(latitude, longitude, 8, new Date(base.getTime() + secondsFromBase * 1000));
}

function printViewerScreen(label: string, screen: string): void {
  console.log(`\n[viewer] ${label}`);
  for (const line of screen.split("\n")) {
    console.log(`  ${line}`);
  }
}

async function main() {
  const sessionRepository = new InMemorySessionRepository();
  const trackingRepository = new InMemoryTrackingRepository();
  const shareRepository = new InMemoryShareRepository();
  const eventBus = new InMemoryEventBus();
  const clock = new ManualClock(new Date("2026-07-25T10:00:00Z"));

  const sessions = new SessionApplicationService(sessionRepository, eventBus);
  const tracking = new TrackingApplicationService(trackingRepository, eventBus);
  const sharing = new SharingApplicationService(
    shareRepository,
    new CryptoTokenGenerator(),
    clock,
    eventBus
  );
  const viewer = new ViewerApplicationService(sharing, sessionRepository, trackingRepository, clock);

  eventBus.subscribe((event) => {
    switch (event.type) {
      case "SessionTransitioned": {
        const copy = getCopy("street", event.to);
        console.log(`[session] ${event.from} -> ${event.to} :: "${copy.microcopy}"`);
        break;
      }
      case "PositionRecorded": {
        const p = event.position;
        console.log(`[tracking] Position aufgezeichnet: ${p.latitude.toFixed(4)}, ${p.longitude.toFixed(4)}`);
        break;
      }
      case "PositionRejected": {
        console.log(`[tracking] Position verworfen (${event.reason})`);
        break;
      }
      case "EtaEstimated": {
        const minutes = Math.round(event.etaSeconds / 60);
        console.log(
          `[tracking] ETA aktualisiert: noch ${Math.round(event.remainingMeters)} m, ~${minutes} min`
        );
        break;
      }
      case "LinkIssued": {
        console.log(`[sharing] Link ausgestellt, gültig bis ${event.expiresAt.toISOString()}`);
        break;
      }
      case "LinkRevoked": {
        console.log(`[sharing] Link widerrufen`);
        break;
      }
      case "LinkAccessRejected": {
        console.log(`[sharing] Zugriff abgelehnt (${event.reason})`);
        break;
      }
    }
  });

  const id = "session-001";
  await sessions.createSession(id, "host-001");
  console.log(`[state] Draft :: "${getCopy("street", "Draft").microcopy}"`);

  await sessions.ready(id);
  const link = await sharing.createShareLink(id, 3600); // 1 hour TTL
  console.log(`[sharing] Share-URL: https://irsanai.app/s/${link.token.value}`);
  console.log(`[sharing] (Session-ID bleibt intern: "${id}" taucht in der URL nirgends auf)`);

  const firstScreen = await viewer.openLink(link.token.value);
  printViewerScreen("Viewer öffnet den Link (Session noch nicht Active)", renderViewerScreen(firstScreen, "street"));

  await sessions.activate(id);

  // Munich, walking roughly north — a destination a few hundred meters up the road.
  // Positions are timestamped off the same clock the app uses for everything else,
  // and the clock advances alongside them, so "still moving?" stays meaningful.
  const tripStart = clock.now();
  await tracking.setDestination(id, pointAt(tripStart, 48.1401, 11.5802, 0));
  await tracking.recordObservation(id, pointAt(tripStart, 48.1351, 11.58, 0));
  await tracking.recordObservation(id, pointAt(tripStart, 48.1351, 11.58, 2)); // too soon + too close -> throttled
  await tracking.recordObservation(id, pointAt(tripStart, 48.1358, 11.5801, 8));
  await tracking.recordObservation(id, pointAt(tripStart, 48.1365, 11.5801, 16));
  await tracking.recordObservation(id, pointAt(tripStart, 48.1372, 11.5802, 24));
  clock.advanceSeconds(24); // catch the clock up to the last observation

  const midTripScreen = await viewer.openLink(link.token.value);
  printViewerScreen("Viewer öffnet den Link (mittendrin)", renderViewerScreen(midTripScreen, "street"));

  await sessions.pause(id);

  const pausedScreen = await viewer.openLink(link.token.value);
  printViewerScreen("Viewer öffnet den Link (pausiert)", renderViewerScreen(pausedScreen, "street"));

  await sessions.resume(id);
  const finished = await sessions.complete(id);

  console.log(`\nFinal state: ${finished.currentState} (terminal: ${finished.isTerminal})`);

  console.log("\n--- Now trying an illegal transition (Completed -> Active) ---");
  try {
    await sessions.activate(id);
  } catch (err) {
    if (err instanceof IllegalTransitionError) {
      console.log(`Caught as expected: ${err.message}`);
    } else {
      throw err;
    }
  }

  console.log("\n--- Revoking the link, then trying to access it again ---");
  await sharing.revoke(link.token.value);
  try {
    await sharing.resolve(link.token.value);
  } catch (err) {
    if (err instanceof InvalidOrExpiredTokenError) {
      console.log(`Caught as expected: ${err.message}`);
    } else {
      throw err;
    }
  }

  console.log("\n--- A second link, this time actually expiring (no real sleep — ManualClock) ---");
  const shortLived = await sharing.createShareLink(id, 60); // 1 minute TTL
  clock.advanceSeconds(61);
  try {
    await sharing.resolve(shortLived.token.value);
  } catch (err) {
    if (err instanceof InvalidOrExpiredTokenError) {
      console.log(`Caught as expected: ${err.message}`);
    } else {
      throw err;
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
