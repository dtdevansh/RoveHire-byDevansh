import type { Request, Response, NextFunction } from 'express';
import { ok } from '../lib/response.js';
import * as interviewsService from '../services/interviews.service.js';

export async function scheduleInterview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const interview = await interviewsService.scheduleInterview(req.params['id'] as string, req.body);
    ok(res, interview, undefined, 201);
  } catch (err) {
    next(err);
  }
}

export async function listInterviews(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const interviews = await interviewsService.listInterviews();
    ok(res, interviews);
  } catch (err) {
    next(err);
  }
}

export async function completeInterview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const interview = await interviewsService.completeInterview(req.params['id'] as string, req.body);
    ok(res, interview);
  } catch (err) {
    next(err);
  }
}
