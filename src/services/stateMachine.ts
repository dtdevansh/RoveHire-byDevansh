import type { CandidateStatus } from '../types/models.js';

// ─────────────────────────────────────────────────────────────
// Status State Machine — THE single source of transition truth.
//
// Every mutation route funnels through canTransition().
// The profile endpoint calls allowedActions() so the frontend
// renders buttons off the server's answer instead of re-deriving guards.
// ─────────────────────────────────────────────────────────────

export interface TransitionContext {
  hasCompletedInterview: boolean;
  hasOffer: boolean;
  rejectionReason?: string;
}

type TransitionResult =
  | { ok: true }
  | { ok: false; reason: string };

/** Terminal statuses — no outgoing transitions allowed. */
const TERMINAL: ReadonlySet<CandidateStatus> = new Set(['Hired', 'Rejected']);

/**
 * Valid transitions and their guards.
 */
const TRANSITIONS: Record<string, (ctx: TransitionContext) => TransitionResult> = {
  'Applied->Form Submitted': () => ({ ok: true }),

  'Form Submitted->Interview Scheduled': () => ({ ok: true }),

  'Interview Scheduled->Offer Sent': (ctx) => {
    if (!ctx.hasCompletedInterview) {
      return { ok: false, reason: 'At least one completed interview is required before generating an offer' };
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

/**
 * Check if a status transition is valid.
 * Returns { ok: true } or { ok: false, reason }.
 */
export function canTransition(
  from: CandidateStatus,
  to: CandidateStatus,
  ctx: TransitionContext,
): TransitionResult {
  // Terminal statuses cannot transition
  if (TERMINAL.has(from)) {
    return { ok: false, reason: `Cannot transition from terminal status "${from}"` };
  }

  // Rejection is always allowed from any non-terminal status
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

/**
 * Derive the list of available actions for a candidate.
 * The frontend renders action buttons from this list.
 */
export function allowedActions(
  status: CandidateStatus,
  ctx: TransitionContext,
): string[] {
  if (TERMINAL.has(status)) {
    return [];
  }

  const actions: string[] = [];

  switch (status) {
    case 'Applied':
      // Form submission happens via magic link, not an HR action
      break;

    case 'Form Submitted':
      actions.push('schedule_interview');
      break;

    case 'Interview Scheduled':
      actions.push('schedule_interview'); // can schedule additional interviews
      if (ctx.hasCompletedInterview) {
        actions.push('generate_offer');
      }
      break;

    case 'Offer Sent':
      if (ctx.hasOffer) {
        actions.push('hire');
      }
      actions.push('generate_offer'); // can generate revised offers
      break;
  }

  // Rejection is always available from any non-terminal status
  actions.push('reject');

  return actions;
}
