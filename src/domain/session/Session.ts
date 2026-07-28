import { SessionState, isTransitionAllowed, TERMINAL_STATES } from "./SessionState";
import { SessionEvent, sessionTransitioned } from "./SessionEvents";
import { IllegalTransitionError } from "./IllegalTransitionError";

/**
 * Session — the only source of truth (see Definition of Success:
 * "The entire application can be understood by reading the Session State").
 *
 * Hexagonal architecture: this class has zero knowledge of maps, GPS,
 * transport, storage, UI, or personality/theme. Those are all adapters
 * that sit around this core and react to the events it emits.
 */
export class Session {
  private state: SessionState = "Draft";
  private pendingEvents: SessionEvent[] = [];

  private constructor(public readonly id: string, public readonly hostId: string) {}

  static create(id: string, hostId: string): Session {
    return new Session(id, hostId);
  }

  get currentState(): SessionState {
    return this.state;
  }

  get isTerminal(): boolean {
    return TERMINAL_STATES.has(this.state);
  }

  /** The only way state ever changes. Buttons/adapters dispatch events; this enforces the rules. */
  transition(to: SessionState): void {
    if (!isTransitionAllowed(this.state, to)) {
      throw new IllegalTransitionError(this.id, this.state, to);
    }
    const from = this.state;
    this.state = to;
    this.pendingEvents.push(sessionTransitioned(this.id, from, to));
  }

  ready(): void {
    this.transition("Ready");
  }
  activate(): void {
    this.transition("Active");
  }
  pause(): void {
    this.transition("Paused");
  }
  resume(): void {
    this.transition("Active");
  }
  complete(): void {
    this.transition("Completed");
  }
  revoke(): void {
    this.transition("Revoked");
  }
  expire(): void {
    this.transition("Expired");
  }

  /** Drains events so an application service can publish them exactly once. */
  pullDomainEvents(): SessionEvent[] {
    const events = this.pendingEvents;
    this.pendingEvents = [];
    return events;
  }
}
