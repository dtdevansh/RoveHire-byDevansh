import type { Request, Response, NextFunction } from 'express';
import { createRemoteJWKSet, jwtVerify, errors as joseErrors } from 'jose';
import { env } from '../config/env.js';
import { fail } from '../lib/response.js';

const JWKS = createRemoteJWKSet(new URL(env.SUPABASE_JWKS_URL));

// API2/API5: gates every non-public router by verifying the Supabase JWT against the project JWKS.
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    fail(res, 401, 'UNAUTHORIZED', 'Missing or malformed Authorization header');
    return;
  }

  const token = authHeader.slice(7);

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `${env.SUPABASE_URL}/auth/v1`,
      audience: 'authenticated',
    });

    req.user = {
      id: payload.sub as string,
      email: payload.email as string,
    };

    next();
  } catch (err) {
    if (err instanceof joseErrors.JWTExpired) {
      fail(res, 401, 'TOKEN_EXPIRED', 'JWT has expired');
      return;
    }
    fail(res, 401, 'UNAUTHORIZED', 'Invalid JWT');
  }
}
