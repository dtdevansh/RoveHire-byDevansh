import type { CandidateStatus } from '@/types/models';

interface StatusToken {
  label: string;
  base: string;
  text: string;
  bg: string;
}

export const STATUS_MAP: Record<CandidateStatus, StatusToken> = {
  Applied: {
    label: 'Applied',
    base: '#3B82F6',
    text: '#93C5FD',
    bg: 'rgba(59, 130, 246, 0.15)',
  },
  'Form Submitted': {
    label: 'Form Submitted',
    base: '#8B5CF6',
    text: '#C4B5FD',
    bg: 'rgba(139, 92, 246, 0.15)',
  },
  'Interview Scheduled': {
    label: 'Interview Scheduled',
    base: '#F59E0B',
    text: '#FCD34D',
    bg: 'rgba(245, 158, 11, 0.15)',
  },
  'Offer Sent': {
    label: 'Offer Sent',
    base: '#10B981',
    text: '#6EE7B7',
    bg: 'rgba(16, 185, 129, 0.15)',
  },
  Hired: {
    label: 'Hired',
    base: '#22C55E',
    text: '#86EFAC',
    bg: 'rgba(34, 197, 94, 0.15)',
  },
  Rejected: {
    label: 'Rejected',
    base: '#EF4444',
    text: '#FCA5A5',
    bg: 'rgba(239, 68, 68, 0.15)',
  },
};
