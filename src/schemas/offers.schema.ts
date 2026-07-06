import { z } from 'zod';

/**
 * POST /api/v1/candidates/:id/offers — Generate offer + NDA documents.
 */
export const createOfferSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    role_title: z.string().min(1).max(200),
    salary_currency: z.string().min(1).max(10),
    salary_amount: z.number().positive(),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
    manager_name: z.string().min(1).max(200),
    location: z.string().min(1).max(300),
  }),
});

/**
 * GET /api/v1/offers/:id/download?doc=offer|nda — Download offer/NDA.
 */
export const downloadOfferSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  query: z.object({
    doc: z.enum(['offer', 'nda']),
  }),
});
