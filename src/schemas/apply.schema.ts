import { z } from 'zod';

/**
 * GET /api/v1/apply/:token — Validate token and get context.
 */
export const getApplyContextSchema = z.object({
  params: z.object({
    token: z.string().min(1),
  }),
});

/**
 * POST /api/v1/apply/:token — Submit the public application form.
 * linkedin_url is stored but NEVER fetched server-side (SSRF / API7).
 */
export const submitApplicationSchema = z.object({
  params: z.object({
    token: z.string().min(1),
  }),
  body: z.object({
    phone: z.string().max(50).optional(),
    current_location: z.string().max(200).optional(),
    current_role: z.string().max(200).optional(),
    notice_period: z.string().max(100).optional(),
    salary_expectation: z.string().max(100).optional(),
    linkedin_url: z.string().url().max(500).optional().or(z.literal('')),
  }),
});
