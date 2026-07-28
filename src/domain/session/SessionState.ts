/**
 * The Session is the single source of truth (Golden Rule #1: Session First).
 * Every other module — tracking, sharing, viewer, ui — reacts to this state.
 *
 * NOTE — modeling assumption:
 * The directive draws the states as one straight line
 * (Draft → Ready → Active → Paused → Completed → Revoked → Expired),
 * but a straight line can't express a real session (you'd need to complete
 * before you could ever pause, and revoke/expire could only ever happen at
 * the very end). To make "no illegal transition may be possible" actually
 * enforceable, this table treats the six non-Draft states as a small graph
 * instead of a line:
 *   - Paused can resume back to Active.
 *   - Revoked/Expired can cut in from Ready, Active, or Paused at any time.
 *   - Completed/Revoked/Expired are terminal — nothing leaves them.
 * Flag this assumption back if the intent was something stricter.
 */
export type SessionState =
  | "Draft"
  | "Ready"
  | "Active"
  | "Paused"
  | "Completed"
  | "Revoked"
  | "Expired";

export const TERMINAL_STATES: ReadonlySet<SessionState> = new Set<SessionState>([
  "Completed",
  "Revoked",
  "Expired",
]);

export const ALLOWED_TRANSITIONS: Readonly<Record<SessionState, ReadonlySet<SessionState>>> = {
  Draft: new Set<SessionState>(["Ready"]),
  Ready: new Set<SessionState>(["Active", "Revoked", "Expired"]),
  Active: new Set<SessionState>(["Paused", "Completed", "Revoked", "Expired"]),
  Paused: new Set<SessionState>(["Active", "Completed", "Revoked", "Expired"]),
  Completed: new Set<SessionState>([]),
  Revoked: new Set<SessionState>([]),
  Expired: new Set<SessionState>([]),
};

export function isTransitionAllowed(from: SessionState, to: SessionState): boolean {
  return ALLOWED_TRANSITIONS[from].has(to);
}
