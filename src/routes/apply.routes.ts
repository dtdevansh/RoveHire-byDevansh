import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { publicLimiter } from '../middleware/rateLimiters.js';
import { getApplyContextSchema, submitApplicationSchema } from '../schemas/apply.schema.js';
import * as applyController from '../controllers/apply.controller.js';

const router = Router();

// PUBLIC — no requireAuth, stricter rate limit
router.use(publicLimiter);

// GET    /api/v1/apply/:token   — Validate token + get context
router.get('/:token', validate(getApplyContextSchema), applyController.getApplyContext);

// POST   /api/v1/apply/:token   — Submit the application form
router.post('/:token', validate(submitApplicationSchema), applyController.submitApplication);

export default router;
