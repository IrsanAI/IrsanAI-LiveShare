# IrsanAI Live Share — Session + Tracking + Sharing + Viewer Domain Scaffold

Local-first, session-driven live sharing. The Session is the product; the map
is just one view of it. This scaffold implements Golden Rule #1 (**Session
First**), the Tracking chain ("GPS creates observations. Observations create
Events. Events update Session."), Sharing security ("Tokens must be random,
revocable, expirable. Never expose internal IDs."), the Viewer Experience
("Where? Going where? How long? Still moving?"), and the Personality Layer as
proof that presentation stays decoupled from business logic. It also now
includes a minimal HTTP server so you can test the whole thing on a real
phone, not just via the console demo.

## What's here

```
src/
  domain/shared/           DomainEvent, Clock — the shapes every domain module builds on
  domain/session/          Session entity, state machine, events, port (SessionRepository)
  domain/tracking/         Position (Haversine distance), GpsThrottlePolicy, Track aggregate, events, port
  domain/sharing/          ShareToken, ShareLink aggregate (expiry/revoke/access-check), events, ports
  domain/viewer/           SessionView (the five-question read model), buildSessionView — a pure projection
  application/session/     SessionApplicationService
  application/tracking/    TrackingApplicationService
  application/sharing/     SharingApplicationService — create / resolve / revoke a link
  application/viewer/      ViewerApplicationService — token in, SessionView out
  infrastructure/          In-memory repository + event bus adapters, CryptoTokenGenerator,
                           SystemClock / ManualClock, AppEvent (composes all event families)
  interfaces/http/         server.ts — Express driving adapter: real HTTP routes calling the
                           same application services the CLI demo uses, nothing more
  ui/personality/          Classic / Street / Minimal microcopy — imports domain types, never the reverse
  ui/viewer/               renderViewerScreen (text, for the CLI demo), renderViewerPage (HTML,
                           for a phone browser), toViewerJson (what the page polls)
  ui/host/                 renderHostPage — the "you, sharing your real location" control screen
  ui/landing/              renderLandingPage — one button, starts a session
  demo.ts                  Scripted walkthrough with a ManualClock: link issued at Ready, three
                           viewer snapshots, GPS + ETA, pause, revoke, expiry
```

## Run the console demo

```bash
npm install
npm run demo
```

## Test it live, on an actual phone

```bash
npm install
npm start
```

This starts a real HTTP server (Express, `SystemClock` — real wall-clock
time, not the demo's `ManualClock`) on port 3000, binding to `0.0.0.0` so
other devices on your network can reach it.

1. On the laptop, open `http://localhost:3000` — that's the **host** side.
   Tap **"Neue Session starten"**; it creates a session, moves it to `Ready`,
   and issues a share link, then takes you to the host control page.
2. Tap **"Standort teilen starten"**. Your browser will ask for location
   permission — allow it. It calls `activate`, then starts pushing your
   *real* device GPS to the session (`navigator.geolocation.watchPosition`,
   throttled the same way any GPS source is, via `GpsThrottlePolicy`).
   Optionally set a destination in the same card below — type a place name
   for live search suggestions, or type coordinates directly as
   `48.1401, 11.5802`; either way it's the same `/destination` call.
3. Copy the share link shown on that page. To open it from your **phone**,
   both devices need to be on the same Wi-Fi, and the phone needs your
   laptop's LAN IP instead of `localhost` (localhost on the phone means the
   phone itself, not your laptop):
   - macOS: `ipconfig getifaddr en0` (or `en1` on some Macs/adapters)
   - Linux: `hostname -I`
   - Windows: `ipconfig` → look for "IPv4 Address" under your active adapter
   - Then open `http://<that-IP>:3000` on the phone instead of `localhost`,
     and swap the same IP into the share link's host part.
4. The phone shows the **viewer** screen (`/s/:token`) — polls every 3
   seconds, no reload. Move around with the host device and watch "Wo" /
   "Wie lange" / "Unterwegs" update live. Pause on the host page and watch
   the viewer switch to "pausiert" within a few seconds.

If you'd rather host *from* the phone (using the phone's own GPS) and watch
from the laptop, same flow, just swap which device opens `/` vs. the share
link — nothing in the code cares which physical device plays which role.

## Design decisions worth flagging

**State machine shape.** The directive draws the states as one straight line.
A straight line can't express a working session, so this treats it as a small
graph instead: `Paused` can resume to `Active`; `Revoked`/`Expired` can cut in
from `Ready`, `Active`, or `Paused`; `Completed`/`Revoked`/`Expired` are
terminal. See the comment in `SessionState.ts`.

