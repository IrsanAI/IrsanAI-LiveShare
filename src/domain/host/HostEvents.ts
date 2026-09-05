import { DomainEvent } from "../shared/DomainEvent";
export type HostEventType = "host.created" | "host.joined_session" | "host.left_session";
export interface HostEvent extends DomainEvent {
  type: HostEventType;
  hostId: string;
  sessionId: string;
}
export const createHostJoinedEvent = (hostId: string, sessionId: string): HostEvent => ({
  type: "host.joined_session",
  hostId,
  sessionId,
  occurredAt: new Date(),
} as HostEvent);
