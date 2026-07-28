import { Session } from "../session/Session";
import { Track } from "../tracking/Track";
import { SessionState } from "../session/SessionState";
import { SessionView, MovementStatus } from "./SessionView";

/**
 * The one exception to "domain modules don't know about each other":
 * domain/viewer exists specifically to project Session + Tracking state
 * into the answer a viewer screen needs. It only ever reads their public
 * surface (getters) — never reaches into their internals, never mutates
 * either of them. Session and Tracking still have zero knowledge that
 * this file exists.
 */
const DEFAULT_STALE_AFTER_SECONDS = 60;

export function buildSessionView(
  session: Session,
  track: Track | undefined,
  now: Date,
  staleAfterSeconds: number = DEFAULT_STALE_AFTER_SECONDS
): SessionView {
  const current = track?.latestPosition;
  const eta = track?.estimateEta();

  return {
    sessionId: session.id,
    state: session.currentState,
    movement: deriveMovementStatus(session.currentState, current?.capturedAt, now, staleAfterSeconds),
    current,
    destination: track?.destination,
    remainingMeters: eta?.remainingMeters,
    etaSeconds: eta?.etaSeconds,
    distanceTraveledMeters: track?.distanceTraveledMeters ?? 0,
    asOf: now,
  };
}

function deriveMovementStatus(
  state: SessionState,
  lastObservedAt: Date | undefined,
  now: Date,
  staleAfterSeconds: number
): MovementStatus {
  if (state === "Paused") {
    return "paused";
  }
  if (state !== "Active" || !lastObservedAt) {
    return "unknown";
  }
  const ageSeconds = (now.getTime() - lastObservedAt.getTime()) / 1000;
  return ageSeconds <= staleAfterSeconds ? "moving" : "stale";
}
