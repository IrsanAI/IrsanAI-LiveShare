import { AppEvent } from "./AppEvent";

export type EventHandler = (event: AppEvent) => void;

/** Golden Rule #4: Event Driven. Swappable for a real bus (BroadcastChannel, WS) later. */
export class InMemoryEventBus {
  private handlers: EventHandler[] = [];

  subscribe(handler: EventHandler): void {
    this.handlers.push(handler);
  }

  publish(events: readonly AppEvent[]): void {
    for (const event of events) {
      for (const handler of this.handlers) {
        handler(event);
      }
    }
  }
}
