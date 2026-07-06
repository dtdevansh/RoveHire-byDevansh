import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';
import { r2Client } from '../config/r2.js';
import { env } from '../config/env.js';

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

// API3: raw R2 keys never leave the server — clients only ever receive short-TTL signed URLs.
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

export function buildResumeKey(candidateId: string): string {
  return `resumes/${candidateId}/${randomUUID()}.pdf`;
}

export function buildOfferKey(
  candidateId: string,
  offerId: string,
  kind: 'offer' | 'nda',
): string {
  return `offers/${candidateId}/${offerId}-${kind}.pdf`;
}
