import type { Request, Response } from 'express';
import { ok } from '../lib/response.js';

/**
 * GET /api/v1/me
 * Returns the authenticated user's identity decoded from the JWT.
 */
export function getMe(req: Request, res: Response): void {
  ok(res, {
    id: req.user!.id,
    email: req.user!.email,
  });
}
