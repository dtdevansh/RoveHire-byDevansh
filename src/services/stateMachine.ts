import type { CandidateStatus } from '../types/models.js';

export interface TransitionContext {
  hasCompletedInterview: boolean;
  hasOffer: boolean;
  rejectionReason?: string;
}

type TransitionResult = { ok: true } | { ok: false; reason: string };

const TERMINAL: ReadonlySet<CandidateStatus> = new Set(['Hired', 'Rejected']);

const TRANSITIONS: Record<string, (ctx: TransitionContext) => TransitionResult> = {
  'Applied->Form Submitted': () => ({ ok: true }),

  'Form Submitted->Interview Scheduled': () => ({ ok: true }),

  'Interview Scheduled->Offer Sent': (ctx) => {
    if (!ctx.hasCompletedInterview) {
      return {
        ok: false,
        reason: 'At least one completed interview is required before generating an offer',
      };
    }
    return { ok: true };
  },

  'Offer Sent->Hired': (ctx) => {
    if (!ctx.hasOffer) {
      return { ok: false, reason: 'At least one offer must exist before hiring' };
    }
    return { ok: true };
  },
};

export function canTransition(
  from: CandidateStatus,
  to: CandidateStatus,
  ctx: TransitionContext,
): TransitionResult {
  if (TERMINAL.has(from)) {
    return { ok: false, reason: `Cannot transition from terminal status "${from}"` };
  }

  if (to === 'Rejected') {
    if (!ctx.rejectionReason?.trim()) {
      return { ok: false, reason: 'Rejection reason is required' };
    }
    return { ok: true };
  }

  const key = `${from}->${to}`;
  const guard = TRANSITIONS[key];

  if (!guard) {
    return { ok: false, reason: `Invalid transition from "${from}" to "${to}"` };
  }

  return guard(ctx);
}

export function allowedActions(
  status: CandidateStatus,
  ctx: TransitionContext,
): string[] {
  if (TERMINAL.has(status)) {
    return [];
  }

  const actions: string[] = [];

  switch (status) {
    case 'Form Submitted':
      actions.push('schedule_interview');
      break;

    case 'Interview Scheduled':
      actions.push('schedule_interview');
      if (ctx.hasCompletedInterview) {
        actions.push('generate_offer');
      }
      break;

    case 'Offer Sent':
      if (ctx.hasOffer) {
        actions.push('hire');
      }
      actions.push('generate_offer');
      break;
  }

  actions.push('reject');

  return actions;
}
