import { ThemeName } from "../personality/PersonalityTheme";

interface InitialViewerData {
  readonly token: string;
  readonly label: string;
  readonly microcopy: string;
  readonly state: string;
  readonly movement: string;
  readonly current: { latitude: number; longitude: number } | null;
  readonly destination: { latitude: number; longitude: number } | null;
  readonly remainingMeters: number | null;
  readonly etaSeconds: number | null;
  readonly asOf: string;
}

/**
 * Renders the full viewer HTML page. Server-side render for the first paint
 * (so it looks right even before JS runs), then inline JS polls
 * /api/s/:token/view every few seconds and patches the DOM — no reload,
 * no framework, just enough for a real phone to show a real live session.
 */
export function renderViewerPage(data: InitialViewerData, theme: ThemeName): string {
  const initialJson = JSON.stringify(data).replace(/</g, "\\u003c");

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>IrsanAI Live Share</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #0b0d12;
    --surface: #15181f;
    --surface-2: #1c2029;
    --text: #f5f3ef;
    --muted: #8a8f9c;
    --line: rgba(255,255,255,0.08);
    --move: #ff8a3d;
    --calm: #5b8def;
    --warn: #e23d45;
    --dim: #4b5160;
  }
  * { box-sizing: border-box; }
  html, body {
    margin: 0; padding: 0;
    background: radial-gradient(120% 140% at 50% -10%, #1a1e27 0%, var(--bg) 55%);
    color: var(--text);
    min-height: 100vh;
    font-family: "Inter", system-ui, sans-serif;
  }
  body {
    display: flex;
    justify-content: center;
    padding: max(24px, env(safe-area-inset-top)) 16px 32px;
  }
  main {
    width: 100%;
    max-width: 420px;
  }
  .eyebrow {
    font-family: "JetBrains Mono", monospace;
    font-size: 11px;
    letter-spacing: 0.18em;
    color: var(--muted);
    text-transform: uppercase;
    margin-bottom: 18px;
  }
  .headline-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 6px;
  }
  .pulse {
    width: 11px; height: 11px; border-radius: 50%;
    background: var(--dim);
    flex-shrink: 0;
    position: relative;
  }
  .pulse.moving { background: var(--move); }
  .pulse.paused { background: var(--calm); }
  .pulse.stale { background: var(--warn); animation: flicker 1.6s ease-in-out infinite; }
  .pulse.moving::after {
    content: ""; position: absolute; inset: -6px; border-radius: 50%;
    border: 1.5px solid var(--move);
    animation: ring 1.8s ease-out infinite;
  }
  @keyframes ring {
    0% { transform: scale(0.6); opacity: 0.9; }
    100% { transform: scale(1.9); opacity: 0; }
  }
  @keyframes flicker {
    0%, 100% { opacity: 1; } 50% { opacity: 0.25; }
  }
  .state-label {
    font-family: "JetBrains Mono", monospace;
    font-size: 13px;
    color: var(--muted);
    letter-spacing: 0.04em;
  }
  .microcopy {
    font-family: "Space Grotesk", sans-serif;
    font-weight: 700;
    font-size: clamp(26px, 7vw, 34px);
    line-height: 1.15;
    margin: 2px 0 28px;
  }
  .card {
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: 18px;
    padding: 18px 20px;
    margin-bottom: 14px;
  }
  .row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 11px 0;
    border-bottom: 1px solid var(--line);
  }
  .row:last-child { border-bottom: none; }
  .row-label {
    font-size: 13px;
    color: var(--muted);
  }
  .row-value {
    font-family: "JetBrains Mono", monospace;
    font-size: 14px;
    text-align: right;
  }
  .eta-block {
    display: flex;
    align-items: baseline;
    gap: 10px;
    padding: 4px 0 14px;
  }
  .eta-number {
    font-family: "Space Grotesk", sans-serif;
    font-weight: 700;
    font-size: 40px;
  }
  .eta-unit { color: var(--muted); font-size: 14px; }
  .eta-meters {
    font-family: "JetBrains Mono", monospace;
    color: var(--muted);
    font-size: 13px;
  }
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 7px 13px;
    border-radius: 999px;
    background: var(--surface-2);
    font-size: 13px;
    font-weight: 500;
  }
  .pill .dot { width: 7px; height: 7px; border-radius: 50%; }
  footer {
    font-family: "JetBrains Mono", monospace;
    font-size: 11px;
    color: var(--dim);
    text-align: center;
    margin-top: 20px;
    letter-spacing: 0.03em;
  }
  .gone {
    text-align: center;
    padding: 60px 20px;
  }
  .gone .microcopy { font-size: 22px; }
