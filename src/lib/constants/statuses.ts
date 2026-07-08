import type {
  CandidateStatus,
  InterviewType,
  Recommendation,
} from '@/types/models';

interface Token {
  label: string;
  base: string;
  text: string;
  bg: string;
}

// Candidate status hues — kept deliberately separate from the ROVE orange brand.
// Values mirror the UI guide §1.2 exactly.
export const STATUS_MAP: Record<CandidateStatus, Token> = {
  Applied: {
    label: 'Applied',
    base: '#8A94A6',
    text: '#C2CAD6',
    bg: 'rgba(148, 163, 184, 0.14)',
  },
  'Form Submitted': {
    label: 'Form Submitted',
    base: '#4B93F7',
    text: '#7BB6F6',
    bg: 'rgba(75, 147, 247, 0.14)',
  },
  'Interview Scheduled': {
    label: 'Interview Scheduled',
    base: '#8B5CF6',
    text: '#BFAEFB',
    bg: 'rgba(139, 92, 246, 0.15)',
  },
  'Offer Sent': {
    label: 'Offer Sent',
    base: '#EAB308',
    text: '#F3CC5C',
    bg: 'rgba(234, 179, 8, 0.14)',
  },
  Hired: {
    label: 'Hired',
    base: '#10B981',
    text: '#4ADE9B',
    bg: 'rgba(16, 185, 129, 0.15)',
  },
  Rejected: {
    label: 'Rejected',
    base: '#EF4444',
    text: '#F58A8A',
    bg: 'rgba(239, 68, 68, 0.14)',
  },
};

export const CANDIDATE_STATUSES: CandidateStatus[] = [
  'Applied',
  'Form Submitted',
  'Interview Scheduled',
  'Offer Sent',
  'Hired',
  'Rejected',
];

// Terminal states hide mutating actions.
export const TERMINAL_STATUSES: CandidateStatus[] = ['Hired', 'Rejected'];

// Recommendation chips reuse status hues: hire → emerald, no-hire → red, maybe → amber.
export const RECOMMENDATION_MAP: Record<Recommendation, Token> = {
  hire: {
    label: 'Hire',
    base: '#10B981',
    text: '#4ADE9B',
    bg: 'rgba(16, 185, 129, 0.15)',
  },
  maybe: {
    label: 'Maybe',
    base: '#EAB308',
    text: '#F3CC5C',
    bg: 'rgba(234, 179, 8, 0.14)',
  },
  no_hire: {
    label: 'No-hire',
    base: '#EF4444',
    text: '#F58A8A',
    bg: 'rgba(239, 68, 68, 0.14)',
  },
};

// Interview type chips.
export const INTERVIEW_TYPE_MAP: Record<InterviewType, Token> = {
  Screening: {
    label: 'Screening',
    base: '#4B93F7',
    text: '#7BB6F6',
    bg: 'rgba(75, 147, 247, 0.14)',
  },
  Technical: {
    label: 'Technical',
    base: '#8B5CF6',
    text: '#BFAEFB',
    bg: 'rgba(139, 92, 246, 0.15)',
  },
};

// Action keys returned by the server in `allowed_actions`.
export const ACTIONS = {
  SCHEDULE_INTERVIEW: 'schedule_interview',
  RECORD_FEEDBACK: 'record_feedback',
  GENERATE_OFFER: 'generate_offer',
  REJECT: 'reject',
  MARK_HIRED: 'mark_hired',
} as const;
