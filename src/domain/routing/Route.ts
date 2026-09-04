import { Position } from "../tracking/Position";
export interface Route { start: Position; destination: Position; waypoints?: Position[]; }
export interface RouteMetrics { distanceMeters: number; remainingMeters: number; etaSeconds: number | null; averageSpeedMps: number | null; }
