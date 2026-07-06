import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { validate } from '../middleware/validate.js';
import { uploadResume } from '../middleware/upload.js';
import {
  listCandidatesSchema,
  getCandidateSchema,
  rejectCandidateSchema,
  hireCandidateSchema,
  getResumeSchema,
} from '../schemas/candidates.schema.js';
import * as candidatesController from '../controllers/candidates.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', validate(listCandidatesSchema), candidatesController.listCandidates);
router.post('/', uploadResume, candidatesController.createCandidate);
router.get('/:id', validate(getCandidateSchema), candidatesController.getCandidateProfile);
router.get('/:id/resume', validate(getResumeSchema), candidatesController.getResume);
router.post('/:id/reject', validate(rejectCandidateSchema), candidatesController.rejectCandidate);
router.post('/:id/hire', validate(hireCandidateSchema), candidatesController.hireCandidate);

export default router;
