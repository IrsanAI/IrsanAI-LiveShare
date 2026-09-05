import { LiveViewModel } from "../LiveViewModel";
/**
 * VanillaRenderer — für irsa_live_cockpit.html ohne React, zero build step
 */
export class VanillaRenderer {
  constructor(private containerId: string = "live-view") {}
  render(vm: LiveViewModel): void {
    const el = typeof document !== "undefined" ? document.getElementById(this.containerId) : null;
    if (!el) {
      console.log(`[Vanilla] ${vm.status} | ${vm.message} | ${vm.shareUrl} | ETA ${vm.etaSeconds ? Math.round((vm.etaSeconds/60))+"min" : "?"}`);
      return;
    }
    el.innerHTML = `
      <div style="font-family:system-ui;padding:16px;border-radius:12px;background:#111;color:#eee">
        <div style="font-size:12px;opacity:.6">${vm.shareUrl} ${vm.tokenPreview}</div>
        <div style="font-size:20px;margin:8px 0">${vm.message}</div>
        <div>Status: ${vm.status} ${vm.isStale ? "(Verbindung prüfen — nicht Person!)" : ""}</div>
        <div>Verbleibend: ${vm.remainingMeters ? Math.round(vm.remainingMeters)+"m" : "-"} | ETA: ${vm.etaSeconds ? Math.round(vm.etaSeconds/60)+"min" : "?"}</div>
        ${vm.personalityMessage ? `<div style="margin-top:8px;font-style:italic">💬 ${vm.personalityMessage}</div>` : ""}
      </div>
    `;
  }
}
