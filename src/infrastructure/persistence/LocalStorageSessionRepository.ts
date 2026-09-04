import { Session } from "../../domain/session/Session";
import { SessionRepository } from "../../domain/session/SessionRepository";
export class LocalStorageSessionRepository implements SessionRepository {
  private prefix = "irsanai:session:";
  async save(session: Session): Promise<void> {
    const key = this.prefix + (session as any).id;
    localStorage.setItem(key, JSON.stringify((session as any).toJSON ? (session as any).toJSON() : session));
  }
  async findById(id: string): Promise<Session | null> {
    const raw = localStorage.getItem(this.prefix + id); if (!raw) return null;
    try { return JSON.parse(raw) as unknown as Session; } catch { return null; }
  }
  async findAll(): Promise<Session[]> {
    const out: Session[] = []; for (let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(k?.startsWith(this.prefix)){ const s=await this.findById(k.slice(this.prefix.length)); if(s) out.push(s); } } return out;
  }
}
