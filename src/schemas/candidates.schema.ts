import { z } from 'zod';

export const listCandidatesSchema = z.object({
  query: z.object({
    status: z
      .enum([
        'Applied',
        'Form Submitted',
        'Interview Scheduled',
        'Offer Sent',
        'Hired',
        'Rejected',
      ])
      .optional(),
    search: z.string().max(200).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export const getCandidateSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const rejectCandidateSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    reason: z.string().min(1).max(2000),
  }),
});

export const hireCandidateSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const getResumeSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});
