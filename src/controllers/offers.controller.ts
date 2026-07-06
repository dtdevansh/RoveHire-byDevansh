import type { Request, Response, NextFunction } from 'express';
import { ok } from '../lib/response.js';
import * as offersService from '../services/offers.service.js';

/**
 * POST /api/v1/candidates/:id/offers
 */
export async function generateOffer(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await offersService.generateOffer(req.params['id'] as string, req.body);
    ok(res, result, undefined, 201);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/offers/:id/download?doc=offer|nda
 */
export async function downloadOffer(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const doc = req.query['doc'] as 'offer' | 'nda';
    const url = await offersService.getOfferDownloadUrl(req.params['id'] as string, doc);
    ok(res, { url });
  } catch (err) {
    next(err);
  }
}
