import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { getMe } from '../controllers/auth.controller.js';

const router = Router();

// GET /api/v1/me — returns authenticated user identity
router.get('/me', requireAuth, getMe);

export default router;
