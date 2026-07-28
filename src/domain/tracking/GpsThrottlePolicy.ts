import { Position } from "./Position";

/**
 * Performance: "Prefer Events. Throttle GPS. Avoid unnecessary rendering.
 * Battery matters." This is a business rule, not a device-driver detail —
 * it decides which observations are even worth turning into an event —
 * so it lives in the domain, not in a GPS adapter.
 */
export class GpsThrottlePolicy {
  constructor(
    private readonly minIntervalMs: number = 5_000,
    private readonly minDistanceMeters: number = 15
  ) {}

  shouldAccept(last: Position | undefined, candidate: Position): boolean {
    if (!last) {
      return true;
    }
    const elapsedMs = candidate.capturedAt.getTime() - last.capturedAt.getTime();
    if (elapsedMs < 0) {
      return false; // out-of-order reading, reject
    }
    if (elapsedMs >= this.minIntervalMs) {
      return true;
    }
    return last.distanceTo(candidate) >= this.minDistanceMeters;
  }
}
