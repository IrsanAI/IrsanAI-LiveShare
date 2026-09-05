import { MapPort, MapViewState } from "../../domain/map/MapPort";
import { Position } from "../../domain/tracking/Position";
import { Track } from "../../domain/tracking/Track";

/**
 * GoogleMapRenderer — stub, same Port, optional BYOK key
 * Wer Google will, injected API key, Domain bleibt unberührt
 */
export class GoogleMapRenderer implements MapPort {
  constructor(private apiKey?: string) {}
  async render(state: MapViewState): Promise<void> {
    console.log(`[GoogleMap] render (stub) status=${state.status} key=${this.apiKey ? "present" : "none"}`);
  }
  centerOn(position: Position): void { console.log(`[GoogleMap] centerOn ${position.latitude}, ${position.longitude}`); }
  drawTrack(track: Track): void { console.log(`[GoogleMap] drawTrack stub`); }
  clear(): void { console.log(`[GoogleMap] clear stub`); }
}
