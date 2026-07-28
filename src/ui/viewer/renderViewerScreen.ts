import { SessionView, MovementStatus } from "../../domain/viewer/SessionView";
import { getCopy, ThemeName } from "../personality/PersonalityTheme";

/**
 * UI Philosophy: "The UI never owns business logic. It renders Session
 * State... Nothing else." This function takes a SessionView (already
 * fully decided by the domain) and a theme, and only ever formats —
 * it makes no decisions about what's true.
 */
export function renderViewerScreen(view: SessionView, theme: ThemeName): string {
  const copy = getCopy(theme, view.state);
  const lines: string[] = [`${copy.label} — ${copy.microcopy}`];

  lines.push(view.current ? formatLocation("Wo", view.current) : "Wo: noch keine Position");

  if (view.destination) {
    lines.push(formatLocation("Wohin", view.destination));
  }

  if (view.remainingMeters !== undefined && view.etaSeconds !== undefined) {
    const minutes = Math.max(1, Math.round(view.etaSeconds / 60));
    lines.push(`Wie lange: noch ${Math.round(view.remainingMeters)} m, ~${minutes} min`);
  }

  lines.push(`Unterwegs: ${movementLabel(view.movement)}`);

  return lines.join("\n");
}

function formatLocation(label: string, position: { latitude: number; longitude: number }): string {
  return `${label}: ${position.latitude.toFixed(4)}, ${position.longitude.toFixed(4)}`;
}

function movementLabel(status: MovementStatus): string {
  switch (status) {
    case "moving":
      return "ja, live";
    case "paused":
      return "pausiert";
    case "stale":
      return "keine frischen Daten";
    case "unknown":
      return "noch nicht gestartet";
  }
}
