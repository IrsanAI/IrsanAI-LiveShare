import { TransportPort, TransportHandler, Unsubscribe } from "../../domain/transport/TransportPort";
import { AppEvent } from "../events/AppEvent";
export class InMemoryTransport implements TransportPort {
  private subscribers = new Map<string, Set<TransportHandler>>();
  private connected = new Set<string>();
  async publish(sessionId: string, event: AppEvent): Promise<void> {
    const h = this.subscribers.get(sessionId); if (!h) return;
    for (const f of h) { try { f(event); } catch {} }
  }
  subscribe(sessionId: string, handler: TransportHandler): Unsubscribe {
    if (!this.subscribers.has(sessionId)) this.subscribers.set(sessionId, new Set());
    this.subscribers.get(sessionId)!.add(handler); this.connected.add(sessionId);
    return () => { this.subscribers.get(sessionId)?.delete(handler); if (this.subscribers.get(sessionId)?.size === 0) this.connected.delete(sessionId); };
  }
  isConnected(sessionId: string): boolean { return this.connected.has(sessionId); }
}
