import { DomainEvent } from "../shared/DomainEvent";

export interface LinkIssued extends DomainEvent {
  readonly type: "LinkIssued";
  readonly expiresAt: Date;
}

export interface LinkRevoked extends DomainEvent {
  readonly type: "LinkRevoked";
}

export interface LinkAccessRejected extends DomainEvent {
  readonly type: "LinkAccessRejected";
  readonly reason: "expired" | "revoked";
}

export type ShareEvent = LinkIssued | LinkRevoked | LinkAccessRejected;

export function linkIssued(sessionId: string, expiresAt: Date): LinkIssued {
  return { type: "LinkIssued", sessionId, expiresAt, occurredAt: new Date() };
}

export function linkRevoked(sessionId: string): LinkRevoked {
  return { type: "LinkRevoked", sessionId, occurredAt: new Date() };
}

export function linkAccessRejected(
  sessionId: string,
  reason: "expired" | "revoked"
): LinkAccessRejected {
  return { type: "LinkAccessRejected", sessionId, reason, occurredAt: new Date() };
}
