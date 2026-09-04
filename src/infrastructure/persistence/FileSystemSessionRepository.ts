import { Session } from "../../domain/session/Session";
import { SessionRepository } from "../../domain/session/SessionRepository";
import * as fs from "fs"; import * as path from "path";
export class FileSystemSessionRepository implements SessionRepository {
  constructor(private baseDir: string = "./data/sessions") { if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true }); }
  async save(session: Session): Promise<void> {
    const file = path.join(this.baseDir, `${(session as any).id}.json`);
    const data = JSON.stringify((session as any).toJSON ? (session as any).toJSON() : session, null, 2);
    fs.writeFileSync(file, data, "utf-8");
  }
  async findById(id: string): Promise<Session | null> {
    const file = path.join(this.baseDir, `${id}.json`); if (!fs.existsSync(file)) return null;
    try { return JSON.parse(fs.readFileSync(file, "utf-8")) as unknown as Session; } catch { return null; }
  }
  async findAll(): Promise<Session[]> {
    if (!fs.existsSync(this.baseDir)) return [];
    const files = fs.readdirSync(this.baseDir).filter(f => f.endsWith(".json")); const out: Session[] = [];
    for (const f of files) { const s = await this.findById(f.replace(".json","")); if (s) out.push(s); }
    return out;
  }
}
