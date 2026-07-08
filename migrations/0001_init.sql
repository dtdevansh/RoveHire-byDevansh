-- Rove Hire — Supabase init migration
-- Paste into Supabase Studio → SQL Editor → Run, or apply via the Supabase CLI.
-- Mirrors BACKEND.md §5. Adds RLS lockdown (see bottom) because Supabase exposes every
-- public-schema table over the Data API; our backend uses the SECRET key (bypasses RLS),
-- the browser only uses Supabase for auth, so we enable RLS with NO policies to deny all
-- direct client access as defense in depth.

create extension if not exists pgcrypto;

-- ─────────────────────────────────────────────────────────────
-- job_openings
-- ─────────────────────────────────────────────────────────────
create table if not exists job_openings (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  description     text,
  required_skills text[] not null default '{}',
  status          text not null default 'Open'
                    check (status in ('Open','Closed')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- candidates
-- ─────────────────────────────────────────────────────────────
create table if not exists candidates (
  id                 uuid primary key default gen_random_uuid(),
  job_opening_id     uuid not null references job_openings(id),
  name               text not null,
  email              text not null,
  status             text not null default 'Applied'
                       check (status in ('Applied','Form Submitted',
                              'Interview Scheduled','Offer Sent','Hired','Rejected')),
  resume_key         text not null,
  phone              text,
  current_location   text,
  "current_role"     text,
  notice_period      text,
  salary_expectation text,
  linkedin_url       text,
  rejection_reason   text,
  extra              jsonb not null default '{}',
  last_activity_at   timestamptz not null default now(),
  created_at         timestamptz not null default now()
);

create index if not exists idx_candidates_job      on candidates(job_opening_id);
create index if not exists idx_candidates_status   on candidates(status);
create index if not exists idx_candidates_activity on candidates(last_activity_at desc);

-- ─────────────────────────────────────────────────────────────
-- application_tokens (magic link)
-- ─────────────────────────────────────────────────────────────
create table if not exists application_tokens (
  id            uuid primary key default gen_random_uuid(),
  candidate_id  uuid not null references candidates(id) on delete cascade,
  token_hash    text not null unique,
  expires_at    timestamptz not null,
  used_at       timestamptz,
  created_at    timestamptz not null default now()
);

create index if not exists idx_tokens_hash on application_tokens(token_hash);

-- ─────────────────────────────────────────────────────────────
-- interviews
-- ─────────────────────────────────────────────────────────────
create table if not exists interviews (
  id               uuid primary key default gen_random_uuid(),
  candidate_id     uuid not null references candidates(id) on delete cascade,
  scheduled_at     timestamptz not null,
  type             text not null check (type in ('Screening','Technical')),
  interviewer_name text not null,
  notes            text,
  outcome          text not null default 'Scheduled'
                     check (outcome in ('Scheduled','Completed')),
  recommendation   text check (recommendation in ('hire','no_hire','maybe')),
  feedback_note    text,
  created_at       timestamptz not null default now()
);

create index if not exists idx_interviews_candidate on interviews(candidate_id);
create index if not exists idx_interviews_scheduled on interviews(scheduled_at);

-- ─────────────────────────────────────────────────────────────
-- offer_documents (multiple per candidate)
-- ─────────────────────────────────────────────────────────────
create table if not exists offer_documents (
  id                uuid primary key default gen_random_uuid(),
  candidate_id      uuid not null references candidates(id) on delete cascade,
  offer_letter_key  text not null,
  nda_key           text not null,
  role_title        text not null,
  salary_currency   text not null,
  salary_amount     numeric not null,
  start_date        date not null,
  manager_name      text not null,
  location          text not null,
  created_at        timestamptz not null default now()
);

create index if not exists idx_offers_candidate on offer_documents(candidate_id);

-- ─────────────────────────────────────────────────────────────
-- timeline_events (append-only, most-recent-first)
-- ─────────────────────────────────────────────────────────────
create table if not exists timeline_events (
  id            uuid primary key default gen_random_uuid(),
  candidate_id  uuid not null references candidates(id) on delete cascade,
  type          text not null
                  check (type in ('applied','form_submitted','interview_scheduled',
                         'feedback_recorded','offer_generated','hired','rejected')),
  message       text not null,
  metadata      jsonb not null default '{}',
  created_at    timestamptz not null default now()
);

create index if not exists idx_timeline_candidate on timeline_events(candidate_id, created_at desc);

-- ─────────────────────────────────────────────────────────────
-- RLS lockdown: enable on every table, add NO policies.
-- Effect: the Data API (anon/publishable + authenticated roles) is denied all access.
-- The backend SECRET key (service_role) bypasses RLS, so the app is unaffected.
-- ─────────────────────────────────────────────────────────────
alter table job_openings       enable row level security;
alter table candidates         enable row level security;
alter table application_tokens enable row level security;
alter table interviews         enable row level security;
alter table offer_documents    enable row level security;
alter table timeline_events    enable row level security;
