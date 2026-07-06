import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { publicLimiter } from '../middleware/rateLimiters.js';
import { getApplyContextSchema, submitApplicationSchema } from '../schemas/apply.schema.js';
import * as applyController from '../controllers/apply.controller.js';

const router = Router();

// API6: public application surface — no requireAuth, guarded by the stricter publicLimiter.
router.use(publicLimiter);

router.get('/:token', validate(getApplyContextSchema), applyController.getApplyContext);
router.post('/:token', validate(submitApplicationSchema), applyController.submitApplication);

export default router;
