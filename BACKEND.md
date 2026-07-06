# Rove Hire — Backend Design Reference

Internal ATS backend. Standalone **Node + Express (TypeScript)** REST service, separate
from the Next.js frontend. This document is the source of truth for the backend: stack,
dependencies, file structure, data layer, types, middleware, helpers, and the full API
surface.

---

## 1. Stack of record

| Concern        | Choice                                             |
| -------------- | -------------------------------------------------- |
| Runtime        | Node.js 24                                          |
| Framework      | Express (REST)                                      |
| Language       | TypeScript                                          |
| Database       | Supabase Postgres (`jsonb` escape hatch for fuzzy fields) |
| File storage   | Cloudflare R2 (S3-compatible)                       |
| Auth           | Supabase Auth — frontend logs in, backend verifies JWT |
| PDF generation | `@react-pdf/renderer`                              |
| Validation     | Zod (per-route, whitelist fields)                  |
| Container      | Docker (multi-stage, `node:24-alpine`)             |

**Request pipeline:**
`app.ts → router → requireAuth → validate(zod) → sanitize/rate-limit → controller → service → db`
Controllers are thin (HTTP in/out only). All business logic + DB access lives in services.
The state-machine guards live in exactly one place: `services/stateMachine.ts`.

---

## 2. Quick start

```bash
# Install dependencies
npm install

# Development (tsx watch mode)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Docker
docker compose up --build
```

---

## 3. Environment variables

Copy `.env.example` to `.env` and fill in all values. The server validates every variable
at boot with Zod and **crashes fast** if any are missing.

---

## 4. API surface — `/api/v1`

All responses use the `{ data, error, meta }` envelope. All authed routes require a valid
Bearer JWT. File links are always signed, short-TTL URLs.

### Health
| Method | Path      | Auth | Response |
| ------ | --------- | ---- | -------- |
| GET    | `/health` | ❌   | `{ status: 'ok', timestamp }` |

### Auth
| Method | Path  | Auth | Response `data` |
| ------ | ----- | ---- | --------------- |
| GET    | `/me` | ✅   | `{ id, email }` |

### Jobs
| Method | Path        | Auth | Request body | Response `data` |
| ------ | ----------- | ---- | ------------ | --------------- |
| GET    | `/jobs`     | ✅   | —            | `[{ id, title, status, required_skills, candidate_count, created_at }]` |
| POST   | `/jobs`     | ✅   | `{ title, description, required_skills[], status }` | created job |
| GET    | `/jobs/:id` | ✅   | —            | full job |
| PATCH  | `/jobs/:id` | ✅   | `{ title?, description?, required_skills?, status? }` | updated job |

### Candidates
| Method | Path                        | Auth | Request | Response `data` |
| ------ | --------------------------- | ---- | ------- | --------------- |
| GET    | `/candidates`               | ✅   | query: `?status=&search=&page=&limit=` | list + pagination meta |
| POST   | `/candidates`               | ✅   | multipart: `name, email, job_opening_id, resume(file)` | `{ candidate, application_link }` |
| GET    | `/candidates/:id`           | ✅   | —       | `CandidateProfileDTO` |
| GET    | `/candidates/:id/resume`    | ✅   | —       | `{ url }` (signed) |
| POST   | `/candidates/:id/reject`    | ✅   | `{ reason }` | updated candidate |
| POST   | `/candidates/:id/hire`      | ✅   | —       | updated candidate |

### Public Application (NO auth)
| Method | Path            | Request body | Responses |
| ------ | --------------- | ------------ | --------- |
| GET    | `/apply/:token` | —            | `200 ApplyContextDTO` / `410` / `409` / `404` |
| POST   | `/apply/:token` | `{ phone, current_location, ... }` | `200` confirmation |

### Interviews
| Method | Path                          | Auth | Request body | Response `data` |
| ------ | ----------------------------- | ---- | ------------ | --------------- |
| POST   | `/candidates/:id/interviews`  | ✅   | `{ scheduled_at, type, interviewer_name, notes? }` | interview |
| GET    | `/interviews`                 | ✅   | —            | all interviews with candidate info |
| PATCH  | `/interviews/:id`             | ✅   | `{ outcome:'Completed', recommendation, feedback_note }` | updated interview |

### Offers
| Method | Path                          | Auth | Request body | Response `data` |
| ------ | ----------------------------- | ---- | ------------ | --------------- |
| POST   | `/candidates/:id/offers`      | ✅   | `{ role_title, salary_currency, salary_amount, start_date, manager_name, location }` | offer + download URLs |
| GET    | `/offers/:id/download?doc=offer\|nda` | ✅ | — | `{ url }` (signed) |

---

## 5. Status state machine

```
Applied ──────────────► Form Submitted        (candidate submits public form)
Form Submitted ────────► Interview Scheduled   (HR schedules interview)
Interview Scheduled ───► Offer Sent            (GUARD: ≥1 completed interview)
Offer Sent ────────────► Hired                 (GUARD: ≥1 offer exists)
[any non-terminal] ────► Rejected              (GUARD: reason required)

Terminal: Hired, Rejected
```

---

## 6. Docker

Multi-stage build with `node:24-alpine`:
- **Stage 1 (builder):** Install all deps, compile TypeScript
- **Stage 2 (production):** Copy `dist/` + prod deps only, run as non-root `appuser`
- Healthcheck on `/api/v1/health`

```bash
# Build and run
docker compose up --build

# Just build image
docker build -t rove-hire-backend .
```
