import { DomainEvent } from "../shared/DomainEvent";
import { Position } from "./Position";

export interface PositionRecorded extends DomainEvent {
  readonly type: "PositionRecorded";
  readonly position: Position;
}

export interface PositionRejected extends DomainEvent {
  readonly type: "PositionRejected";
  readonly reason: "throttled" | "out-of-order";
}

export interface EtaEstimated extends DomainEvent {
  readonly type: "EtaEstimated";
  readonly remainingMeters: number;
  readonly etaSeconds: number;
}

export type TrackingEvent = PositionRecorded | PositionRejected | EtaEstimated;

export function positionRecorded(sessionId: string, position: Position): PositionRecorded {
  return { type: "PositionRecorded", sessionId, position, occurredAt: new Date() };
}

export function positionRejected(
  sessionId: string,
  reason: "throttled" | "out-of-order"
): PositionRejected {
  return { type: "PositionRejected", sessionId, reason, occurredAt: new Date() };
}

export function etaEstimated(
  sessionId: string,
  remainingMeters: number,
  etaSeconds: number
): EtaEstimated {
  return { type: "EtaEstimated", sessionId, remainingMeters, etaSeconds, occurredAt: new Date() };
}
