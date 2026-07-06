import { randomBytes, createHash } from 'node:crypto';
import { env } from '../config/env.js';

export function generateMagicToken(): string {
  return randomBytes(32).toString('hex');
}

export function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

export function buildApplyLink(rawToken: string): string {
  return `${env.FRONTEND_ORIGIN}/apply/${rawToken}`;
}
