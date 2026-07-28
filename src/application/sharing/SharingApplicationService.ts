import { ShareLink } from "../../domain/sharing/ShareLink";
import { ShareToken } from "../../domain/sharing/ShareToken";
import { ShareRepository } from "../../domain/sharing/ShareRepository";
import { TokenGenerator } from "../../domain/sharing/TokenGenerator";
import { InvalidOrExpiredTokenError } from "../../domain/sharing/InvalidOrExpiredTokenError";
import { Clock } from "../../domain/shared/Clock";
import { InMemoryEventBus } from "../../infrastructure/events/InMemoryEventBus";

export class SharingApplicationService {
  constructor(
    private readonly repository: ShareRepository,
    private readonly tokenGenerator: TokenGenerator,
    private readonly clock: Clock,
    private readonly eventBus: InMemoryEventBus
  ) {}

  async createShareLink(sessionId: string, ttlSeconds: number): Promise<ShareLink> {
    const token = ShareToken.fromGenerated(this.tokenGenerator.generate());
    const link = ShareLink.issue(token, sessionId, this.clock.now(), ttlSeconds);
    await this.repository.save(link);
    this.eventBus.publish(link.pullDomainEvents());
    return link;
  }

  /** What a viewer opening the link calls. Returns the sessionId only for a token that is valid right now. */
  async resolve(rawToken: string): Promise<string> {
    const token = ShareToken.parse(rawToken);
    const link = await this.repository.findByTokenValue(token.value);
    if (!link) {
      throw new InvalidOrExpiredTokenError();
    }
    const granted = link.checkAccess(this.clock.now());
    await this.repository.save(link);
    this.eventBus.publish(link.pullDomainEvents());
    if (!granted) {
      throw new InvalidOrExpiredTokenError();
    }
    return link.sessionId;
  }

  async revoke(rawToken: string): Promise<void> {
    const token = ShareToken.parse(rawToken);
    const link = await this.repository.findByTokenValue(token.value);
    if (!link) {
      return;
    }
    link.revoke(this.clock.now());
    await this.repository.save(link);
    this.eventBus.publish(link.pullDomainEvents());
  }
}
