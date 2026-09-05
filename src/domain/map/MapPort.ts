import { Position } from "../tracking/Position";
import { Track } from "../tracking/Track";

/**
 * MapPort — Root-Ascent 2030: Map is a Port like Transport/Storage
 * Implementations: TextMap (console/demo), Leaflet (OSM), GoogleMap, MapLibre
 * Session/Tracking never know which map, Viewer only calls Port
 */
export interface MapViewState {
  currentPosition?: Position;
  destination?: Position;
  track?: Track;
  remainingMeters?: number;
  etaSeconds?: number | null;
  status: string;
  message: string;
}

export interface MapPort {
  /**
   * Render full viewer state — pure View, no business decision
   */
  render(state: MapViewState): Promise<void>;

  /**
   * Center map on position
   */
  centerOn(position: Position): void;

  /**
   * Draw full track (polyline)
   */
  drawTrack(track: Track): void;

  /**
   * Clear all markers/layers
   */
  clear(): void;
}
