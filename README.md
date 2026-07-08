Rove Hire
Internal ATS for the ROVE HR team — resume intake through offer letter, in one tool.

Hosting
The frontend (Next.js) is deployed on Vercel; the backend (Node/Express) runs as a
standalone web service with a persistent process, since PDF generation and file streaming
don't fit a serverless request lifecycle well. The database, authentication, and file
storage are all provided by Supabase.

Tech stack and why

LayerChoiceWhyFrontendNext.js (App Router) + TypeScript + TailwindRequired by the brief; App Router gives us layout nesting for the authed shell vs. the public apply page for free.BackendNode + Express (TypeScript), standalone serviceKept separate from the frontend deliberately — independent scaling, a reusable API surface, and no serverless cold-start tax on PDF generation.StateRedux Toolkit, plain slices + async thunksChosen over RTK Query for explicitness: every fetch/mutation lifecycle is visible in the codebase rather than abstracted behind cache tags, which mattered more to us than the auto-invalidation RTK Query would've given us for free.DatabaseSupabase PostgresThe data is fundamentally relational — a candidate belongs to a job, has many interviews and offers, and a chronological timeline — so foreign keys and real joins beat a document store here. A jsonb column on candidates covers fields we can't anticipate yet without abandoning structure everywhere else.AuthSupabase AuthHR sign-in with zero password/session code to maintain ourselves. The backend verifies the JWT locally against Supabase's published JWKS (asymmetric signing), so auth adds no per-request round trip. Public sign-up is disabled — HR accounts are provisioned by hand, appropriate for an internal tool.File storageSupabase Storage (private bucket)Resumes and generated PDFs are a handful of megabytes across a modest number of records — nowhere near the volume where a dedicated object store's egress pricing would matter. Using the storage product already inside our Supabase project meant one SDK, one credential set, and signed URLs that map directly onto our "keys in the DB, sign on demand" design, instead of standing up and wiring a second provider for no real benefit at this scale.

PDF generation

Offer letters and NDAs are generated with @react-pdf/renderer: each document is a
React component tree (header, body, signature block) rendered server-side to a PDF buffer,
then uploaded to storage. We chose it over an HTML-to-PDF approach (e.g. Puppeteer) because
it avoids shipping a headless Chromium instance alongside the API — meaningful for a
process that otherwise stays lightweight — and because JSX gives precise, predictable
control over pagination and layout without fighting a browser's rendering quirks.

At scale, we'd change two things. First, generation would move off the request thread
into a queue (candidate requests → job enqueued → worker renders and uploads → profile
updates when done), so a slow render never holds an HTTP connection open. Second, we'd
introduce versioned templates stored as data rather than code, so HR could adjust wording or
branding without a deploy.

What we'd do next (two more days)


Automated tests. Nothing is tested right now beyond manual verification — unit tests
around the status-transition guards would be the first priority, since that's the logic
most likely to have an edge case we haven't hit yet.
CI. A basic pipeline running lint/typecheck/build on every push; right now that gate
only runs locally.
In-app user management. HR accounts are currently created by hand in the Supabase
dashboard. A simple invite flow, gated behind a minimal role check, would remove that
manual step.
Offer regeneration UX. The data model already supports multiple offers per candidate
(renegotiated terms), but we'd tighten the UI around comparing/superseding older offers.
Observability. Structured logs exist, but there's no error tracking or uptime
monitoring wired up — we'd add that before trusting this with real candidate data.
Cut for time: markdown live-preview when editing a job description, and CSV export of
the candidate list — both nice-to-haves, neither blocking the core workflow.


What we wouldn't put in production yet


Free-tier cold starts. Both the backend host and Supabase can idle down when
inactive, adding a real delay to the first request after a quiet period. Fine for a
demo; not acceptable for people actually waiting on a page load.
No automated backups. The free-tier database has no scheduled backup/restore story.
For real candidate and offer data, that's a hard blocker before go-live, not a
nice-to-have.
Resumes aren't scanned. We validate file type and size, but don't scan uploads for
malicious content — worth adding before accepting files from outside the org.
Rate limits are reasonable defaults, not tuned. They haven't been load-tested against
real traffic patterns, particularly on the public application-link endpoint, which is the
one surface anyone on the internet can hit without an account.
Single environment. There's no separate staging project — changes go straight from
local development to what the reviewers see. We'd want a staging Supabase project and
a preview deployment path before this became a real internal tool.
