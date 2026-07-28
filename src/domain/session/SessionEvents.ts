import { SessionState } from "./SessionState";
import { DomainEvent } from "../shared/DomainEvent";

/**
 * Events are the only way the outside world learns a Session changed
 * (Golden Rule #4: Event Driven). They carry facts, never presentation —
 * the personality/theme layer decides how to phrase them later.
 */
export interface SessionTransitioned extends DomainEvent {
  readonly type: "SessionTransitioned";
  readonly from: SessionState;
  readonly to: SessionState;
}

export type SessionEvent = SessionTransitioned;

export function sessionTransitioned(
  sessionId: string,
  from: SessionState,
  to: SessionState
): SessionTransitioned {
  return { type: "SessionTransitioned", sessionId, from, to, occurredAt: new Date() };
}
