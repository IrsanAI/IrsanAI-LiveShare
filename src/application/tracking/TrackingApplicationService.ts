import { Track } from "../../domain/tracking/Track";
import { Position } from "../../domain/tracking/Position";
import { TrackingRepository } from "../../domain/tracking/TrackingRepository";
import { InMemoryEventBus } from "../../infrastructure/events/InMemoryEventBus";

export class TrackingApplicationService {
  constructor(
    private readonly repository: TrackingRepository,
    private readonly eventBus: InMemoryEventBus
  ) {}

  async recordObservation(sessionId: string, position: Position): Promise<Track> {
    const track = await this.getOrCreateTrack(sessionId);
    track.recordObservation(position);
    await this.repository.save(track);
    this.eventBus.publish(track.pullDomainEvents());
    return track;
  }

  async setDestination(sessionId: string, destination: Position): Promise<Track> {
    const track = await this.getOrCreateTrack(sessionId);
    track.setDestination(destination);
    await this.repository.save(track);
    this.eventBus.publish(track.pullDomainEvents());
    return track;
  }

  private async getOrCreateTrack(sessionId: string): Promise<Track> {
    const existing = await this.repository.findBySessionId(sessionId);
    if (existing) {
      return existing;
    }
    const track = Track.create(sessionId);
    await this.repository.save(track);
    return track;
  }
}
