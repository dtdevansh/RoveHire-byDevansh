import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { validate } from '../middleware/validate.js';
import { downloadOfferSchema } from '../schemas/offers.schema.js';
import * as offersController from '../controllers/offers.controller.js';

const router = Router();

// All offer routes require authentication
router.use(requireAuth);

// GET    /api/v1/offers/:id/download?doc=offer|nda  — Download offer or NDA
router.get('/:id/download', validate(downloadOfferSchema), offersController.downloadOffer);

export default router;
