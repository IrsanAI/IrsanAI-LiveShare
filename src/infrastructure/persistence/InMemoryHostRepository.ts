import { Host, HostId } from "../../domain/host/Host";
import { HostRepository } from "../../domain/host/HostRepository";
export class InMemoryHostRepository implements HostRepository {
  private hosts = new Map<HostId, Host>();
  async save(host: Host): Promise<void> { this.hosts.set(host.id, host); }
  async findById(id: HostId): Promise<Host | null> { return this.hosts.get(id)?? null; }
  async findByDisplayName(name: string): Promise<Host | null> {
    for (const h of this.hosts.values()) if (h.displayName === name) return h;
    return null;
  }
}
