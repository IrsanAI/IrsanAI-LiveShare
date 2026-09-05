import { Host, createHost } from "../../domain/host/Host";
import { HostRepository } from "../../domain/host/HostRepository";
import { SessionRepository } from "../../domain/session/SessionRepository";
import { createHostJoinedEvent } from "../../domain/host/HostEvents";
import { TransportPort } from "../../domain/transport/TransportPort";

export class HostApplicationService {
  constructor(
    private hostRepo: HostRepository,
    private sessionRepo: SessionRepository,
    private transport: TransportPort
  ) {}

  async createHost(displayName: string, avatarUrl?: string): Promise<Host> {
    const host = createHost(displayName, avatarUrl);
    await this.hostRepo.save(host);
    return host;
  }

  async joinSession(hostId: string, sessionId: string): Promise<void> {
    const host = await this.hostRepo.findById(hostId);
    const session = await this.sessionRepo.findById(sessionId);
    if (!host ||!session) throw new Error("Host or Session not found");
    const evt = createHostJoinedEvent(hostId, sessionId);
    await this.transport.publish(sessionId, evt as any);
  }
}
