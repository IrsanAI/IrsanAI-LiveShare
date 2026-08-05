interface InitialHostData {
  readonly sessionId: string;
  readonly shareUrl: string;
  readonly state: string;
  readonly label: string;
  readonly microcopy: string;
}

/**
 * Host Philosophy in practice: this page's only job is to turn button
 * presses and real device GPS into calls against the same application
 * services the CLI demo uses. No business logic lives here — it just
 * dispatches events (Golden Rule: "Buttons dispatch Events").
 */
export function renderHostPage(data: InitialHostData): string {
  const initialJson = JSON.stringify(data).replace(/</g, "\\u003c");

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>IrsanAI Live Share — Host</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #0b0d12; --surface: #15181f; --surface-2: #1c2029;
    --text: #f5f3ef; --muted: #8a8f9c; --line: rgba(255,255,255,0.08);
    --move: #ff8a3d; --calm: #5b8def; --warn: #e23d45; --dim: #4b5160;
  }
  * { box-sizing: border-box; }
  html, body {
    margin: 0; padding: 0;
    background: radial-gradient(120% 140% at 50% -10%, #1a1e27 0%, var(--bg) 55%);
    color: var(--text); min-height: 100vh; font-family: "Inter", system-ui, sans-serif;
  }
  body { display: flex; justify-content: center; padding: max(24px, env(safe-area-inset-top)) 16px 40px; }
  main { width: 100%; max-width: 420px; }
  .eyebrow {
    font-family: "JetBrains Mono", monospace; font-size: 11px; letter-spacing: 0.18em;
    color: var(--muted); text-transform: uppercase; margin-bottom: 18px;
  }
  .state-label { font-family: "JetBrains Mono", monospace; font-size: 13px; color: var(--muted); }
  .microcopy {
    font-family: "Space Grotesk", sans-serif; font-weight: 700;
    font-size: clamp(24px, 6.5vw, 30px); line-height: 1.15; margin: 2px 0 24px;
  }
  .card { background: var(--surface); border: 1px solid var(--line); border-radius: 18px; padding: 18px 20px; margin-bottom: 14px; }
  button {
    font-family: "Inter", sans-serif; font-weight: 600; font-size: 15px;
    border: none; border-radius: 12px; padding: 15px 18px; width: 100%;
    cursor: pointer; margin-bottom: 10px;
  }
  .btn-primary { background: var(--move); color: #1a0f05; }
  .btn-secondary { background: var(--surface-2); color: var(--text); border: 1px solid var(--line); }
  .btn-danger { background: transparent; color: var(--warn); border: 1px solid var(--warn); }
  button:disabled { opacity: 0.4; cursor: default; }
  .row { display: flex; gap: 8px; }
  .row button { flex: 1; }
  label { display: block; font-size: 12px; color: var(--muted); margin-bottom: 6px; }
  input[type="number"] {
    width: 100%; background: var(--surface-2); border: 1px solid var(--line); color: var(--text);
    border-radius: 10px; padding: 10px 12px; font-family: "JetBrains Mono", monospace; font-size: 14px;
    margin-bottom: 10px;
  }
  input[type="text"] {
    width: 100%; background: var(--surface-2); border: 1px solid var(--line); color: var(--text);
    border-radius: 10px; padding: 12px 14px; font-family: "Inter", sans-serif; font-size: 14px;
  }
  input[type="text"]:focus { outline: none; border-color: var(--move); }
  .suggestions { margin-top: 6px; border-radius: 12px; overflow: hidden; }
  .suggestions:empty { display: none; }
  .suggestion-row {
    padding: 12px 14px; font-size: 13px; cursor: pointer;
    background: var(--surface-2); border-bottom: 1px solid var(--line);
  }
  .suggestions .suggestion-row:first-child { border-radius: 12px 12px 0 0; }
  .suggestions .suggestion-row:last-child { border-bottom: none; border-radius: 0 0 12px 12px; }
  .suggestion-row.active, .suggestion-row:hover { background: rgba(255,138,61,0.14); }
  .coord-tag {
    display: block; margin-top: 3px; font-family: "JetBrains Mono", monospace;
    color: var(--move); font-size: 11px;
  }
  .selected-dest {
    display: flex; justify-content: space-between; align-items: center; gap: 10px;
    padding: 12px 14px; background: var(--surface-2); border-radius: 10px; margin-bottom: 10px; font-size: 13px;
  }
  .link-btn {
    background: none; border: none; color: var(--calm); font-size: 13px; font-weight: 600;
    cursor: pointer; padding: 0; width: auto; margin: 0; text-decoration: underline; flex-shrink: 0;
  }
  .share-url {
    font-family: "JetBrains Mono", monospace; font-size: 12px; color: var(--calm);
    word-break: break-all; padding: 12px 14px; background: var(--surface-2);
    border-radius: 10px; margin-bottom: 10px;
  }
  .hint { font-size: 12px; color: var(--muted); margin-top: -2px; margin-bottom: 12px; }
  footer { font-family: "JetBrains Mono", monospace; font-size: 11px; color: var(--dim); text-align: center; margin-top: 18px; }
</style>
</head>
<body>
<main>
  <div class="eyebrow">IrsanAI · Live Share — Host</div>
  <div class="state-label" id="stateLabel"></div>
  <div class="microcopy" id="microcopy"></div>

  <div class="card">
    <label>Link zum Teilen</label>
    <div class="share-url" id="shareUrl"></div>
    <button class="btn-secondary" id="copyBtn">Link kopieren</button>
  </div>

  <div class="card">
    <button class="btn-primary" id="startBtn">Standort teilen starten</button>
    <div class="row" id="activeControls" style="display:none">
      <button class="btn-secondary" id="pauseBtn">Pause</button>
      <button class="btn-secondary" id="resumeBtn" style="display:none">Fortsetzen</button>
      <button class="btn-danger" id="completeBtn">Beenden</button>
    </div>
    <div class="hint" id="gpsStatus" style="margin-top:10px">Noch nicht gestartet.</div>
  </div>

  <div class="card">
    <label>Ziel setzen (optional, für ETA)</label>
    <input type="text" id="destQuery" placeholder="Adresse oder Ort eingeben …" autocomplete="off" />
    <div class="suggestions" id="destSuggestions"></div>
    <div class="selected-dest" id="selectedDest" style="display:none">
      <span id="selectedDestLabel"></span>
      <button type="button" class="link-btn" id="clearDestBtn">Ändern</button>
    </div>
    <div class="hint">Geht auch direkt: Koordinaten als "48.1401, 11.5802" eingeben.</div>
  </div>

  <footer id="footer"></footer>
</main>

<script>
(function () {
  var data = ${initialJson};
  var watchId = null;

  document.getElementById("stateLabel").textContent = data.label;
  document.getElementById("microcopy").textContent = data.microcopy;
  document.getElementById("shareUrl").textContent = data.shareUrl;

  document.getElementById("copyBtn").addEventListener("click", function () {
    navigator.clipboard.writeText(data.shareUrl).then(function () {
      var btn = document.getElementById("copyBtn");
      var old = btn.textContent;
      btn.textContent = "Kopiert!";
      setTimeout(function () { btn.textContent = old; }, 1500);
    });
  });

  function api(path, body) {
    return fetch("/api/sessions/" + data.sessionId + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    }).then(function (res) {
      if (!res.ok) { throw new Error(path + " failed: " + res.status); }
      return res.json();
    });
  }

  function applyStateUpdate(resp) {
    if (resp && resp.label) { document.getElementById("stateLabel").textContent = resp.label; }
    if (resp && resp.microcopy) { document.getElementById("microcopy").textContent = resp.microcopy; }
  }

  function setGpsStatus(text) {
    document.getElementById("gpsStatus").textContent = text;
  }

  document.getElementById("startBtn").addEventListener("click", function () {
    if (!navigator.geolocation) {
      setGpsStatus("Dieser Browser unterstützt keine Standortfreigabe.");
      return;
    }
    api("/activate").then(function (resp) {
      applyStateUpdate(resp);
      document.getElementById("startBtn").style.display = "none";
      document.getElementById("activeControls").style.display = "flex";
      setGpsStatus("Warte auf GPS …");

      watchId = navigator.geolocation.watchPosition(
        function (pos) {
          api("/observations", {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracyMeters: pos.coords.accuracy || 10,
          }).then(function () {
            setGpsStatus("Zuletzt gesendet: " + new Date().toLocaleTimeString("de-DE") + " (±" + Math.round(pos.coords.accuracy || 0) + " m)");
          }).catch(function () {
            setGpsStatus("Senden fehlgeschlagen — Verbindung prüfen.");
          });
        },
        function (err) {
          setGpsStatus("GPS-Fehler: " + err.message + " (Standortzugriff erlaubt?)");
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
      );
    });
  });

  document.getElementById("pauseBtn").addEventListener("click", function () {
    api("/pause").then(function (resp) {
      applyStateUpdate(resp);
      document.getElementById("pauseBtn").style.display = "none";
      document.getElementById("resumeBtn").style.display = "block";
    });
  });

  document.getElementById("resumeBtn").addEventListener("click", function () {
    api("/resume").then(function (resp) {
      applyStateUpdate(resp);
      document.getElementById("resumeBtn").style.display = "none";
      document.getElementById("pauseBtn").style.display = "block";
    });
  });

  document.getElementById("completeBtn").addEventListener("click", function () {
    if (watchId !== null) { navigator.geolocation.clearWatch(watchId); }
    api("/complete").then(function (resp) {
      applyStateUpdate(resp);
      setGpsStatus("Beendet.");
      document.getElementById("activeControls").style.display = "none";
    });
  });

  (function () {
    var destQuery = document.getElementById("destQuery");
    var suggestionsEl = document.getElementById("destSuggestions");
    var selectedDest = document.getElementById("selectedDest");
    var selectedDestLabel = document.getElementById("selectedDestLabel");
    var clearDestBtn = document.getElementById("clearDestBtn");

    var COORD_RE = /^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/;
    var debounceTimer = null;
    var currentSuggestions = [];
    var activeIndex = -1;
    var searchSeq = 0;

    function clearSuggestions() {
      suggestionsEl.innerHTML = "";
      currentSuggestions = [];
      activeIndex = -1;
    }

    function renderSuggestions() {
      suggestionsEl.innerHTML = "";
      currentSuggestions.forEach(function (s, i) {
        var row = document.createElement("div");
        row.className = "suggestion-row" + (i === activeIndex ? " active" : "");
        row.textContent = s.label;
        if (s.isCoordinate) {
          var tag = document.createElement("span");
          tag.className = "coord-tag";
          tag.textContent = "Direkte Koordinaten";
          row.appendChild(tag);
        }
        row.addEventListener("click", function () { selectSuggestion(i); });
        suggestionsEl.appendChild(row);
      });
    }

    function selectSuggestion(i) {
      var s = currentSuggestions[i];
      if (!s) { return; }
      api("/destination", { latitude: s.latitude, longitude: s.longitude }).then(function () {
        selectedDestLabel.textContent = s.label;
        selectedDest.style.display = "flex";
        destQuery.style.display = "none";
        clearSuggestions();
      });
    }

    destQuery.addEventListener("input", function () {
      var value = destQuery.value;
      clearTimeout(debounceTimer);

      var coordMatch = value.match(COORD_RE);
      if (coordMatch) {
        currentSuggestions = [{
          label: "Ziel: " + coordMatch[1] + ", " + coordMatch[2],
          latitude: parseFloat(coordMatch[1]),
          longitude: parseFloat(coordMatch[2]),
          isCoordinate: true,
        }];
        activeIndex = 0;
        renderSuggestions();
        return;
      }

      if (value.trim().length < 3) {
        clearSuggestions();
        return;
      }

      debounceTimer = setTimeout(function () {
        var seq = ++searchSeq;
        fetch("/api/places/search?q=" + encodeURIComponent(value))
          .then(function (res) { return res.json(); })
          .then(function (results) {
            if (seq !== searchSeq) { return; } // a newer keystroke already fired — drop this stale response
            currentSuggestions = results;
            activeIndex = results.length > 0 ? 0 : -1;
            renderSuggestions();
          })
          .catch(function () { /* search hiccup — leave the field usable, just no suggestions this round */ });
      }, 300);
    });

    destQuery.addEventListener("keydown", function (e) {
      if (currentSuggestions.length === 0) { return; }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        activeIndex = Math.min(activeIndex + 1, currentSuggestions.length - 1);
        renderSuggestions();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        activeIndex = Math.max(activeIndex - 1, 0);
        renderSuggestions();
      } else if (e.key === "Enter") {
        e.preventDefault();
        selectSuggestion(activeIndex >= 0 ? activeIndex : 0);
      } else if (e.key === "Escape") {
        clearSuggestions();
      }
    });

    clearDestBtn.addEventListener("click", function () {
      selectedDest.style.display = "none";
      destQuery.style.display = "block";
      destQuery.value = "";
      destQuery.focus();
      clearSuggestions();
    });
  })();

  document.getElementById("footer").textContent = "Session " + data.sessionId;
})();
</script>
</body>
</html>`;
}
