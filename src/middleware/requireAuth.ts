import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { fail } from '../lib/response.js';

interface JwtPayload {
  sub: string;
  email: string;
  [key: string]: unknown;
}

/**
 * Verify Supabase-issued JWT from the Authorization header.
 * Attaches { id, email } to req.user on success.
 *
 * No round-trip to Supabase per request — verification is done locally
 * using the JWT secret.
 */
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
