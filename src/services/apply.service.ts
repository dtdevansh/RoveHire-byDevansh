import { db } from '../db/client.js';
import { NotFoundError, TokenExpiredError, TokenUsedError } from '../lib/errors.js';
import { hashToken } from '../lib/tokens.js';
import { appendEvent } from './timeline.service.js';
import type { ApplyContextDTO } from '../types/dto.js';

export async function getApplyContext(rawToken: string): Promise<ApplyContextDTO> {
  const tokenHash = hashToken(rawToken);

  const { data: token, error } = await db
    .from('application_tokens')
    .select('candidate_id, expires_at, used_at')
    .eq('token_hash', tokenHash)
    .single();

  if (error || !token) throw new NotFoundError('Invalid application link');
  if (token.used_at) throw new TokenUsedError();
  if (new Date(token.expires_at as string) < new Date()) throw new TokenExpiredError();

  const { data: candidate } = await db
    .from('candidates')
    .select('name, job_opening_id')
    .eq('id', token.candidate_id)
    .single();

  if (!candidate) throw new NotFoundError('Candidate not found');

  const { data: job } = await db
    .from('job_openings')
    .select('title')
    .eq('id', candidate.job_opening_id)
    .single();

  return {
    candidate_name: candidate.name as string,
    role: (job?.title as string) ?? '',
  };
}

export async function submitApplication(
  rawToken: string,
  data: {
    phone?: string;
    current_location?: string;
    current_role?: string;
    notice_period?: string;
    salary_expectation?: string;
    linkedin_url?: string;
  },
): Promise<void> {
  const tokenHash = hashToken(rawToken);

  const { data: token, error } = await db
    .from('application_tokens')
    .select('id, candidate_id, expires_at, used_at')
    .eq('token_hash', tokenHash)
    .single();

  if (error || !token) throw new NotFoundError('Invalid application link');
  if (token.used_at) throw new TokenUsedError();
  if (new Date(token.expires_at as string) < new Date()) throw new TokenExpiredError();

  const { error: tokenUpdateError } = await db
    .from('application_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('id', token.id);

  if (tokenUpdateError) {
    throw new Error(`Failed to mark token as used: ${tokenUpdateError.message}`);
  }

  // API7: linkedin_url is stored as-is and never fetched server-side (SSRF guard).
  const { error: candidateError } = await db
    .from('candidates')
    .update({
      phone: data.phone ?? null,
      current_location: data.current_location ?? null,
      current_role: data.current_role ?? null,
      notice_period: data.notice_period ?? null,
      salary_expectation: data.salary_expectation ?? null,
      linkedin_url: data.linkedin_url ?? null,
      status: 'Form Submitted',
      last_activity_at: new Date().toISOString(),
    })
    .eq('id', token.candidate_id);

  if (candidateError) {
    throw new Error(`Failed to update candidate: ${candidateError.message}`);
  }

  await appendEvent(
    token.candidate_id as string,
    'form_submitted',
    'Candidate submitted the application form',
  );
}
