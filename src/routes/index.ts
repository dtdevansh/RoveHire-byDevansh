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

router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/', authRoutes);
router.use('/jobs', jobsRoutes);
router.use('/candidates', candidatesRoutes);
router.use('/apply', applyRoutes);
router.use('/interviews', interviewsRoutes);
router.use('/offers', offersRoutes);

router.post(
  '/candidates/:id/interviews',
  requireAuth,
  validate(createInterviewSchema),
  interviewsController.scheduleInterview,
);

router.post(
  '/candidates/:id/offers',
  requireAuth,
  validate(createOfferSchema),
  offersController.generateOffer,
);

export default router;
