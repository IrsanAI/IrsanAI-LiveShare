import { MapViewState } from "../domain/map/MapPort";
/**
 * LiveViewModel — UI Shell ViewModel, framework-agnostic
 * Kombiniert SessionView + MapViewState + MovementStatus tri-state
 * Für React + Vanilla + RN gleich
 */
export interface LiveViewModel extends MapViewState {
  shareUrl: string;
  tokenPreview: string; // last 4 chars only, never full token
  isStale: boolean;
  isPaused: boolean;
  personalityMessage?: string; // decoupled, injected
}
export const buildLiveViewModel = (state: MapViewState, sessionId: string, token: string): LiveViewModel => ({
  ...state,
  shareUrl: `https://irsanai.app/s/${sessionId}`,
  tokenPreview: `...${token.slice(-4)}`,
  isStale: state.status === "stale",
  isPaused: state.status === "paused",
});
