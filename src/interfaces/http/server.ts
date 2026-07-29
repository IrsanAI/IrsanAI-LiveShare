import express, { Request, Response, NextFunction } from "express";

import { SessionApplicationService } from "../../application/session/SessionApplicationService";
import { TrackingApplicationService } from "../../application/tracking/TrackingApplicationService";
import { SharingApplicationService } from "../../application/sharing/SharingApplicationService";
import { ViewerApplicationService } from "../../application/viewer/ViewerApplicationService";

import { InMemorySessionRepository } from "../../infrastructure/persistence/InMemorySessionRepository";
import { InMemoryTrackingRepository } from "../../infrastructure/persistence/InMemoryTrackingRepository";
import { InMemoryShareRepository } from "../../infrastructure/persistence/InMemoryShareRepository";
import { InMemoryEventBus } from "../../infrastructure/events/InMemoryEventBus";
import { CryptoTokenGenerator } from "../../infrastructure/security/CryptoTokenGenerator";
import { SystemClock } from "../../infrastructure/time/SystemClock";

import { Position } from "../../domain/tracking/Position";
import { IllegalTransitionError } from "../../domain/session/IllegalTransitionError";
import { InvalidOrExpiredTokenError } from "../../domain/sharing/InvalidOrExpiredTokenError";
import { getCopy } from "../../ui/personality/PersonalityTheme";
import { renderViewerPage } from "../../ui/viewer/renderViewerPage";
import { renderHostPage } from "../../ui/host/renderHostPage";
import { renderLandingPage } from "../../ui/landing/renderLandingPage";
import { toViewerJson } from "../../ui/viewer/toViewerJson";

const PORT = Number(process.env.PORT) || 3000;
const LINK_TTL_SECONDS = 6 * 60 * 60; // 6 hours — generous for a real test session
const THEME = "street" as const;

const sessionRepository = new InMemorySessionRepository();
const trackingRepository = new InMemoryTrackingRepository();
const shareRepository = new InMemoryShareRepository();
const eventBus = new InMemoryEventBus();
const clock = new SystemClock();

const sessions = new SessionApplicationService(sessionRepository, eventBus);
const tracking = new TrackingApplicationService(trackingRepository, eventBus);
const sharing = new SharingApplicationService(shareRepository, new CryptoTokenGenerator(), clock, eventBus);
const viewer = new ViewerApplicationService(sharing, sessionRepository, trackingRepository, clock);

eventBus.subscribe((event) => {
  // Server-side log, mirrors the demo's console output so you can watch it live in the terminal too.
  console.log(`[event] ${event.type} :: session ${event.sessionId}`);
});

const app = express();
app.use(express.json());

function asyncRoute(handler: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res).catch(next);
  };
}

function requireParam(req: Request, name: string): string {
  const value = req.params[name];
  if (!value) {
    throw new Error(`Missing required route parameter: ${name}`);
  }
  return value;
}

app.get("/", (_req, res) => {
  res.type("html").send(renderLandingPage());
});

app.post(
  "/api/sessions/start",
  asyncRoute(async (_req, res) => {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await sessions.createSession(sessionId, "host");
    await sessions.ready(sessionId);
    const link = await sharing.createShareLink(sessionId, LINK_TTL_SECONDS);
    const shareUrl = `${baseUrl(_req)}/s/${link.token.value}`;
    res.json({ sessionId, token: link.token.value, shareUrl });
  })
);

app.get(
  "/host/:id",
  asyncRoute(async (req, res) => {
    const session = await sessionRepository.findById(requireParam(req, "id"));
    if (!session) {
      res.status(404).send("Session nicht gefunden.");
      return;
    }
    const token = typeof req.query.token === "string" ? req.query.token : "";
    const copy = getCopy(THEME, session.currentState);
    res.type("html").send(
      renderHostPage({
        sessionId: session.id,
        shareUrl: `${baseUrl(req)}/s/${token}`,
        state: session.currentState,
        label: copy.label,
        microcopy: copy.microcopy,
      })
    );
  })
);

app.post(
  "/api/sessions/:id/activate",
  asyncRoute(async (req, res) => {
    const session = await sessions.activate(requireParam(req, "id"));
    res.json(stateResponse(session.currentState));
  })
);

app.post(
  "/api/sessions/:id/pause",
  asyncRoute(async (req, res) => {
    const session = await sessions.pause(requireParam(req, "id"));
    res.json(stateResponse(session.currentState));
  })
);

app.post(
  "/api/sessions/:id/resume",
  asyncRoute(async (req, res) => {
    const session = await sessions.resume(requireParam(req, "id"));
    res.json(stateResponse(session.currentState));
  })
);

app.post(
  "/api/sessions/:id/complete",
  asyncRoute(async (req, res) => {
    const session = await sessions.complete(requireParam(req, "id"));
    res.json(stateResponse(session.currentState));
  })
);

app.post(
  "/api/sessions/:id/observations",
  asyncRoute(async (req, res) => {
    const { latitude, longitude, accuracyMeters } = req.body ?? {};
    const position = new Position(Number(latitude), Number(longitude), Number(accuracyMeters) || 15, clock.now());
    await tracking.recordObservation(requireParam(req, "id"), position);
    res.json({ ok: true });
  })
);

app.post(
  "/api/sessions/:id/destination",
  asyncRoute(async (req, res) => {
    const { latitude, longitude } = req.body ?? {};
    const position = new Position(Number(latitude), Number(longitude), 10, clock.now());
    await tracking.setDestination(requireParam(req, "id"), position);
    res.json({ ok: true });
  })
);

app.get(
  "/s/:token",
  asyncRoute(async (req, res) => {
    try {
      const view = await viewer.openLink(requireParam(req, "token"));
      const json = toViewerJson(view, THEME);
      res.type("html").send(renderViewerPage({ token: requireParam(req, "token"), ...json }, THEME));
    } catch (err) {
      if (err instanceof InvalidOrExpiredTokenError) {
        res.status(410).type("html").send(goneHtml());
        return;
      }
      throw err;
    }
  })
);

app.get(
  "/api/s/:token/view",
  asyncRoute(async (req, res) => {
    try {
      const view = await viewer.openLink(requireParam(req, "token"));
      res.json(toViewerJson(view, THEME));
    } catch (err) {
      if (err instanceof InvalidOrExpiredTokenError) {
        res.status(410).json({ ok: false });
        return;
      }
      throw err;
    }
  })
);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof IllegalTransitionError) {
    res.status(409).json({ error: err.message });
    return;
  }
  if (err instanceof Error) {
    console.error(err);
    res.status(400).json({ error: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Unexpected error" });
});

function stateResponse(state: string) {
  const copy = getCopy(THEME, state as Parameters<typeof getCopy>[1]);
  return { state, label: copy.label, microcopy: copy.microcopy };
}

function baseUrl(req: Request): string {
  return `${req.protocol}://${req.get("host")}`;
}

function goneHtml(): string {
  return `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <style>body{background:#0b0d12;color:#f5f3ef;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;padding:24px}</style>
  </head><body><div><h2>Dieser Link ist nicht mehr gültig.</h2><p style="color:#8a8f9c">Frag die Person, die geteilt hat, nach einem neuen Link.</p></div></body></html>`;
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`IrsanAI Live Share läuft auf Port ${PORT}`);
  console.log(`Auf diesem Rechner: http://localhost:${PORT}`);
  console.log(`Vom Handy im selben WLAN: http://<LAN-IP-dieses-Rechners>:${PORT}`);
});
