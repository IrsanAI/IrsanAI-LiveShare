import { Session } from "../../domain/session/Session";
import { SessionRepository } from "../../domain/session/SessionRepository";
export class LocalStorageSessionRepository implements SessionRepository {
  private prefix = "irsanai:session:";
  async save(session: Session): Promise<void> {
    const key = this.prefix + (session as any).id;
    localStorage.setItem(key, JSON.stringify((session as any).toJSON ? (session as any).toJSON() : session));
  }
  async findById(id: string): Promise<Session | undefined> {
    const raw = localStorage.getItem(this.prefix + id); if (!raw) return undefined;
    try { return JSON.parse(raw) as unknown as Session; } catch { return undefined; }
  }
}
