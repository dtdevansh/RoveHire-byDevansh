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

// All candidate routes require authentication
router.use(requireAuth);

// GET    /api/v1/candidates              — List candidates
router.get('/', validate(listCandidatesSchema), candidatesController.listCandidates);

// POST   /api/v1/candidates              — Create candidate (multipart upload)
router.post('/', uploadResume, candidatesController.createCandidate);

// GET    /api/v1/candidates/:id          — Get candidate profile
router.get('/:id', validate(getCandidateSchema), candidatesController.getCandidateProfile);

// GET    /api/v1/candidates/:id/resume   — Get resume download URL
router.get('/:id/resume', validate(getResumeSchema), candidatesController.getResume);

// POST   /api/v1/candidates/:id/reject   — Reject candidate
router.post('/:id/reject', validate(rejectCandidateSchema), candidatesController.rejectCandidate);

// POST   /api/v1/candidates/:id/hire     — Hire candidate
router.post('/:id/hire', validate(hireCandidateSchema), candidatesController.hireCandidate);

export default router;
