import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';
import { r2Client } from '../config/r2.js';
import { env } from '../config/env.js';

/**
 * Upload a file to R2.
 */
export async function uploadObject(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<void> {
  await r2Client.send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

/**
 * Generate a short-TTL presigned download URL for an R2 object.
 * Raw R2 keys never leave the server — only signed URLs are returned to clients.
 */
export async function getSignedDownloadUrl(
  key: string,
  ttl: number = env.SIGNED_URL_TTL_SECONDS,
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: env.R2_BUCKET,
    Key: key,
  });
  return getSignedUrl(r2Client, command, { expiresIn: ttl });
}

/**
 * Build a unique R2 key for a candidate's resume.
 * Format: resumes/<candidateId>/<uuid>.pdf
 */
export function buildResumeKey(candidateId: string): string {
  return `resumes/${candidateId}/${randomUUID()}.pdf`;
}

/**
 * Build a unique R2 key for an offer/NDA document.
 * Format: offers/<candidateId>/<offerId>-<kind>.pdf
 */
export function buildOfferKey(
  candidateId: string,
  offerId: string,
  kind: 'offer' | 'nda',
): string {
  return `offers/${candidateId}/${offerId}-${kind}.pdf`;
}
