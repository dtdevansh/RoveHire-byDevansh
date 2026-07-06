import { randomBytes, createHash } from 'node:crypto';
import { env } from '../config/env.js';

/**
 * Generate a cryptographically random, URL-safe token.
 * 32 bytes → 64 hex characters.
 */
export function generateMagicToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Hash a raw token with SHA-256.
 * Only the hash is stored in the database — the raw token exists only in the link.
 */
export function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

/**
 * Build the full public application link for a candidate.
 */
export function buildApplyLink(rawToken: string): string {
  return `${env.FRONTEND_ORIGIN}/apply/${rawToken}`;
}
