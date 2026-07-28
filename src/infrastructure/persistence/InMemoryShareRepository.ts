import { ShareLink } from "../../domain/sharing/ShareLink";
import { ShareRepository } from "../../domain/sharing/ShareRepository";

export class InMemoryShareRepository implements ShareRepository {
  private links = new Map<string, ShareLink>();

  async save(link: ShareLink): Promise<void> {
    this.links.set(link.token.value, link);
  }

  async findByTokenValue(tokenValue: string): Promise<ShareLink | undefined> {
    return this.links.get(tokenValue);
  }
}
