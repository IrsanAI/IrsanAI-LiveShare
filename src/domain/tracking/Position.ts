/**
 * GPS observation as a value object. Immutable, no identity of its own —
 * two Positions with the same fields are interchangeable.
 */
export class Position {
  constructor(
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly accuracyMeters: number,
    public readonly capturedAt: Date
  ) {
    if (latitude < -90 || latitude > 90) {
      throw new Error(`Invalid latitude: ${latitude}`);
    }
    if (longitude < -180 || longitude > 180) {
      throw new Error(`Invalid longitude: ${longitude}`);
    }
    if (accuracyMeters < 0) {
      throw new Error(`Invalid accuracy: ${accuracyMeters}`);
    }
  }

  /** Great-circle distance to another position, in meters (Haversine). */
  distanceTo(other: Position): number {
    const earthRadiusMeters = 6_371_000;
    const toRad = (deg: number): number => (deg * Math.PI) / 180;

    const dLat = toRad(other.latitude - this.latitude);
    const dLng = toRad(other.longitude - this.longitude);
    const lat1 = toRad(this.latitude);
    const lat2 = toRad(other.latitude);

    const a =
      Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadiusMeters * c;
  }
}
