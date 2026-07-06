import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { validate } from '../middleware/validate.js';
import { createJobSchema, updateJobSchema, getJobSchema } from '../schemas/jobs.schema.js';
import * as jobsController from '../controllers/jobs.controller.js';

const router = Router();

// All job routes require authentication
router.use(requireAuth);

// GET    /api/v1/jobs      — List all jobs
router.get('/', jobsController.listJobs);

// POST   /api/v1/jobs      — Create a new job
router.post('/', validate(createJobSchema), jobsController.createJob);

// GET    /api/v1/jobs/:id   — Get a specific job
router.get('/:id', validate(getJobSchema), jobsController.getJob);

// PATCH  /api/v1/jobs/:id   — Update a job
router.patch('/:id', validate(updateJobSchema), jobsController.updateJob);

export default router;
