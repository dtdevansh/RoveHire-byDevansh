import { z } from 'zod';

/**
 * POST /api/v1/jobs — Create a new job opening.
 */
export const createJobSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(10000).nullable().optional(),
    required_skills: z.array(z.string().min(1).max(100)).default([]),
    status: z.enum(['Open', 'Closed']).default('Open'),
  }),
});

/**
 * PATCH /api/v1/jobs/:id — Update an existing job opening.
 */
export const updateJobSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(10000).nullable().optional(),
    required_skills: z.array(z.string().min(1).max(100)).optional(),
    status: z.enum(['Open', 'Closed']).optional(),
  }),
});

/**
 * GET /api/v1/jobs/:id — Get a specific job.
 */
export const getJobSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});
