import { randomUUID } from 'node:crypto';
import { supabase } from '../config/supabase.js';
import { env } from '../config/env.js';

const bucket = () => supabase.storage.from(env.SUPABASE_STORAGE_BUCKET);

export async function uploadObject(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<void> {
  const { error } = await bucket().upload(key, body, {
    contentType,
    upsert: true,
  });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);
}

// Raw storage keys never leave the server — clients only ever receive short-TTL signed URLs.
export async function getSignedDownloadUrl(
  key: string,
  ttl: number = env.SIGNED_URL_TTL_SECONDS,
): Promise<string> {
  const { data, error } = await bucket().createSignedUrl(key, ttl);

  if (error || !data?.signedUrl) {
    throw new Error(`Failed to create signed URL: ${error?.message ?? 'unknown'}`);
  }

  return data.signedUrl;
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
