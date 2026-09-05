# Root-Ascent 2030 — Gap List CLOSED v0.5.0

IST (v0.1.0): routing, host, transport, storage, map renderer, UI shell, MCP, BYOK, Audit = Not yet built
SOLL (v0.5.0):

- routing ✅ RoutingService pure function Haversine + ETA
- host ✅ Host domain + HostRepository + InMemoryHostRepository
- transport ✅ TransportPort InMemory + BroadcastChannel + WebSocket (same Port, stale detection)
- storage ✅ FileSystemSessionRepository (Termux reboot-safe) + LocalStorageSessionRepository (browser)
- map renderer ✅ MapPort TextMap + Leaflet (OSM, EU, no key) + Google stub (BYOK) + MapApplicationService
- UI shell ✅ LiveViewModel + VanillaRenderer (irsa_live_cockpit.html) + React LiveView.tsx (framework-agnostic ViewModel)
- MCP Server ✅ McpServer + tools create_session, add_position (Agent as Executor, Mensch as Supervisor)
- BYOK Ladder ✅ LlmPort + OllamaProvider (local, cost 0) + OpenRouterProvider + ByokLadder fallback chain — no keys in repo, EU data stays EU
- Audit Trail + EU AI Act Art.53 ✅ AuditTrail Port + FileSystemAuditRepository JSONL append-only + hashPrev chain + exportJson() for disclosure

Cost-per-Task <15%: Ollama first, pure functions for routing/map/text, no mandatory cloud
DAD: Team Mensch Supervisor + Agent Executor + Schweiss/Liebe/Frust dokumentiert
