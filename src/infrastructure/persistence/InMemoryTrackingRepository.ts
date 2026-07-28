import { Track } from "../../domain/tracking/Track";
import { TrackingRepository } from "../../domain/tracking/TrackingRepository";

export class InMemoryTrackingRepository implements TrackingRepository {
  private tracks = new Map<string, Track>();

  async save(track: Track): Promise<void> {
    this.tracks.set(track.sessionId, track);
  }

  async findBySessionId(sessionId: string): Promise<Track | undefined> {
    return this.tracks.get(sessionId);
  }
}
