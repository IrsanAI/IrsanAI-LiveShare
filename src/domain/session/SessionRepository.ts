import { Session } from "./Session";

/**
 * Port. The domain defines this interface; infrastructure implements it.
 * Swapping storage (SQLite, IndexedDB, in-memory) never touches domain code.
 */
export interface SessionRepository {
  save(session: Session): Promise<void>;
  findById(id: string): Promise<Session | undefined>;
}
