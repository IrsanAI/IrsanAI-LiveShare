# IrsanAI Live Share — Session + Tracking + Sharing + Viewer Domain Scaffold

Local-first, session-driven live sharing. The Session is the product; the map
is just one view of it. This scaffold implements Golden Rule #1 (**Session
First**), the Tracking chain ("GPS creates observations. Observations create
Events. Events update Session."), Sharing security ("Tokens must be random,
revocable, expirable. Never expose internal IDs."), the Viewer Experience
("Where? Going where? How long? Still moving?"), and the Personality Layer as
proof that presentation stays decoupled from business logic.

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
  ui/personality/          Classic / Street / Minimal microcopy — imports domain types, never the reverse
  ui/viewer/                renderViewerScreen — formats a SessionView; makes zero decisions of its own
  demo.ts                  Full walkthrough: link issued at Ready, three viewer snapshots, GPS + ETA,
                            pause, revoke, expiry
```

Run it:

```bash
npm install
npm run demo
```

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

**Clock is a port.** Both `SharingApplicationService` and
`ViewerApplicationService` take a `Clock` instead of calling `new Date()`
directly — `SystemClock` for real use, `ManualClock` in the demo, so GPS
timestamps, link expiry, and "is this position stale" all agree on what time
it is without a real `sleep()`.

**Personality and rendering stay out of domain logic.** No domain event
carries copy. `PersonalityTheme.ts` maps state → microcopy per theme;
`renderViewerScreen` formats a `SessionView` into text. Neither makes a
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

## Not yet built

`routing`, `host`, `transport` (the live-update delivery mechanism —
WebSocket/BroadcastChannel/polling, abstracted the same way maps are meant to
be), `storage` beyond in-memory, the real map renderer, and an actual UI
shell (`renderViewerScreen` returns text — a React/RN screen would call
`ViewerApplicationService` the same way and render the same `SessionView`).
