import { SessionState } from "./SessionState";

export class IllegalTransitionError extends Error {
  constructor(
    public readonly sessionId: string,
    public readonly from: SessionState,
    public readonly to: SessionState
  ) {
    super(`Session ${sessionId}: illegal transition ${from} -> ${to}`);
    this.name = "IllegalTransitionError";
  }
}
