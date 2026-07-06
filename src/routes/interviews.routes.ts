import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { validate } from '../middleware/validate.js';
import { updateInterviewSchema } from '../schemas/interviews.schema.js';
import * as interviewsController from '../controllers/interviews.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', interviewsController.listInterviews);
router.patch('/:id', validate(updateInterviewSchema), interviewsController.completeInterview);

export default router;
