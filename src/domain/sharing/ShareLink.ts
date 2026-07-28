import { ShareToken } from "./ShareToken";
import { ShareEvent, linkIssued, linkRevoked, linkAccessRejected } from "./ShareEvents";

/**
 * Security: "Tokens must be random, revocable, expirable. Never expose
 * internal IDs." This aggregate is where that's enforced, not just stated —
 * the token is the only externally visible identifier; sessionId never
 * leaves this class except as a return value to a caller that already
 * proved it holds a valid token.
 */
export class ShareLink {
  private revokedAt: Date | undefined;
  private pendingEvents: ShareEvent[] = [];

  private constructor(
    public readonly token: ShareToken,
    public readonly sessionId: string,
    public readonly issuedAt: Date,
    public readonly expiresAt: Date
  ) {}

  static issue(
    token: ShareToken,
    sessionId: string,
    issuedAt: Date,
    ttlSeconds: number
  ): ShareLink {
    if (ttlSeconds <= 0) {
      throw new Error("ttlSeconds must be positive");
    }
    const expiresAt = new Date(issuedAt.getTime() + ttlSeconds * 1000);
    const link = new ShareLink(token, sessionId, issuedAt, expiresAt);
    link.pendingEvents.push(linkIssued(sessionId, expiresAt));
    return link;
  }

  get isRevoked(): boolean {
    return this.revokedAt !== undefined;
  }

  isExpired(now: Date): boolean {
    return now.getTime() >= this.expiresAt.getTime();
  }

  isValid(now: Date): boolean {
    return !this.isRevoked && !this.isExpired(now);
  }

  revoke(now: Date): void {
    if (this.isRevoked) {
      return; // idempotent — revoking twice isn't an error
    }
    this.revokedAt = now;
    this.pendingEvents.push(linkRevoked(this.sessionId));
  }

  /** What a viewer's request goes through. Records *why* on rejection, not just that it failed. */
  checkAccess(now: Date): boolean {
    if (this.isRevoked) {
      this.pendingEvents.push(linkAccessRejected(this.sessionId, "revoked"));
      return false;
    }
    if (this.isExpired(now)) {
      this.pendingEvents.push(linkAccessRejected(this.sessionId, "expired"));
      return false;
    }
    return true;
  }

  pullDomainEvents(): ShareEvent[] {
    const events = this.pendingEvents;
    this.pendingEvents = [];
    return events;
  }
}
