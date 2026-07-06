import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { fail } from '../lib/response.js';

interface JwtPayload {
  sub: string;
  email: string;
  [key: string]: unknown;
}

// API2/API5: gates every non-public router by verifying the Supabase JWT signature locally with SUPABASE_JWT_SECRET.
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    fail(res, 401, 'UNAUTHORIZED', 'Missing or malformed Authorization header');
    return;
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, env.SUPABASE_JWT_SECRET) as JwtPayload;

    req.user = {
      id: decoded.sub,
      email: decoded.email,
    };

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      fail(res, 401, 'TOKEN_EXPIRED', 'JWT has expired');
      return;
    }
    fail(res, 401, 'UNAUTHORIZED', 'Invalid JWT');
  }
}
