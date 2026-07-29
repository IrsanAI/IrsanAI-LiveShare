import { SessionView } from "../../domain/viewer/SessionView";
import { getCopy, ThemeName } from "../personality/PersonalityTheme";

/** What the viewer page's poll loop receives. Formatting stays out of it — that's renderViewerScreen's job. */
export function toViewerJson(view: SessionView, theme: ThemeName) {
  const copy = getCopy(theme, view.state);
  return {
    sessionId: view.sessionId,
    state: view.state,
    movement: view.movement,
    label: copy.label,
    microcopy: copy.microcopy,
    current: view.current
      ? { latitude: view.current.latitude, longitude: view.current.longitude }
      : null,
    destination: view.destination
      ? { latitude: view.destination.latitude, longitude: view.destination.longitude }
      : null,
    remainingMeters: view.remainingMeters ?? null,
    etaSeconds: view.etaSeconds ?? null,
    distanceTraveledMeters: view.distanceTraveledMeters,
    asOf: view.asOf.toISOString(),
  };
}
