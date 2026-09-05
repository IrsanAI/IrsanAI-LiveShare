import { Host, HostId } from "./Host";
export interface HostRepository {
  save(host: Host): Promise<void>;
  findById(id: HostId): Promise<Host | null>;
  findByDisplayName(name: string): Promise<Host | null>;
}
