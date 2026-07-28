import { SessionRepository } from "../../domain/session/SessionRepository";
import { TrackingRepository } from "../../domain/tracking/TrackingRepository";
import { SessionView } from "../../domain/viewer/SessionView";
import { buildSessionView } from "../../domain/viewer/SessionViewBuilder";
import { Clock } from "../../domain/shared/Clock";
import { SharingApplicationService } from "../sharing/SharingApplicationService";

export class ViewerApplicationService {
  constructor(
    private readonly sharing: SharingApplicationService,
    private readonly sessionRepository: SessionRepository,
    private readonly trackingRepository: TrackingRepository,
    private readonly clock: Clock
  ) {}

  /** Token in, five-question answer out. Throws InvalidOrExpiredTokenError via sharing.resolve() if the link isn't live. */
  async openLink(rawToken: string): Promise<SessionView> {
    const sessionId = await this.sharing.resolve(rawToken);

    const session = await this.sessionRepository.findById(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found — link resolved to a session that no longer exists`);
    }

    const track = await this.trackingRepository.findBySessionId(sessionId);
    return buildSessionView(session, track, this.clock.now());
  }
}
