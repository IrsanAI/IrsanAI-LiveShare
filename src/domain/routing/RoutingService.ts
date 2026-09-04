import { Position } from "../tracking/Position";
import { Route, RouteMetrics } from "./Route";
import { Track } from "../tracking/Track";
export class RoutingService {
  calculateRemaining(current: Position, route: Route): number {
    let total = 0; let last = current;
    const points = [...(route.waypoints ?? []), route.destination];
    for (const p of points) { total += this.haversine(last, p); last = p; }
    return total;
  }
  calculateMetrics(current: Position, route: Route, track: Track): RouteMetrics {
    const remaining = this.calculateRemaining(current, route);
    const positions = (track as any).getPositions ? (track as any).getPositions() : [];
    let avgSpeed: number | null = null; let eta: number | null = null;
    if (positions.length >= 2) {
      const a = positions[positions.length - 2]; const b = positions[positions.length - 1];
      const dist = this.haversine(a, b);
      const timeSec = (new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) / 1000;
      if (timeSec > 0) { avgSpeed = dist / timeSec; if (avgSpeed > 0.3) eta = remaining / avgSpeed; }
    }
    return { distanceMeters: this.haversine(route.start, route.destination), remainingMeters: remaining, etaSeconds: eta, averageSpeedMps: avgSpeed };
  }
  private haversine(a: Position, b: Position): number {
    const toRad = (d: number) => (d * Math.PI) / 180; const R = 6371000;
    const dLat = toRad(b.latitude - a.latitude); const dLon = toRad(b.longitude - a.longitude);
    const lat1 = toRad(a.latitude); const lat2 = toRad(b.latitude);
    const h = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }
}
