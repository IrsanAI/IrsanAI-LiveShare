import { Track } from "./Track";

export interface TrackingRepository {
  save(track: Track): Promise<void>;
  findBySessionId(sessionId: string): Promise<Track | undefined>;
}
