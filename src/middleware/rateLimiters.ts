import rateLimit from 'express-rate-limit';
import { fail } from '../lib/response.js';
import type { Request, Response } from 'express';

/**
 * Global rate limiter for all routes (OWASP API4).
 * 100 requests per 15 minutes per IP.
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    fail(res, 429, 'RATE_LIMITED', 'Too many requests, please try again later');
  },
});

/**
 * Stricter rate limiter for the unauthenticated /apply surface (API4/API6).
 * 10 requests per 15 minutes per IP.
 */
export const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    fail(res, 429, 'RATE_LIMITED', 'Too many requests, please try again later');
  },
});
