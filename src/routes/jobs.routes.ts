import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { validate } from '../middleware/validate.js';
import { createJobSchema, updateJobSchema, getJobSchema } from '../schemas/jobs.schema.js';
import * as jobsController from '../controllers/jobs.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', jobsController.listJobs);
router.post('/', validate(createJobSchema), jobsController.createJob);
router.get('/:id', validate(getJobSchema), jobsController.getJob);
router.patch('/:id', validate(updateJobSchema), jobsController.updateJob);

export default router;
