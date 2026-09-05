import { MapPort, MapViewState } from "../../domain/map/MapPort";
import { Position } from "../../domain/tracking/Position";
import { Track } from "../../domain/tracking/Track";

/**
 * TextMapRenderer — für demo.ts und Tests, zero deps
 * Macht exakt was renderViewerScreen vorher tat, aber jetzt als Port
 * Root-Ascent: Cost-per-Task <15%, kein Tile-Server, BYOK irrelevant
 */
export class TextMapRenderer implements MapPort {
  private lastState?: MapViewState;

  async render(state: MapViewState): Promise<void> {
    this.lastState = state;
    const pos = state.currentPosition ? `${state.currentPosition.latitude.toFixed(4)}, ${state.currentPosition.longitude.toFixed(4)}` : "noch keine Position";
    const dest = state.destination ? `${state.destination.latitude.toFixed(4)}, ${state.destination.longitude.toFixed(4)}` : "kein Ziel";
    const rem = state.remainingMeters != null ? `${Math.round(state.remainingMeters)} m` : "-";
    const eta = state.etaSeconds != null ? `~${Math.round(state.etaSeconds/60)} min` : "~?";
    console.log(`[TextMap] ${state.status} — ${state.message}`);
    console.log(`  Wo: ${pos} | Wohin: ${dest} | Wie lange: ${rem}, ${eta}`);
  }

  centerOn(position: Position): void {
    console.log(`[TextMap] centerOn ${position.latitude}, ${position.longitude}`);
  }

  drawTrack(track: Track): void {
    const count = (track as any).getPositions ? (track as any).getPositions().length : 0;
    console.log(`[TextMap] drawTrack ${count} points`);
  }

  clear(): void {
    console.log(`[TextMap] clear`);
  }
}
