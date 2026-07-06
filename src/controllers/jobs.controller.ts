import type { Request, Response, NextFunction } from 'express';
import { ok } from '../lib/response.js';
import * as jobsService from '../services/jobs.service.js';

export async function listJobs(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const jobs = await jobsService.listJobs();
    ok(res, jobs);
  } catch (err) {
    next(err);
  }
}

export async function createJob(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const job = await jobsService.createJob(req.body);
    ok(res, job, undefined, 201);
  } catch (err) {
    next(err);
  }
}

export async function getJob(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const job = await jobsService.getJob(req.params['id'] as string);
    ok(res, job);
  } catch (err) {
    next(err);
  }
}

export async function updateJob(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const job = await jobsService.updateJob(req.params['id'] as string, req.body);
    ok(res, job);
  } catch (err) {
    next(err);
  }
}
