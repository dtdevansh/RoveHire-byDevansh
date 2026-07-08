import type {
  CandidateStatus,
  Interview,
  OfferDocument,
  TimelineEvent,
} from './models';

export interface CandidateProfileDTO {
  id: string;
  name: string;
  email: string;
  status: CandidateStatus;
  phone: string | null;
  current_location: string | null;
  current_role: string | null;
  notice_period: string | null;
  salary_expectation: string | null;
  linkedin_url: string | null;
  rejection_reason: string | null;
  job_opening: { id: string; title: string };
  resume_download_url: string;
  interviews: Interview[];
  offers: Array<
    OfferDocument & {
      offer_download_url: string;
      nda_download_url: string;
    }
  >;
  timeline: TimelineEvent[];
  allowed_actions: string[];
  created_at: string;
  last_activity_at: string;
}

export interface ApplyContextDTO {
  candidate_name: string;
  role: string;
}

export interface JobListItemDTO {
  id: string;
  title: string;
  status: string;
  required_skills: string[];
  candidate_count: number;
  created_at: string;
}

export interface CandidateListItemDTO {
  id: string;
  name: string;
  role: string;
  status: CandidateStatus;
  last_activity_at: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}
