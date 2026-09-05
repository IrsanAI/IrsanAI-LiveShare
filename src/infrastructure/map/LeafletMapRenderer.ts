import { MapPort, MapViewState } from "../../domain/map/MapPort";
import { Position } from "../../domain/tracking/Position";
import { Track } from "../../domain/tracking/Track";

/**
 * LeafletMapRenderer — browser OSM, no API key, EU-friendly
 * Wird in irsa_live_cockpit.html verwendet, nicht in Termux Node
 * Same Port as TextMap/GoogleMap
 */
export class LeafletMapRenderer implements MapPort {
  private map: any = null;
  private L: any = null;
  private markers: any[] = [];
  private polyline: any = null;

  constructor(private mapElementId: string = "map") {}

  private ensureMap(): boolean {
    if (this.map) return true;
    try {
      // @ts-ignore — leaflet loaded via <script> in cockpit
      const L = (window as any).L;
      if (!L) return false;
      this.L = L;
      this.map = L.map(this.mapElementId).setView([48.1351, 11.5802], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(this.map);
      return true;
    } catch { return false; }
  }

  async render(state: MapViewState): Promise<void> {
    if (!this.ensureMap()) return;
    this.clear();
    if (state.currentPosition) {
      const m = this.L.marker([state.currentPosition.latitude, state.currentPosition.longitude]).addTo(this.map);
      m.bindPopup(state.message).openPopup();
      this.markers.push(m);
      this.map.setView([state.currentPosition.latitude, state.currentPosition.longitude], 15);
    }
    if (state.destination) {
      const m = this.L.marker([state.destination.latitude, state.destination.longitude]).addTo(this.map);
      this.markers.push(m);
    }
    if (state.track) {
      const positions = (state.track as any).getPositions ? (state.track as any).getPositions() : [];
      const latlngs = positions.map((p: Position) => [p.latitude, p.longitude]);
      if (latlngs.length > 1) {
        this.polyline = this.L.polyline(latlngs, { color: "blue" }).addTo(this.map);
      }
    }
  }

  centerOn(position: Position): void {
    if (!this.ensureMap()) return;
    this.map.setView([position.latitude, position.longitude], 15);
  }

  drawTrack(track: Track): void {
    if (!this.ensureMap()) return;
    const positions = (track as any).getPositions ? (track as any).getPositions() : [];
    const latlngs = positions.map((p: Position) => [p.latitude, p.longitude]);
    if (latlngs.length > 1) {
      this.polyline = this.L.polyline(latlngs, { color: "blue" }).addTo(this.map);
    }
  }

  clear(): void {
    if (!this.map) return;
    for (const m of this.markers) this.map.removeLayer(m);
    this.markers = [];
    if (this.polyline) { this.map.removeLayer(this.polyline); this.polyline = null; }
  }
}
