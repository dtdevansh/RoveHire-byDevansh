-- ═══════════════════════════════════════════════════════════════
-- Rove Hire — Initial Schema
-- ═══════════════════════════════════════════════════════════════
-- Six tables. hr_users intentionally dropped — identity comes from
-- Supabase Auth (auth.users) via the verified JWT.
--
-- Design decisions:
--   • text + CHECK constraints for status columns (easy to extend)
--   • UUID PKs via gen_random_uuid() (no sequential-id enumeration)
--   • jsonb extra on candidates = escape hatch for future fuzzy fields
--   • Timeline is a normalized append-only table
--   • Files stored as R2 keys, never URLs — signed on demand
-- ═══════════════════════════════════════════════════════════════

-- Enable UUID generation
create extension if not exists pgcrypto;

-- ─────────────────────────────────────────────────────────────
-- job_openings
-- ─────────────────────────────────────────────────────────────
create table job_openings (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  description     text,                         -- markdown
  required_skills text[] not null default '{}', -- skill tags
  status          text not null default 'Open'
                    check (status in ('Open','Closed')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- candidates  (the spine)
-- ─────────────────────────────────────────────────────────────
create table candidates (
  id                 uuid primary key default gen_random_uuid(),
  job_opening_id     uuid not null references job_openings(id),
  name               text not null,
  email              text not null,
  status             text not null default 'Applied'
                       check (status in ('Applied','Form Submitted',
                              'Interview Scheduled','Offer Sent','Hired','Rejected')),
  resume_key         text not null,             -- R2 object key

  -- filled by the public application form (feature 4)
  phone              text,
  current_location   text,
  current_role       text,
  notice_period      text,
  salary_expectation text,
  linkedin_url       text,

  rejection_reason   text,                      -- required when status = Rejected
  extra              jsonb not null default '{}', -- future-field escape hatch

  last_activity_at   timestamptz not null default now(), -- drives dashboard sort
  created_at         timestamptz not null default now()
);

create index idx_candidates_job      on candidates(job_opening_id);
create index idx_candidates_status   on candidates(status);
create index idx_candidates_activity on candidates(last_activity_at desc);

-- ─────────────────────────────────────────────────────────────
-- application_tokens  (magic link — own lifecycle)
-- ─────────────────────────────────────────────────────────────
create table application_tokens (
  id            uuid primary key default gen_random_uuid(),
  candidate_id  uuid not null references candidates(id) on delete cascade,
  token_hash    text not null unique,          -- sha256(rawToken); raw only in the link
  expires_at    timestamptz not null,          -- created_at + 14 days
  used_at       timestamptz,                    -- non-null = one-time-use spent
  created_at    timestamptz not null default now()
);

create index idx_tokens_hash on application_tokens(token_hash);

-- ─────────────────────────────────────────────────────────────
-- interviews  (own state, independent of candidate status)
-- ─────────────────────────────────────────────────────────────
create table interviews (
  id               uuid primary key default gen_random_uuid(),
  candidate_id     uuid not null references candidates(id) on delete cascade,
  scheduled_at     timestamptz not null,        -- date + time
  type             text not null
                     check (type in ('Screening','Technical')),
  interviewer_name text not null,
  notes            text,
  outcome          text not null default 'Scheduled'
                     check (outcome in ('Scheduled','Completed')),
  recommendation   text
                     check (recommendation in ('hire','no_hire','maybe')),
  feedback_note    text,
  created_at       timestamptz not null default now()
);

create index idx_interviews_candidate on interviews(candidate_id);
create index idx_interviews_scheduled on interviews(scheduled_at);

-- ─────────────────────────────────────────────────────────────
-- offer_documents  (multiple per candidate — renegotiable terms)
-- ─────────────────────────────────────────────────────────────
create table offer_documents (
  id                uuid primary key default gen_random_uuid(),
  candidate_id      uuid not null references candidates(id) on delete cascade,
  offer_letter_key  text not null,              -- R2 key
  nda_key           text not null,              -- R2 key

  -- snapshot of the offer terms (independent of application data)
  role_title        text not null,
  salary_currency   text not null,
  salary_amount     numeric not null,
  start_date        date not null,
  manager_name      text not null,
  location          text not null,

  created_at        timestamptz not null default now()
);

create index idx_offers_candidate on offer_documents(candidate_id);

-- ─────────────────────────────────────────────────────────────
-- timeline_events  (append-only, most-recent-first)
-- ─────────────────────────────────────────────────────────────
create table timeline_events (
  id            uuid primary key default gen_random_uuid(),
  candidate_id  uuid not null references candidates(id) on delete cascade,
  type          text not null
                  check (type in ('applied','form_submitted','interview_scheduled',
                         'feedback_recorded','offer_generated','hired','rejected')),
  message       text not null,                  -- human-readable
  metadata      jsonb not null default '{}',    -- type-specific extras
  created_at    timestamptz not null default now()
);

create index idx_timeline_candidate on timeline_events(candidate_id, created_at desc);
