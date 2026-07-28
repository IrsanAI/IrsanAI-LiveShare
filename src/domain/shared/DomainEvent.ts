/**
 * Shared kernel: the one thing every domain event has in common.
 * domain/session and domain/tracking never import from each other —
 * only from this shared shape. Composition happens in infrastructure/.
 */
export interface DomainEvent {
  readonly type: string;
  readonly sessionId: string;
  readonly occurredAt: Date;
}
