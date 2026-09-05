import { DomainEvent } from "../shared/DomainEvent";
export type TransportEventType = "transport.connected" | "transport.disconnected" | "transport.message_delivered" | "transport.stale_detected";
export interface TransportEvent extends DomainEvent {
  type: TransportEventType;
  transport: "in-memory" | "broadcast-channel" | "websocket" | "polling";
}
export const createTransportConnectedEvent = (sessionId: string, transport: TransportEvent["transport"]): TransportEvent => ({
  type: "transport.connected",
  sessionId,
  transport,
  occurredAt: new Date(),
} as TransportEvent);
export const createStaleDetectedEvent = (sessionId: string): TransportEvent => ({
  type: "transport.stale_detected",
  sessionId,
  transport: "in-memory",
  occurredAt: new Date(),
} as TransportEvent);
