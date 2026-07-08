# Rove Hire — Supabase Setup (Database + Auth)

Step-by-step to stand up the database and auth for a **new** Supabase project (mid-2026),
which uses **asymmetric JWT signing keys (ES256)** by default. Order matters; do it top to
bottom.

---

## 1. Create the project

In the Supabase dashboard: **New project** → pick the org, name it `rove-hire`, set a strong
**database password** (save it in your password manager — you'll need it for direct DB
connections), choose the **region** closest to where the Express backend will deploy (lower
latency), and create. Wait for provisioning to finish.

---

## 2. Run the schema

Open **SQL Editor → New query**, paste the entire contents of `migrations/0001_init.sql`, and **Run**.

This creates the six tables (`job_openings`, `candidates`, `application_tokens`,
`interviews`, `offer_documents`, `timeline_events`) with their indexes, and **enables RLS on
all of them with no policies**.

> **Why RLS with no policies?** Supabase auto-exposes every table in the `public` schema
> over its Data API. Our architecture never reads tables from the browser — the frontend
> only uses Supabase for *auth*, and the Express backend talks to the DB with the **secret
> key**, which bypasses RLS. Enabling RLS with zero policies denies all direct
> anon/authenticated Data-API access while leaving our backend fully functional. Defense in
> depth for free. If Studio later flags "RLS enabled, no policies," that's intentional.

Verify in **Table Editor** that all six tables exist.

---

## 3. Configure Auth (internal tool — no public signups)

This is an HR-only internal tool, so we disable self-signup and create HR users by hand.

1. **Authentication → Sign In / Providers → Email:** ensure **Email** is enabled. Turn
   **Confirm email** off (or on if you want the confirm flow — off is fine for an internal
   demo since we create users pre-confirmed).
2. **Authentication → (Providers/Sign-up settings):** turn **"Allow new users to sign up"
   OFF.** Now the public can't create accounts; only you can.
3. **Create the HR user(s):** **Authentication → Users → Add user → Create new user**, set
   the email + password, and enable **Auto Confirm** so they can log in immediately. Make
   one for yourself to test the login flow.

> Menu labels shift occasionally; if a toggle isn't where described, look under
> **Authentication → Settings/Providers**. The functions above (enable email, disable
> signups, add user) are what matter.

---

## 4. Grab the keys and URLs

Go to **Project Settings → API** (and **Project Settings → API Keys**). A new project shows
the modern key pair; some also still show legacy keys. Grab these:

| You need                       | Where / label                                  | Goes to  |
| ------------------------------ | ---------------------------------------------- | -------- |
| **Project URL**                | Settings → API → "Project URL"                 | both     |
| **Publishable key**            | `sb_publishable_…` (or legacy "anon/public")   | frontend |
| **Secret key**                 | `sb_secret_…` (or legacy "service_role")       | backend  |

The **JWKS endpoint** (used by the backend to verify tokens) is derived from the URL — no
separate key to copy:
```
<PROJECT_URL>/auth/v1/.well-known/jwks.json
```

> You do **not** need a `SUPABASE_JWT_SECRET` for an asymmetric project. Verification uses
> the public keys at the JWKS endpoint above. (Confirm under **Project Settings → JWT**: it
> should show asymmetric signing keys, e.g. ES256. If a project were still on the legacy
> HS256 secret, we'd instead verify with that shared secret — but new projects are
> asymmetric.)

---

## 5. Wire the env vars

**Frontend `frontend/.env.local`:**
```
NEXT_PUBLIC_SUPABASE_URL=<PROJECT_URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<sb_publishable_… key>
NEXT_PUBLIC_API_BASE_URL=https://<express-host>/api/v1
```
(The frontend uses this key only for Supabase Auth calls — sign in, session, sign out.)

**Backend `backend/.env`:**
```
SUPABASE_URL=<PROJECT_URL>
SUPABASE_SECRET_KEY=<sb_secret_… key>     # DB access; bypasses RLS
# No SUPABASE_JWT_SECRET needed — verify via the JWKS endpoint below
SUPABASE_JWKS_URL=<PROJECT_URL>/auth/v1/.well-known/jwks.json
```
Never commit these. Only the `.example` templates go in git.

---

## 6. Backend JWT verification (correction to BACKEND.md)

Because the project is asymmetric, the plan in `BACKEND.md` was updated:

- **Dependency:** use **`jose`** instead of `jsonwebtoken` (jose has first-class remote-JWKS
  support and Web Crypto verification).
- **Remove** the `SUPABASE_JWT_SECRET` env var; **add** `SUPABASE_JWKS_URL`.

`middleware/requireAuth.ts` (shape):
```ts
import { createRemoteJWKSet, jwtVerify } from 'jose';

const JWKS = createRemoteJWKSet(new URL(env.SUPABASE_JWKS_URL));

// inside the middleware:
const token = bearerFromHeader(req);            // strip "Bearer "
const { payload } = await jwtVerify(token, JWKS, {
  issuer: `${env.SUPABASE_URL}/auth/v1`,
  audience: 'authenticated',
});
req.user = { id: payload.sub as string, email: payload.email as string };
// 401 on any verify failure
```

`createRemoteJWKSet` fetches and caches the public keys (the JWKS is also edge-cached ~10
min), so verification is local and fast after the first call, with no Auth-server round-trip
per request.

**Frontend login** stays simple: `supabase.auth.signInWithPassword(...)`, then attach
`session.access_token` as the `Authorization: Bearer` header on every call to the Express
API (this is exactly what the `lib/api/client.ts` interceptor does).

---

## 7. Smoke test the chain

1. Frontend: sign in with the HR user from step 3 — you get a session + `access_token`.
2. Copy that token, hit a protected backend route with `Authorization: Bearer <token>` —
   the `jose` middleware verifies it against the JWKS and returns `req.user`.
3. Backend → DB using the secret key → rows come back despite RLS being on (service role
   bypasses it).
4. Try the same backend route with a publishable/anon key or no token → **401** (RLS + auth
   both refuse). That refusal is the security working.

---

## 8. What we deliberately did NOT do

- **No RLS policies authored** — access is mediated entirely by the backend. If we ever let
  the browser read Supabase tables directly, we'd add per-role policies then.
- **No email confirmation / signup flow** — internal tool, users are created by hand.
- **No `hr_users` table** — identity comes from `auth.users` via the verified JWT
  (`sub` = user id, `email`), matching the BACKEND.md decision.
