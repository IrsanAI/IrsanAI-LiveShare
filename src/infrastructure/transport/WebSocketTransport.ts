import { TransportPort, TransportHandler, Unsubscribe } from "../../domain/transport/TransportPort";
import { AppEvent } from "../events/AppEvent";

/**
 * WebSocketTransport — v0.3.0 Root-Ascent 2030
 * Client + Server same Port as InMemory/BroadcastChannel
 * Works in browser (native WebSocket) and Node (ws package optional)
 * No hard dep: if ws not installed, it logs and stays disconnected (stale detection via isConnected)
 */
export class WebSocketTransport implements TransportPort {
  private socket: WebSocket | any = null;
  private handlers = new Map<string, Set<TransportHandler>>();
  private url: string;

  constructor(url: string = "wss://irsanai.app/ws") {
    this.url = url;
  }

  connect(): void {
    try {
      // Browser
      if (typeof WebSocket!== "undefined") {
        this.socket = new WebSocket(this.url);
        this.socket.onmessage = (e: MessageEvent) => {
          try {
            const msg = JSON.parse(e.data);
            const set = this.handlers.get(msg.sessionId);
            if (set) for (const h of set) h(msg.event as AppEvent);
          } catch {}
        };
      } else {
        // Node — try optional ws lib, if not present stay offline (stale)
        try {
          const Ws = require("ws");
          this.socket = new Ws(this.url);
          this.socket.on("message", (data: string) => {
            try {
              const msg = JSON.parse(data);
              const set = this.handlers.get(msg.sessionId);
              if (set) for (const h of set) h(msg.event as AppEvent);
            } catch {}
          });
        } catch {
          console.warn("[WebSocketTransport] ws not installed, run npm i ws — staying offline, Viewer will show stale");
        }
      }
    } catch {}
  }

  async publish(sessionId: string, event: AppEvent): Promise<void> {
    if (!this.socket) this.connect();
    const payload = JSON.stringify({ sessionId, event });
    try {
      if (this.socket?.readyState === 1 || this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(payload);
      } else if (this.socket?.send) {
        this.socket.send(payload);
      }
    } catch {}
    // also notify local handlers (optimistic)
    const set = this.handlers.get(sessionId);
    if (set) for (const h of set) h(event);
  }

  subscribe(sessionId: string, handler: TransportHandler): Unsubscribe {
    if (!this.handlers.has(sessionId)) this.handlers.set(sessionId, new Set());
    this.handlers.get(sessionId)!.add(handler);
    return () => { this.handlers.get(sessionId)?.delete(handler); };
  }

  isConnected(): boolean {
    try { return this.socket?.readyState === 1 || this.socket?.readyState === WebSocket.OPEN; } catch { return false; }
  }
}
