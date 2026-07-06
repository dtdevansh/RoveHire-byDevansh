import type { Request, Response, NextFunction } from 'express';
import { ok } from '../lib/response.js';
import { AppError } from '../lib/errors.js';
import * as candidatesService from '../services/candidates.service.js';

/**
 * GET /api/v1/candidates
 */
export async function listCandidates(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { items, meta } = await candidatesService.listCandidates(req.query as never);
    ok(res, items, meta as unknown as Record<string, unknown>);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/candidates
 * Multipart: name, email, job_opening_id, resume (file)
 */
export async function createCandidate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) {
      throw new AppError(422, 'MISSING_FILE', 'Resume file is required');
    }

    const result = await candidatesService.createCandidate({
      name: req.body.name,
      email: req.body.email,
      job_opening_id: req.body.job_opening_id,
      resumeBuffer: req.file.buffer,
    });

    ok(res, result, undefined, 201);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/candidates/:id
 */
export async function getCandidateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await candidatesService.getCandidateProfile(req.params['id'] as string);
    ok(res, profile);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/candidates/:id/resume
 */
export async function getResume(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const url = await candidatesService.getResumeUrl(req.params['id'] as string);
    ok(res, { url });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/candidates/:id/reject
 */
export async function rejectCandidate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const candidate = await candidatesService.rejectCandidate(req.params['id'] as string, req.body.reason);
    ok(res, candidate);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/candidates/:id/hire
 */
export async function hireCandidate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const candidate = await candidatesService.hireCandidate(req.params['id'] as string);
    ok(res, candidate);
  } catch (err) {
    next(err);
  }
}
