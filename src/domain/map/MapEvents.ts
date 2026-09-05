import { DomainEvent } from "../shared/DomainEvent";
export type MapEventType = "map.rendered" | "map.centered" | "map.cleared" | "map.provider_switched";
export interface MapEvent extends DomainEvent {
  type: MapEventType;
  provider: "text" | "leaflet" | "google" | "maplibre";
}
export const createMapRenderedEvent = (sessionId: string, provider: MapEvent["provider"]): MapEvent => ({
  type: "map.rendered",
  sessionId,
  provider,
  occurredAt: new Date(),
} as MapEvent);