**Session, Tracking, and Sharing don't know about each other — Viewer is the
one exception, on purpose.** All events extend the same `DomainEvent` shape
from `domain/shared/`, and modules reference a session only by its
`sessionId` string. `domain/viewer/SessionViewBuilder.ts` is the one file
allowed to import `Session` and `Track` directly, because composing their
public state into a single read model is literally what the Viewer module is
for — it only reads getters, never mutates, and Session/Tracking still have
no idea it exists. Documented right in that file's header comment.

**The token is the only externally visible identifier.** `ShareLink` stores
`sessionId` internally but a viewer only ever holds a `ShareToken` (32-char
base64url, ~192 bits from Node's `crypto.randomBytes`). `resolve()` is the
one function that turns a token back into a sessionId, and only for a token
that's currently valid — see `checkAccess()` in `ShareLink.ts`, which records
*why* a check failed (`expired` vs `revoked`) as a domain event.

**"Still moving?" is a tri-state, not a boolean.** `MovementStatus` is
`moving | paused | stale | unknown` — `Paused` state maps straight to
`paused`; `Active` with a recent GPS fix is `moving`; `Active` with an *old*
fix is `stale` (the honest answer when the connection is the problem, not the
person); anything else is `unknown`. A plain `isMoving: boolean` would have
hidden the "data's stuck" case that a friend most wants to know about.

**GPS throttling is a domain rule, not a device detail.** The directive's
Performance section says "Throttle GPS... battery matters" — that's a
business decision about which observations are worth an event, so
`GpsThrottlePolicy` lives in `domain/tracking/`.

**Clock is a port.** `SharingApplicationService` and `ViewerApplicationService`
take a `Clock` instead of calling `new Date()` directly — `SystemClock` for
the HTTP server and real use, `ManualClock` in the console demo, so GPS
timestamps, link expiry, and "is this position stale" all agree on what time
it is.

**The HTTP layer is a driving adapter, not a new place for logic.**
`interfaces/http/server.ts` only ever does three things per route: read the
request, call an application service, shape the response. Session state
transitions, throttling, ETA math, and token validity all still happen in
`domain/` exactly as they do for the console demo — the server is a second
front door onto the same building, not a different building.

**Place search is a port too, for the same reason maps are.** The directive's
Map Philosophy says changing map provider must never touch domain code —
`domain/routing/PlaceSearchProvider.ts` extends that same idea to *finding*
a place, not just rendering one. `infrastructure/geocoding/
PhotonPlaceSearchProvider.ts` is the current adapter (Photon/OSM — free, no
API key, and unlike raw Nominatim, explicitly built for type-ahead search).
`GET /api/places/search` in the HTTP layer calls the port directly with no
application-service layer in between — there's no invariant to protect in
"proxy a text query to a geocoder," so adding one would be ceremony, not
architecture. The destination field on the host page accepts *either* a
place search or raw "lat, lng" typed directly — both end up calling the same
existing `/api/sessions/:id/destination` endpoint, which never changed.
Track still only holds one destination; multiple waypoints would mean an
ordered list on the aggregate and a redefined ETA (next stop vs. final) —
a real extension, not implemented here, flagged in case you want it next.

**Personality and rendering stay out of domain logic.** No domain event
carries copy. `PersonalityTheme.ts` maps state → microcopy per theme;
`renderViewerScreen`/`renderViewerPage`/`renderHostPage` format a
`SessionView` (or session state) into text or HTML. None of them make a
decision — they only display one already made in `domain/`.

## Bugs found and fixed since the last handoff

- `demo.ts` used `process.exit` without a local type declaration, breaking a
  build that didn't have `@types/node` resolved. Fixed by declaring the
  minimal shape locally.
- `tsconfig.json` pinned `moduleResolution: "node"`, which a fresh
  `npm install` resolves to TypeScript 5.9.3 — and 5.9 turns that legacy
  alias into a hard error instead of a warning. Removed the explicit setting
  and pinned the `typescript` devDependency to `^5.9.3`, the version this is
  actually tested against.
- `req.params.id` / `req.params.token` under `noUncheckedIndexedAccess` type
  as `string | undefined`, not `string` — added a small `requireParam()`
  helper instead of loosening the tsconfig for the whole project.
- The place search adapter is verified with a mocked Photon response (real
  data, real GeoJSON shape, checked lon/lat ordering and label fallbacks) —
  the sandbox this was built in can't reach `photon.komoot.io` itself
  (network allowlist), so the live call is untested from here. It's a
  public, unauthenticated, well-documented API; should work as-is on your
  laptop's normal internet connection, but it's the one piece worth an
  extra look when you test.

## Not yet built

`routing` beyond place search (turn-by-turn / path data), `storage` beyond
in-memory, the real map renderer, and a WebSocket/push transport (the server
currently uses client-side polling every 3s — simple and works fine for
testing, but a real app would want push so the phone isn't asking "anything
new?" on a timer). Multiple destinations/waypoints — see the design-decisions
note above.
