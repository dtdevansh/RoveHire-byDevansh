import { Router } from 'express';
import type { Request, Response } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { validate } from '../middleware/validate.js';
import { createInterviewSchema } from '../schemas/interviews.schema.js';
import { createOfferSchema } from '../schemas/offers.schema.js';
import * as interviewsController from '../controllers/interviews.controller.js';
import * as offersController from '../controllers/offers.controller.js';

import authRoutes from './auth.routes.js';
import jobsRoutes from './jobs.routes.js';
import candidatesRoutes from './candidates.routes.js';
import applyRoutes from './apply.routes.js';
import interviewsRoutes from './interviews.routes.js';
import offersRoutes from './offers.routes.js';

const router = Router();

// ─────────────────────────────────────────────────────────────
// Health check (used by Docker HEALTHCHECK)
// ─────────────────────────────────────────────────────────────
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─────────────────────────────────────────────────────────────
// Mount route groups
// ─────────────────────────────────────────────────────────────
router.use('/', authRoutes);                    // /api/v1/me
router.use('/jobs', jobsRoutes);                // /api/v1/jobs
router.use('/candidates', candidatesRoutes);    // /api/v1/candidates
router.use('/apply', applyRoutes);              // /api/v1/apply (PUBLIC)
router.use('/interviews', interviewsRoutes);    // /api/v1/interviews
router.use('/offers', offersRoutes);            // /api/v1/offers

// ─────────────────────────────────────────────────────────────
// Nested routes (actions on candidates)
// ─────────────────────────────────────────────────────────────

// POST /api/v1/candidates/:id/interviews — schedule interview
router.post(
  '/candidates/:id/interviews',
  requireAuth,
  validate(createInterviewSchema),
  interviewsController.scheduleInterview,
);

// POST /api/v1/candidates/:id/offers — generate offer
router.post(
  '/candidates/:id/offers',
  requireAuth,
  validate(createOfferSchema),
  offersController.generateOffer,
);

export default router;
