import { DomainEvent } from "../shared/DomainEvent";
export type HostEventType = "host.created" | "host.joined_session" | "host.left_session";
export interface HostEvent extends DomainEvent {
  type: HostEventType;
  hostId: string;
  sessionId?: string;
}
export const createHostJoinedEvent = (hostId: string, sessionId: string): HostEvent => ({
  type: "host.joined_session", hostId, sessionId,
  occurredAt: new Date().toISOString(),
  eventId: `evt_${Math.random().toString(36).slice(2)}`,
} as HostEvent);
