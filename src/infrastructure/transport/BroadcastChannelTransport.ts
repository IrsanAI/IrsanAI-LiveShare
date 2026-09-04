import { TransportPort, TransportHandler, Unsubscribe } from "../../domain/transport/TransportPort";
import { AppEvent } from "../events/AppEvent";
export class BroadcastChannelTransport implements TransportPort {
  private channels = new Map<string, BroadcastChannel>();
  private localHandlers = new Map<string, Set<TransportHandler>>();
  async publish(sessionId: string, event: AppEvent): Promise<void> {
    const ch = this.getChannel(sessionId); try { ch.postMessage(event); } catch {}
    const handlers = this.localHandlers.get(sessionId); if (handlers) for (const h of handlers) h(event);
  }
  subscribe(sessionId: string, handler: TransportHandler): Unsubscribe {
    if (!this.localHandlers.has(sessionId)) this.localHandlers.set(sessionId, new Set());
    this.localHandlers.get(sessionId)!.add(handler);
    const ch = this.getChannel(sessionId); const onMessage = (e: MessageEvent) => handler(e.data as AppEvent);
    ch.addEventListener("message", onMessage);
    return () => { ch.removeEventListener("message", onMessage as any); this.localHandlers.get(sessionId)?.delete(handler); };
  }
  private getChannel(sessionId: string): BroadcastChannel {
    if (!this.channels.has(sessionId)) this.channels.set(sessionId, new BroadcastChannel(`irsanai-live-${sessionId}`));
    return this.channels.get(sessionId)!;
  }
  isConnected(): boolean { return typeof BroadcastChannel !== "undefined"; }
}
