import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { validate } from '../middleware/validate.js';
import { updateInterviewSchema } from '../schemas/interviews.schema.js';
import * as interviewsController from '../controllers/interviews.controller.js';

const router = Router();

// All interview routes require authentication
router.use(requireAuth);

// GET    /api/v1/interviews             — List all interviews
router.get('/', interviewsController.listInterviews);

// PATCH  /api/v1/interviews/:id         — Complete an interview with feedback
router.patch('/:id', validate(updateInterviewSchema), interviewsController.completeInterview);

export default router;
