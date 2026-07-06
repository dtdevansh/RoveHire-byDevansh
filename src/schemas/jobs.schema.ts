import { z } from 'zod';

export const createJobSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(10000).nullable().optional(),
    required_skills: z.array(z.string().min(1).max(100)).default([]),
    status: z.enum(['Open', 'Closed']).default('Open'),
  }),
});

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

export const getJobSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});
