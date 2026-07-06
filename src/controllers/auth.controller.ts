import type { Request, Response } from 'express';
import { ok } from '../lib/response.js';

export function getMe(req: Request, res: Response): void {
  ok(res, {
    id: req.user!.id,
    email: req.user!.email,
  });
}
