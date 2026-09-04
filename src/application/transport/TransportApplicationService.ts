import { TransportPort } from "../../domain/transport/TransportPort";
import { SessionRepository } from "../../domain/session/SessionRepository";
export class TransportApplicationService {
  constructor(private transport: TransportPort, private sessionRepo: SessionRepository) {}
  async notifyViewers(sessionId: string): Promise<void> {
    const s = await this.sessionRepo.findById(sessionId); if (!s) return;
    await this.transport.publish(sessionId, { type: "session.updated" as any, sessionId, occurredAt: new Date().toISOString(), eventId: `evt_${Math.random().toString(36).slice(2)}` } as any);
  }
}
