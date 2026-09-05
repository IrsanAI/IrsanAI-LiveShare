import { DomainEvent } from "../shared/DomainEvent";
export type HostId = string;
export interface Host {
  id: HostId;
  displayName: string;
  avatarUrl?: string;
  createdAt: string;
}
export const createHost = (displayName: string, avatarUrl?: string): Host => ({
  id: `host_${Math.random().toString(36).slice(2,10)}`,
  displayName,
  avatarUrl,
  createdAt: new Date().toISOString(),
});
