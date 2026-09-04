import { DomainEvent } from "../shared/DomainEvent";
export type TransportEventType = "transport.connected" | "transport.disconnected" | "transport.message_delivered" | "transport.stale_detected";
export interface TransportEvent extends DomainEvent {
  type: TransportEventType;
  sessionId: string;
  transport: "in-memory" | "broadcast-channel" | "websocket" | "polling";
}
export const createTransportConnectedEvent = (sessionId: string, transport: TransportEvent["transport"]): TransportEvent => ({
  type: "transport.connected", sessionId, transport, occurredAt: new Date().toISOString(), eventId: `evt_${Math.random().toString(36).slice(2)}`,
} as TransportEvent);
