import { SessionState } from "../session/SessionState";
import { Position } from "../tracking/Position";

/**
 * Viewer Experience: "Opening a shared link should immediately answer:
 * Where? Going where? How long? Still moving? Anything changed?"
 * This is that answer, typed. A pure read model — nothing here mutates
 * anything, so it carries no methods, only facts.
 */
export type MovementStatus = "moving" | "paused" | "stale" | "unknown";

export interface SessionView {
  readonly sessionId: string;
  readonly state: SessionState;
  /** "Still moving?" */
  readonly movement: MovementStatus;
  /** "Where?" */
  readonly current: Position | undefined;
  /** "Going where?" */
  readonly destination: Position | undefined;
  /** "How long?" */
  readonly remainingMeters: number | undefined;
  readonly etaSeconds: number | undefined;
  readonly distanceTraveledMeters: number;
  readonly asOf: Date;
}
