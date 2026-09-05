import { DomainEvent } from "../../domain/shared/DomainEvent";
/**
 * AuditTrail — Root-Ascent 2030 EU AI Act Art.53 + Traceability
 * Append-only, jeder DomainEvent wird geloggt mit who/when/what
 * DAD: Mensch Supervisor sieht Audit, Agent Executor schreibt Audit
 */
export interface AuditEntry {
  timestamp: Date;
  event: DomainEvent;
  actorId?: string;
  correlationId: string;
  hashPrev?: string; // simple chain for tamper evidence
}
export interface AuditPort {
  append(entry: AuditEntry): Promise<void>;
  findBySessionId(sessionId: string): Promise<AuditEntry[]>;
  exportJson(): Promise<string>; // for EU AI Act disclosure
}
