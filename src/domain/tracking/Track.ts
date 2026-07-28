import { Position } from "./Position";
import { GpsThrottlePolicy } from "./GpsThrottlePolicy";
import {
  TrackingEvent,
  positionRecorded,
  positionRejected,
  etaEstimated,
} from "./TrackingEvents";

/**
 * Tracking Philosophy: "GPS creates observations. Observations create
 * Events. Events update Session. Session updates UI. Never bypass this
 * chain." This is where GPS readings become observations and events.
 *
 * References the session only by id (sessionId) — never imports the
 * Session class. Two bounded contexts, one shared identifier.
 */
export class Track {
  private observations: Position[] = [];
  private destinationField: Position | undefined;
  private pendingEvents: TrackingEvent[] = [];
  private readonly throttle: GpsThrottlePolicy;

  private constructor(public readonly sessionId: string, throttle?: GpsThrottlePolicy) {
    this.throttle = throttle ?? new GpsThrottlePolicy();
  }

  static create(sessionId: string, throttle?: GpsThrottlePolicy): Track {
    return new Track(sessionId, throttle);
  }

  get latestPosition(): Position | undefined {
    return this.observations.length > 0
      ? this.observations[this.observations.length - 1]
      : undefined;
  }

  get destination(): Position | undefined {
    return this.destinationField;
  }

  get distanceTraveledMeters(): number {
    let total = 0;
    for (let i = 1; i < this.observations.length; i++) {
      const previous = this.observations[i - 1];
      const current = this.observations[i];
      if (previous && current) {
        total += previous.distanceTo(current);
      }
    }
    return total;
  }

  /** GPS reading in. Rejected silently (as an event, not an exception) if it fails throttling. */
  recordObservation(position: Position): void {
    if (!this.throttle.shouldAccept(this.latestPosition, position)) {
      const reason = this.latestPosition && position.capturedAt < this.latestPosition.capturedAt
        ? "out-of-order"
        : "throttled";
      this.pendingEvents.push(positionRejected(this.sessionId, reason));
      return;
    }

    this.observations.push(position);
    this.pendingEvents.push(positionRecorded(this.sessionId, position));

    if (this.destinationField) {
      this.pushEtaEventIfAvailable();
    }
  }

  setDestination(destination: Position): void {
    this.destinationField = destination;
    if (this.latestPosition) {
      this.pushEtaEventIfAvailable();
    }
  }

  /** Remaining distance and a rough ETA from recent average speed. undefined until we have both a destination and enough history. */
  estimateEta(): { remainingMeters: number; etaSeconds: number } | undefined {
    const current = this.latestPosition;
    if (!this.destinationField || !current) {
      return undefined;
    }
    const remainingMeters = current.distanceTo(this.destinationField);
    const speedMetersPerSecond = this.recentAverageSpeed();
    if (speedMetersPerSecond <= 0) {
      return undefined;
    }
    return { remainingMeters, etaSeconds: remainingMeters / speedMetersPerSecond };
  }

  private recentAverageSpeed(): number {
    const window = this.observations.slice(-5);
    if (window.length < 2) {
      return 0;
    }
    let distance = 0;
    for (let i = 1; i < window.length; i++) {
      const previous = window[i - 1];
      const current = window[i];
      if (previous && current) {
        distance += previous.distanceTo(current);
      }
    }
    const first = window[0];
    const last = window[window.length - 1];
    if (!first || !last) {
      return 0;
    }
    const elapsedSeconds = (last.capturedAt.getTime() - first.capturedAt.getTime()) / 1000;
    return elapsedSeconds > 0 ? distance / elapsedSeconds : 0;
  }

  private pushEtaEventIfAvailable(): void {
    const eta = this.estimateEta();
    if (eta) {
      this.pendingEvents.push(etaEstimated(this.sessionId, eta.remainingMeters, eta.etaSeconds));
    }
  }

  pullDomainEvents(): TrackingEvent[] {
    const events = this.pendingEvents;
    this.pendingEvents = [];
    return events;
  }
}
