import { SessionState } from "../../domain/session/SessionState";

/**
 * Personality Layer: presentation only. Nothing in domain/ or application/
 * imports from here — this file could be deleted and the app would still
 * work correctly, just silently.
 *
 * Themes only cover the microcopy tier (start/success/reactions/onboarding).
 * Critical info — ETA, location, security, permissions — is handled
 * separately and stays neutral in every theme; that logic isn't here.
 */
export type ThemeName = "classic" | "street" | "minimal";

export interface StateCopy {
  readonly label: string;
  readonly microcopy: string;
}

const COPY: Readonly<Record<ThemeName, Record<SessionState, StateCopy>>> = {
  classic: {
    Draft: { label: "Draft", microcopy: "Session prepared." },
    Ready: { label: "Ready", microcopy: "Your link is live." },
    Active: { label: "Active", microcopy: "Tracking started." },
    Paused: { label: "Paused", microcopy: "Sharing paused." },
    Completed: { label: "Completed", microcopy: "Destination reached." },
    Revoked: { label: "Revoked", microcopy: "Session ended." },
    Expired: { label: "Expired", microcopy: "Session expired." },
  },
  street: {
    Draft: { label: "Draft", microcopy: "Alles vorbereitet." },
    Ready: { label: "Ready", microcopy: "Bruder, dein Link ist live." },
    Active: { label: "Unterwegs", microcopy: "Let's go – wir rollen." },
    Paused: { label: "Pause", microcopy: "Kurz Pause, alles entspannt." },
    Completed: { label: "Geschafft", microcopy: "Geschafft. Bin da." },
    Revoked: { label: "Beendet", microcopy: "Session beendet, alles gut." },
    Expired: { label: "Abgelaufen", microcopy: "Link ist ausgelaufen." },
  },
  minimal: {
    Draft: { label: "Draft", microcopy: "" },
    Ready: { label: "Ready", microcopy: "Live." },
    Active: { label: "Active", microcopy: "" },
    Paused: { label: "Paused", microcopy: "" },
    Completed: { label: "Done", microcopy: "Arrived." },
    Revoked: { label: "Ended", microcopy: "" },
    Expired: { label: "Expired", microcopy: "" },
  },
};

export function getCopy(theme: ThemeName, state: SessionState): StateCopy {
  return COPY[theme][state];
}
