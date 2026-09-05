export type HostId = string;
export interface Host {
  id: HostId;
  displayName: string;
  avatarUrl?: string;
  createdAt: string;
}
export const createHost = (displayName: string, avatarUrl?: string): Host => {
  const host: Host = {
    id: `host_${Math.random().toString(36).slice(2,10)}`,
    displayName,
    createdAt: new Date().toISOString(),
  };
  if (avatarUrl) host.avatarUrl = avatarUrl;
  return host;
};
