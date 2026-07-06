# Refactor Report

Backend: Rove Hire ATS (Node + Express + TypeScript). Source of truth: `BACKEND.md`.

## Quality gate (final)
tsc: **PASS** | eslint: **PASS** | build: **PASS**

- `tsc --noEmit` (strict): 0 errors.
- `eslint .`: 0 errors, 0 warnings; no rules disabled.
- `npm run build`: compiles clean to `dist/`.
- 0 `console.*`, 0 `eslint-disable`, 0 `@ts-ignore`, 0 `any` in `src/`.

## Quality gate (baseline, before work)
tsc: **PASS** | eslint: **FAIL (no config file)** | build: **PASS**

- `tsc --noEmit` (strict) compiled clean.
- `eslint .` could not run: no `eslint.config.js` exists (ESLint 9 requires flat config).
- `npm run build` (tsc emit) compiles clean.

## Audit findings (Phase A)

### Deviations from BACKEND.md
- **No ESLint config.** The lint gate (Rule 2 / §4) cannot execute. Resolution: add a flat
  `eslint.config.js` using the already-present `@eslint/js`, `globals`, and
  `@typescript-eslint` parser/plugin. Not a spec change.
- **Extra route `GET /api/v1/health`** (`routes/index.ts`) is not in BACKEND.md §10. It is
  referenced by the Dockerfile `HEALTHCHECK`. Kept as intentional infra; flagged here.
- **`ok()` / `fail()` helper signatures** differ from the §8 sketch
  (`fail(code, message, details?)` returning an envelope object). Implementation takes
  `res` and writes the response directly. The frozen wire contract `{ data, error, meta }`
  is fully preserved, so this is an internal-helper divergence only. Not changed.

### Layering (§2)
- Controllers are thin (parse → one service call → `ok()`); no DB/SQL/business logic found
  in controllers. **OK.**
- Services own all business logic and DB access; no `req`/`res` reaches a service. **OK.**
- `services/stateMachine.ts` is the single source of transition truth; all status mutations
  route through `canTransition()`, and `allowed_actions` is produced only by
  `allowedActions()`. **OK.**
- Errors are typed (`lib/errors.ts`) and translated only by `errorHandler`. Edge middleware
  (`requireAuth`, `validate`, `notFound`, rate limiters) emit envelopes directly via the
  `fail()` helper — this is the request edge, not a service/controller error path, so it is
  consistent with §2. **OK.**

### Rule violations (to fix)
- **Comments** — ~400 comment lines across all 46 source files must be removed (Rule 1),
  keeping only single-line OWASP-rationale notes above security controls (§11 carve-out).
- **`console.*`** — `config/env.ts` uses `console.error` twice in the env fail-fast path
  (Rule 4). Resolution: write to `process.stderr` instead.
- **`any` leaks + `eslint-disable`** — `app.ts` (pino-http import) and `lib/pdf/render.ts`
  (x2, React element) use `as any` behind `eslint-disable` comments (Rule 2). Resolution:
  type these properly and delete the disables.
- **Inconsistent crypto import** — `candidates.service.ts` uses global `crypto.randomUUID()`
  while other files import `randomUUID` from `node:crypto`. Resolution: import explicitly.

### Dead code
- None found. `touchActivity` (candidates.service) is consumed by interviews.service.
  No unused files, exports, or dependencies detected.

### Secrets
- None hardcoded. All credentials/origins flow through validated `config/env.ts`. **OK.**

