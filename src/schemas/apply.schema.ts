import { z } from 'zod';

export const getApplyContextSchema = z.object({
  params: z.object({
    token: z.string().min(1),
  }),
});

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
    // API7: validated as a URL string only; it is stored but never fetched server-side.
    linkedin_url: z.string().url().max(500).optional().or(z.literal('')),
  }),
});
