import { Session } from "../../domain/session/Session";
import { SessionRepository } from "../../domain/session/SessionRepository";
import { InMemoryEventBus } from "../../infrastructure/events/InMemoryEventBus";

/**
 * The only layer that knows about both the domain and the outside world.
 * UI code should only ever call methods here — never touch Session directly,
 * and never contain business logic itself (UI Philosophy: "Buttons dispatch
 * Events. Events update State. State updates UI. Nothing else.").
 */
export class SessionApplicationService {
  constructor(
    private readonly repository: SessionRepository,
    private readonly eventBus: InMemoryEventBus
  ) {}

  async createSession(id: string, hostId: string): Promise<Session> {
    const session = Session.create(id, hostId);
    await this.repository.save(session);
    return session;
  }

  async ready(id: string): Promise<Session> {
    return this.apply(id, (s) => s.ready());
  }

  async activate(id: string): Promise<Session> {
    return this.apply(id, (s) => s.activate());
  }

  async pause(id: string): Promise<Session> {
    return this.apply(id, (s) => s.pause());
  }

  async resume(id: string): Promise<Session> {
    return this.apply(id, (s) => s.resume());
  }

  async complete(id: string): Promise<Session> {
    return this.apply(id, (s) => s.complete());
  }

  async revoke(id: string): Promise<Session> {
    return this.apply(id, (s) => s.revoke());
  }

  async expire(id: string): Promise<Session> {
    return this.apply(id, (s) => s.expire());
  }

  private async apply(id: string, mutate: (session: Session) => void): Promise<Session> {
    const session = await this.repository.findById(id);
    if (!session) {
      throw new Error(`Session ${id} not found`);
    }
    mutate(session);
    await this.repository.save(session);
    this.eventBus.publish(session.pullDomainEvents());
    return session;
  }
}
