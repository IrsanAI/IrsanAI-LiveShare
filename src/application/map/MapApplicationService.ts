import { MapPort, MapViewState } from "../../domain/map/MapPort";
import { TransportPort } from "../../domain/transport/TransportPort";
import { SessionRepository } from "../../domain/session/SessionRepository";
import { createMapRenderedEvent } from "../../domain/map/MapEvents";

/**
 * MapApplicationService — orchestrates: SessionView built -> MapPort.render()
 * Subscribes to Transport, re-renders on every live event
 * Personality stays out, Map stays dumb View, Transport stays pipe
 */
export class MapApplicationService {
  constructor(
    private mapPort: MapPort,
    private transport: TransportPort,
    private sessionRepo: SessionRepository,
    private buildViewState: (sessionId: string) => Promise<MapViewState>
  ) {}

  async startLiveRendering(sessionId: string): Promise<() => void> {
    // initial render
    const initial = await this.buildViewState(sessionId);
    await this.mapPort.render(initial);
    await this.transport.publish(sessionId, createMapRenderedEvent(sessionId, "text" as any) as any);

    // subscribe for live updates
    const unsub = this.transport.subscribe(sessionId, async () => {
      const state = await this.buildViewState(sessionId);
      await this.mapPort.render(state);
    });
    return unsub;
  }
}
