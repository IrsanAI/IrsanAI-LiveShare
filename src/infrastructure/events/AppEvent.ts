import { SessionEvent } from "../../domain/session/SessionEvents";
import { TrackingEvent } from "../../domain/tracking/TrackingEvents";
import { ShareEvent } from "../../domain/sharing/ShareEvents";

/**
 * domain/session, domain/tracking, and domain/sharing don't know about
 * each other. This union only exists here, in infrastructure, where the
 * event bus needs a concrete type to carry all three families.
 */
export type AppEvent = SessionEvent | TrackingEvent | ShareEvent;
