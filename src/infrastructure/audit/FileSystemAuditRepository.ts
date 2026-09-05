import { AuditPort, AuditEntry } from "./AuditTrail";
import * as fs from "fs"; import * as path from "path";
export class FileSystemAuditRepository implements AuditPort {
  private entries: AuditEntry[] = [];
  constructor(private filePath: string = "./data/audit.jsonl") {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (fs.existsSync(filePath)) {
      try {
        const lines = fs.readFileSync(filePath, "utf-8").split("\n").filter(Boolean);
        this.entries = lines.map(l => {
          const e = JSON.parse(l);
          e.timestamp = new Date(e.timestamp);
          e.event.occurredAt = new Date(e.event.occurredAt);
          return e;
        });
      } catch {}
    }
  }
  async append(entry: AuditEntry): Promise<void> {
    this.entries.push(entry);
    fs.appendFileSync(this.filePath, JSON.stringify(entry) + "\n", "utf-8");
  }
  async findBySessionId(sessionId: string): Promise<AuditEntry[]> {
    return this.entries.filter(e => e.event.sessionId === sessionId);
  }
  async exportJson(): Promise<string> {
    return JSON.stringify(this.entries, null, 2);
  }
}