## Conformance (BACKEND.md §3) — verified during audit
- [x] `requireAuth` verifies Supabase JWT with `SUPABASE_JWT_SECRET`, attaches `req.user`.
- [x] Public `/apply` routes have no auth and use `publicLimiter`.
- [x] `helmet`, CORS locked to `FRONTEND_ORIGIN`, `hpp`, body-size limit, global limiter wired in `app.ts`.
- [x] `config/env.ts` validates env at boot and crashes on missing keys.
- [x] All documented routes exist with correct verbs/paths; no Jobs DELETE.
- [x] `GET /apply/:token` returns 200 / 410 EXPIRED / 409 ALREADY_USED / 404 INVALID.
- [x] Candidate create rejects a `Closed` job opening.
- [x] Resume upload enforces `application/pdf` + 10MB via multer (checked, not trusted).
- [x] Raw magic token only in `POST /candidates` response; DB stores SHA-256 hash; 14-day expiry; one-time `used_at`.
- [x] `POST /apply` sets `used_at`, transitions → Form Submitted, writes timeline event.
- [x] Scheduling an interview transitions → Interview Scheduled.
- [x] Completing an interview records feedback + timeline event, does NOT change candidate status.
- [x] Offer guard: `Interview Scheduled`+ AND ≥1 Completed interview; first offer → Offer Sent; subsequent append; blocked once Hired.
- [x] `reject` requires non-empty reason; `hire` requires ≥1 offer; both terminal + logged.
- [x] `last_activity_at` bumped on every candidate mutation.
- [x] No response exposes `token_hash`, raw R2 keys, service-role key, or JWT secret; public apply context is name + role only.

## Changes applied
- **Tooling**: Added `eslint.config.js` (ESLint 9 flat config: `@eslint/js` recommended +
  `@typescript-eslint` recommended, `no-explicit-any`/`no-console`/`no-unused-vars` as
  errors). Declared `@eslint/js` and `globals` in devDependencies (previously only
  transitive). Changed `lint` script from `eslint src/ --ext …` (unsupported in v9) to
  `eslint .`.
- **`any` leaks removed**: `app.ts` now uses the typed named import `{ pinoHttp }` instead of
  `pinoHttpModule as any`. `lib/pdf/render.ts` → renamed to `render.tsx` and rewritten with
  JSX (`<OfferLetter data={data} />`), which is assignable to `renderToBuffer`'s expected
  element type with no cast. All three `eslint-disable`/`as any` sites deleted.
- **`console.*` removed**: `config/env.ts` fail-fast now writes to `process.stderr` instead
  of `console.error`.
- **Consistency**: `candidates.service.ts` now imports `randomUUID` from `node:crypto`
  (was global `crypto.randomUUID()`), matching the other services.
- **Comments stripped** from all TS/TSX, leaving only single-line OWASP-rationale notes
  above security controls (§11 carve-out): API2/5 (requireAuth), API3 (validate, r2 signed
  URLs), API4 (limiters, upload), API6 (public limiter/apply), API7 (linkedin_url), API8
  (CORS lock, service-role/RLS, error handler).

## Removed
- comments: ~400 lines across 46 files (all non-OWASP-rationale)
- dead files: 0 | dead code/exports: 0 (touch+error taxonomy all reachable/spec-mandated)
- unused deps: none | console calls: 2 | eslint-disable: 3 | as-any: 3

## Flagged (no blocking decision required)
- **`GET /api/v1/health`** — not in BACKEND.md §10; kept because the Dockerfile `HEALTHCHECK`
  depends on it. Removing it would break container health probes.
- **`ok()`/`fail()` signatures** — differ from the §8 sketch (they take `res` and write)
  but preserve the frozen `{ data, error, meta }` wire contract. Left as-is.
- **`lib/errors.ts` `ForbiddenError`** — exported per BACKEND.md §8's error taxonomy but not
  currently thrown. Kept to match the spec'd `lib/errors.ts` surface rather than deleted as
  "unused"; does not affect any gate.
- **SQL (`migrations/001_init.sql`) and `.env.example` comments** — deliberately left intact.
  Rule 1 ("self-documenting code through naming and structure") targets the TS application
  code that the tsc/eslint gates govern; the DDL comments mirror BACKEND.md §5 (the
  authoritative schema) and the `.env` comments document each variable. Say the word and
  these will be stripped too.

## Needs human decision
- None. All ambiguities were resolvable within `BACKEND.md`; no schema changes, no contract
  contradictions, no missing security controls were encountered.