</style>
</head>
<body>
<main id="app">
  <div class="eyebrow">IrsanAI · Live Share</div>
  <div class="headline-row">
    <div class="pulse" id="pulse"></div>
    <div class="state-label" id="stateLabel"></div>
  </div>
  <div class="microcopy" id="microcopy"></div>

  <div class="card">
    <div class="row"><span class="row-label">Wo</span><span class="row-value" id="whereValue">—</span></div>
    <div class="row" id="destRow" style="display:none"><span class="row-label">Wohin</span><span class="row-value" id="destValue">—</span></div>
  </div>

  <div class="card" id="etaCard" style="display:none">
    <div class="eta-block">
      <span class="eta-number" id="etaMinutes">—</span>
      <span class="eta-unit">min</span>
      <span class="eta-meters" id="etaMeters"></span>
    </div>
  </div>

  <div class="card">
    <div class="row" style="border-bottom:none">
      <span class="row-label">Unterwegs</span>
      <span class="pill" id="movementPill"><span class="dot" id="movementDot"></span><span id="movementText">—</span></span>
    </div>
  </div>

  <footer id="footer">wird geladen …</footer>
</main>

<script>
(function () {
  var token = ${JSON.stringify(data.token)};
  var initial = ${initialJson};
  var pollTimer = null;

  function fmt(n) { return n.toFixed(4); }

  function movementMeta(m) {
    switch (m) {
      case "moving": return { cls: "moving", label: "Ja, live" };
      case "paused": return { cls: "paused", label: "Pausiert" };
      case "stale": return { cls: "stale", label: "Keine frischen Daten" };
      default: return { cls: "", label: "Noch nicht gestartet" };
    }
  }

  function render(v) {
    document.getElementById("pulse").className = "pulse " + movementMeta(v.movement).cls;
    document.getElementById("stateLabel").textContent = v.label;
    document.getElementById("microcopy").textContent = v.microcopy;

    document.getElementById("whereValue").textContent = v.current
      ? fmt(v.current.latitude) + ", " + fmt(v.current.longitude)
      : "noch keine Position";

    var destRow = document.getElementById("destRow");
    if (v.destination) {
      destRow.style.display = "flex";
      document.getElementById("destValue").textContent = fmt(v.destination.latitude) + ", " + fmt(v.destination.longitude);
    } else {
      destRow.style.display = "none";
    }

    var etaCard = document.getElementById("etaCard");
    if (v.etaSeconds !== null && v.remainingMeters !== null) {
      etaCard.style.display = "block";
      document.getElementById("etaMinutes").textContent = Math.max(1, Math.round(v.etaSeconds / 60));
      document.getElementById("etaMeters").textContent = "noch " + Math.round(v.remainingMeters) + " m";
    } else {
      etaCard.style.display = "none";
    }

    var mm = movementMeta(v.movement);
    document.getElementById("movementDot").style.background =
      mm.cls === "moving" ? "var(--move)" : mm.cls === "paused" ? "var(--calm)" : mm.cls === "stale" ? "var(--warn)" : "var(--dim)";
    document.getElementById("movementText").textContent = mm.label;

    var d = new Date(v.asOf);
    document.getElementById("footer").textContent = "Stand: " + d.toLocaleTimeString("de-DE");
  }

  function showGone() {
    clearInterval(pollTimer);
    var app = document.getElementById("app");
    app.innerHTML =
      '<div class="gone">' +
      '<div class="eyebrow">IrsanAI · Live Share</div>' +
      '<div class="microcopy">Dieser Link ist nicht mehr gültig.</div>' +
      '<div style="color:var(--muted);font-size:14px">Frag die Person, die geteilt hat, nach einem neuen Link.</div>' +
      '</div>';
  }

  function poll() {
    fetch("/api/s/" + encodeURIComponent(token) + "/view")
      .then(function (res) {
        if (res.status === 410) { showGone(); return; }
        if (!res.ok) { throw new Error("view fetch failed: " + res.status); }
        return res.json().then(render);
      })
      .catch(function (err) { console.error(err); });
  }

  render(initial);
  pollTimer = setInterval(poll, 3000);
})();
</script>
</body>
</html>`;
}
