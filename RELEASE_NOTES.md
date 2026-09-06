# v0.5.0 GAP CLOSED — Root-Ascent 2030 ready 💎

**Built entirely on smartphone (Termux) — from `>` chaos to 2030-ready**

### Von IST zu SOLL
Vor 2 Tagen: `routing, host, transport, storage, map renderer, UI shell, MCP, BYOK, Audit = Not yet built`
Jetzt: **Alle Gaps CLOSED, `npm run build` grün, Tag `v0.5.0`**

### ✅ Gaps Closed

| Domain | Was | Wie |
| :--- | :--- | :--- |
| **routing** | `RoutingService` pure function Haversine + ETA aus Track avgSpeed | Cost <15%, keine API |
| **host** | `Host` + `HostRepository` + `InMemoryHostRepository` + join/leave Events | DDD Port |
| **transport** | `TransportPort` → InMemory + BroadcastChannel + WebSocket + `isConnected()` stale detection | Same Port, EU-friendly |
| **storage** | `FileSystemSessionRepository` (Termux reboot-safe) + `LocalStorageSessionRepository` | Swap ohne Domain Touch |
| **map renderer** | `MapPort` → `TextMap` (Termux demo) + `Leaflet` (OSM, no key) + `Google` stub (BYOK) | Map is a Port! |
| **UI shell** | `LiveViewModel` framework-agnostic + `VanillaRenderer` + React `LiveView.tsx` | `https://irsanai.app/s/...` ready |
| **MCP Server** | `McpServer` + tools `create_session`, `add_position` | Agent = Executor, Mensch = Supervisor |
| **BYOK Ladder** | `OllamaProvider` (local, cost 0, privacy max) → `OpenRouterProvider` → `ByokLadder` | Keine Keys im Repo, EU data stays EU |
| **Audit + EU AI Act Art.53** | `AuditTrail` append-only JSONL + `hashPrev` chain + `exportJson()` | Disclosure ready |

### 🔒 Security & DDD Highlights
- Token 32-char ~192bits, **nie in URL**, `checkAccess()` → expired vs revoked als Event
- `MovementStatus` tri-state `moving|paused|stale` — `stale` = Verbindung prüfen, nicht Person!
- `GpsThrottlePolicy` = Domain Rule (battery matters)
- `SessionStatus` Draft → Ready → Active → Paused → Completed + illegal transition guard
- `exactOptionalPropertyTypes: true` grün — kein `string | undefined` Hack

### 📱 DAD Story
Mensch Supervisor + Agent Executor — geschmiedet auf Samsung + Termux:
`cat: Bad file descriptor`, `/proc/version` Block, `irsa_x5f_...` Doppel-Download, Heredoc zerbricht, `fatal: pathspec did not match`
→ **Buddy v3.0 Diamant** (`irsa_metabuddy.py` + Alias Manager `irsa/up/push/live`) hat alles ermöglicht

### 🏷️ Commits
- `a09cf79` host + WebSocket
- `6754dfc` type fixes
- `b12ef00` map renderer port
- `22b315c` GAP CLOSED
- `41433c1` build green → **v0.5.0**

Built with sweat, love, frustration, joy — on a phone.

**Next:** `irsa_live_cockpit.html` → `irsanai.app/s/...` deploy, MCP in Claude Desktop
