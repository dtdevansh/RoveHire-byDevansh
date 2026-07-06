import type { Request, Response, NextFunction } from 'express';
import { ok } from '../lib/response.js';
import * as applyService from '../services/apply.service.js';

export async function getApplyContext(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const context = await applyService.getApplyContext(req.params['token'] as string);
    ok(res, context);
  } catch (err) {
    next(err);
  }
}

export async function submitApplication(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await applyService.submitApplication(req.params['token'] as string, req.body);
    ok(res, { message: 'Application submitted successfully' });
  } catch (err) {
    next(err);
  }
}
