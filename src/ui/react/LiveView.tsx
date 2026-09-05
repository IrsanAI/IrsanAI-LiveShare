import React from "react";
import { LiveViewModel } from "../LiveViewModel";
/**
 * React LiveView — UI Shell, same ViewModel as Vanilla
 * Usage: <LiveView vm={vm} onCenter={() => mapPort.centerOn(pos)} />
 */
export const LiveView: React.FC<{ vm: LiveViewModel; onCenter?: () => void }> = ({ vm, onCenter }) => {
  return (
    <div style={{ fontFamily: "system-ui", padding: 16, borderRadius: 12, background: "#111", color: "#eee" }}>
      <div style={{ fontSize: 12, opacity: 0.6 }}>{vm.shareUrl} {vm.tokenPreview}</div>
      <div style={{ fontSize: 20, margin: "8px 0" }}>{vm.message}</div>
      <div>Status: {vm.status} {vm.isStale ? "(Verbindung prüfen — nicht Person!)" : ""} {vm.isPaused ? "(pausiert — Akku?)" : ""}</div>
      <div>Verbleibend: {vm.remainingMeters ? `${Math.round(vm.remainingMeters)}m` : "-"} | ETA: {vm.etaSeconds ? `${Math.round(vm.etaSeconds/60)}min` : "?"}</div>
      {vm.personalityMessage && <div style={{ marginTop: 8, fontStyle: "italic" }}>💬 {vm.personalityMessage}</div>}
      {onCenter && <button onClick={onCenter} style={{ marginTop: 12, padding: "8px 12px", borderRadius: 8 }}>Zentrieren</button>}
    </div>
  );
};
