import { Session } from "../../domain/session/Session";
import { SessionRepository } from "../../domain/session/SessionRepository";

/**
 * Local-first stand-in (Golden Rule #2). Swap for an IndexedDB/SQLite
 * adapter later without changing anything in domain/ or application/.
 */
export class InMemorySessionRepository implements SessionRepository {
  private sessions = new Map<string, Session>();

  async save(session: Session): Promise<void> {
    this.sessions.set(session.id, session);
  }

  async findById(id: string): Promise<Session | undefined> {
    return this.sessions.get(id);
  }
}
