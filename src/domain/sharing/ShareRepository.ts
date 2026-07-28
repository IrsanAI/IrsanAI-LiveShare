import { ShareLink } from "./ShareLink";

export interface ShareRepository {
  save(link: ShareLink): Promise<void>;
  findByTokenValue(tokenValue: string): Promise<ShareLink | undefined>;
}
