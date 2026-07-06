// ─────────────────────────────────────────────────────────────
// DB row types — mirrors the SQL schema in migrations/001_init.sql
// ─────────────────────────────────────────────────────────────

export type CandidateStatus =
  | 'Applied'
  | 'Form Submitted'
  | 'Interview Scheduled'
  | 'Offer Sent'
  | 'Hired'
  | 'Rejected';

export type JobStatus = 'Open' | 'Closed';

export type InterviewType = 'Screening' | 'Technical';

export type InterviewOutcome = 'Scheduled' | 'Completed';

export type Recommendation = 'hire' | 'no_hire' | 'maybe';

export type TimelineEventType =
  | 'applied'
  | 'form_submitted'
  | 'interview_scheduled'
  | 'feedback_recorded'
  | 'offer_generated'
  | 'hired'
  | 'rejected';

export interface JobOpening {
  id: string;
  title: string;
  description: string | null;
  required_skills: string[];
  status: JobStatus;
  created_at: string;
  updated_at: string;
}

export interface Candidate {
  id: string;
  job_opening_id: string;
  name: string;
  email: string;
  status: CandidateStatus;
  resume_key: string;
  phone: string | null;
  current_location: string | null;
  current_role: string | null;
  notice_period: string | null;
  salary_expectation: string | null;
  linkedin_url: string | null;
  rejection_reason: string | null;
  extra: Record<string, unknown>;
  last_activity_at: string;
  created_at: string;
}

export interface ApplicationToken {
  id: string;
  candidate_id: string;
  token_hash: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

export interface Interview {
  id: string;
  candidate_id: string;
  scheduled_at: string;
  type: InterviewType;
  interviewer_name: string;
  notes: string | null;
  outcome: InterviewOutcome;
  recommendation: Recommendation | null;
  feedback_note: string | null;
  created_at: string;
}

export interface OfferDocument {
  id: string;
  candidate_id: string;
  offer_letter_key: string;
  nda_key: string;
  role_title: string;
  salary_currency: string;
  salary_amount: number;
  start_date: string;
  manager_name: string;
  location: string;
  created_at: string;
}

export interface TimelineEvent {
  id: string;
  candidate_id: string;
  type: TimelineEventType;
  message: string;
  metadata: Record<string, unknown>;
  created_at: string;
}
