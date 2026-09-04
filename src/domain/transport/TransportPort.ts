import { AppEvent } from "../../infrastructure/events/AppEvent";
export type TransportHandler = (event: AppEvent) => void;
export type Unsubscribe = () => void;
export interface TransportPort {
  publish(sessionId: string, event: AppEvent): Promise<void>;
  subscribe(sessionId: string, handler: TransportHandler): Unsubscribe;
  isConnected?(sessionId: string): boolean;
}
