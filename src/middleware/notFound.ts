import type { Request, Response, NextFunction } from 'express';
import { fail } from '../lib/response.js';

export function notFound(_req: Request, res: Response, _next: NextFunction): void {
  fail(res, 404, 'NOT_FOUND', 'The requested resource was not found');
}
