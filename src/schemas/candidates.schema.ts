import { z } from 'zod';

/**
 * GET /api/v1/candidates — List candidates with filtering + pagination.
 */
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

/**
 * GET /api/v1/candidates/:id — Get candidate profile.
 */
export const getCandidateSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

/**
 * POST /api/v1/candidates/:id/reject — Reject a candidate (reason required).
 */
export const rejectCandidateSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    reason: z.string().min(1).max(2000),
  }),
});

/**
 * POST /api/v1/candidates/:id/hire — Hire a candidate.
 */
export const hireCandidateSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

/**
 * GET /api/v1/candidates/:id/resume — Get resume download URL.
 */
export const getResumeSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});
