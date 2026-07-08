# Frontend setup report

## Quality gate
tsc: PASS | lint: PASS | build: PASS | dev boot: PENDING USER

## Created
- Next.js 16.2.10 (App Router, src dir, import alias @/*)
- Dependencies: @reduxjs/toolkit, react-redux, @supabase/supabase-js, axios, react-hook-form, @hookform/resolvers, zod, lucide-react, sonner, react-markdown, date-fns, clsx, tailwind-merge, prettier, prettier-plugin-tailwindcss
- Structure: types/, lib/api/, lib/supabase/, lib/utils/, lib/constants/, store/slices/, providers/, components/ui/, components/layout/
- Theme tokens wired: yes (Tailwind v4 @theme inline — full palette, border-radii, font vars)
- Store + slices: auth, candidates, jobs, interviews, ui | API client: yes | Supabase + proxy: yes

## Routes
○ /                  (dashboard — static)
○ /_not-found        (branded 404)
○ /login             (auth — static)
○ /jobs              (static)
○ /interviews        (static)
ƒ /candidates/[id]   (dynamic)
ƒ /jobs/[id]         (dynamic)
ƒ /apply/[token]     (public — dynamic)

## Branch
- branch: not pushed (scaffolded in-place; ready for git operations)

## Deviations / needs decision
- Tailwind v4 installed by create-next-app@latest instead of v3 — theme config lives in CSS @theme block rather than tailwind.config.ts
- Next.js 16 deprecated middleware.ts → using proxy.ts convention instead
- Supabase client uses proxy fallback when env vars are empty to survive build-time prerendering
- --no-turbopack flag no longer exists; Turbopack is not the default bundler
- Removed AGENTS.md, CLAUDE.md, README.md scaffold boilerplate
