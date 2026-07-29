export function renderLandingPage(): string {
  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>IrsanAI Live Share</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=Inter:wght@500&display=swap" rel="stylesheet">
<style>
  :root { --bg:#0b0d12; --move:#ff8a3d; --text:#f5f3ef; --muted:#8a8f9c; }
  * { box-sizing: border-box; }
  html, body { margin:0; height:100%; background: radial-gradient(120% 140% at 50% -10%, #1a1e27 0%, var(--bg) 55%); color: var(--text); font-family: "Inter", sans-serif; }
  body { display:flex; align-items:center; justify-content:center; padding:24px; }
  main { max-width: 360px; text-align:center; }
  h1 { font-family:"Space Grotesk",sans-serif; font-size: clamp(28px, 8vw, 36px); margin-bottom: 10px; }
  p { color: var(--muted); font-size: 14px; margin-bottom: 28px; }
  button {
    font-family:"Inter",sans-serif; font-weight:600; font-size:16px; border:none; border-radius:12px;
    padding:16px 20px; width:100%; background: var(--move); color:#1a0f05; cursor:pointer;
  }
  button:disabled { opacity: 0.5; }
</style>
</head>
<body>
<main>
  <h1>Bruder, alles bereit?</h1>
  <p>Eine Session starten und den Link mit einem Freund teilen.</p>
  <button id="startBtn">Neue Session starten</button>
</main>
<script>
document.getElementById("startBtn").addEventListener("click", function () {
  var btn = this;
  btn.disabled = true;
  btn.textContent = "Einen Moment …";
  fetch("/api/sessions/start", { method: "POST" })
    .then(function (res) { return res.json(); })
    .then(function (data) {
      window.location.href = "/host/" + data.sessionId + "?token=" + encodeURIComponent(data.token);
    });
});
</script>
</body>
</html>`;
}
