import { z } from 'zod';

export const createInterviewSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    scheduled_at: z.string().datetime(),
    type: z.enum(['Screening', 'Technical']),
    interviewer_name: z.string().min(1).max(200),
    notes: z.string().max(5000).nullable().optional(),
  }),
});

export const updateInterviewSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    outcome: z.literal('Completed'),
    recommendation: z.enum(['hire', 'no_hire', 'maybe']),
    feedback_note: z.string().max(5000).nullable().optional(),
  }),
});
