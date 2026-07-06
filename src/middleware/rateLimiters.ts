import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express';
import { fail } from '../lib/response.js';

// API4: global limiter caps request volume across every route.
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    fail(res, 429, 'RATE_LIMITED', 'Too many requests, please try again later');
  },
});

// API6: the unauthenticated /apply business flow gets a stricter, isolated limiter.
export const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    fail(res, 429, 'RATE_LIMITED', 'Too many requests, please try again later');
  },
});
