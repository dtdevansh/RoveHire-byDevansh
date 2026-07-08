import { randomUUID } from 'node:crypto';
import { db } from '../db/client.js';
import { env } from '../config/env.js';
import { NotFoundError, ConflictError } from '../lib/errors.js';
import { uploadObject, buildResumeKey, getSignedDownloadUrl } from '../lib/storage.js';
import { generateMagicToken, hashToken, buildApplyLink } from '../lib/tokens.js';
import { appendEvent } from './timeline.service.js';
import { canTransition, allowedActions } from './stateMachine.js';
import type { Candidate, CandidateStatus } from '../types/models.js';
import type { CandidateProfileDTO, CandidateListItemDTO, PaginationMeta } from '../types/dto.js';

export async function listCandidates(options: {
  status?: CandidateStatus;
  search?: string;
  page: number;
  limit: number;
}): Promise<{ items: CandidateListItemDTO[]; meta: PaginationMeta }> {
  const { page, limit, status, search } = options;
  const offset = (page - 1) * limit;

  let query = db
    .from('candidates')
    .select('id, name, current_role, status, last_activity_at', { count: 'exact' });

  if (status) {
    query = query.eq('status', status);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,current_role.ilike.%${search}%`);
  }

  const { data, count, error } = await query
    .order('last_activity_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(`Failed to list candidates: ${error.message}`);

  const items: CandidateListItemDTO[] = (data ?? []).map((c) => ({
    id: c.id as string,
    name: c.name as string,
    role: (c.current_role as string) ?? '',
    status: c.status as CandidateStatus,
    last_activity_at: c.last_activity_at as string,
  }));

  return {
    items,
    meta: { page, limit, total: count ?? 0 },
  };
}

export async function createCandidate(data: {
  name: string;
  email: string;
  job_opening_id: string;
  resumeBuffer: Buffer;
}): Promise<{ candidate: Candidate; application_link: string }> {
  const { data: job, error: jobError } = await db
    .from('job_openings')
    .select('id, status')
    .eq('id', data.job_opening_id)
    .single();

  if (jobError || !job) {
    throw new NotFoundError(`Job opening not found: ${data.job_opening_id}`);
  }

  if (job.status === 'Closed') {
    throw new ConflictError('Cannot add candidates to a closed job opening');
  }

  const candidateId = randomUUID();
  const resumeKey = buildResumeKey(candidateId);
  await uploadObject(resumeKey, data.resumeBuffer, 'application/pdf');

  const { data: candidate, error: candidateError } = await db
    .from('candidates')
    .insert({
      id: candidateId,
      name: data.name,
      email: data.email,
      job_opening_id: data.job_opening_id,
      resume_key: resumeKey,
      status: 'Applied',
    })
    .select()
    .single();

  if (candidateError) {
    throw new Error(`Failed to create candidate: ${candidateError.message}`);
  }

  const rawToken = generateMagicToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + env.MAGIC_LINK_TTL_DAYS);

  const { error: tokenError } = await db
    .from('application_tokens')
    .insert({
      candidate_id: candidateId,
      token_hash: tokenHash,
      expires_at: expiresAt.toISOString(),
    });

  if (tokenError) {
    throw new Error(`Failed to create application token: ${tokenError.message}`);
  }

  await appendEvent(candidateId, 'applied', `${data.name} applied for the position`);

  return {
    candidate: candidate as unknown as Candidate,
    application_link: buildApplyLink(rawToken),
  };
}

export async function getCandidateProfile(id: string): Promise<CandidateProfileDTO> {
  const { data: candidate, error } = await db
    .from('candidates')
    .select()
    .eq('id', id)
    .single();

  if (error || !candidate) throw new NotFoundError(`Candidate not found: ${id}`);

  const { data: job } = await db
    .from('job_openings')
    .select('id, title')
    .eq('id', candidate.job_opening_id)
    .single();

  const { data: interviews } = await db
    .from('interviews')
    .select()
    .eq('candidate_id', id)
    .order('scheduled_at', { ascending: false });

  const { data: offers } = await db
    .from('offer_documents')
    .select()
    .eq('candidate_id', id)
    .order('created_at', { ascending: false });

  const { data: timeline } = await db
    .from('timeline_events')
    .select()
    .eq('candidate_id', id)
    .order('created_at', { ascending: false });

  const resumeDownloadUrl = await getSignedDownloadUrl(candidate.resume_key as string);

  const offersWithUrls = await Promise.all(
    (offers ?? []).map(async (offer) => ({
      ...offer,
      offer_download_url: await getSignedDownloadUrl(offer.offer_letter_key as string),
      nda_download_url: await getSignedDownloadUrl(offer.nda_key as string),
    })),
  );

  const hasCompletedInterview = (interviews ?? []).some((i) => i.outcome === 'Completed');
  const hasOffer = (offers ?? []).length > 0;

  const actions = allowedActions(candidate.status as CandidateStatus, {
    hasCompletedInterview,
    hasOffer,
  });

  return {
    id: candidate.id,
    name: candidate.name,
    email: candidate.email,
    status: candidate.status as CandidateStatus,
    phone: candidate.phone,
    current_location: candidate.current_location,
    current_role: candidate.current_role,
    notice_period: candidate.notice_period,
    salary_expectation: candidate.salary_expectation,
    linkedin_url: candidate.linkedin_url,
    rejection_reason: candidate.rejection_reason,
    job_opening: {
      id: job?.id ?? '',
      title: (job?.title as string) ?? '',
    },
    resume_download_url: resumeDownloadUrl,
    interviews: (interviews ?? []) as CandidateProfileDTO['interviews'],
    offers: offersWithUrls as CandidateProfileDTO['offers'],
    timeline: (timeline ?? []) as CandidateProfileDTO['timeline'],
    allowed_actions: actions,
    created_at: candidate.created_at,
    last_activity_at: candidate.last_activity_at,
  } satisfies CandidateProfileDTO;
}

export async function getResumeUrl(candidateId: string): Promise<string> {
  const { data: candidate, error } = await db
    .from('candidates')
    .select('resume_key')
    .eq('id', candidateId)
    .single();

  if (error || !candidate) throw new NotFoundError(`Candidate not found: ${candidateId}`);
  return getSignedDownloadUrl(candidate.resume_key as string);
}

export async function rejectCandidate(id: string, reason: string): Promise<Candidate> {
  const { data: candidate, error: fetchError } = await db
    .from('candidates')
    .select('status')
    .eq('id', id)
    .single();

  if (fetchError || !candidate) throw new NotFoundError(`Candidate not found: ${id}`);

  const currentStatus = candidate.status as CandidateStatus;
  const result = canTransition(currentStatus, 'Rejected', {
    hasCompletedInterview: false,
    hasOffer: false,
    rejectionReason: reason,
  });

  if (!result.ok) {
    throw new ConflictError(result.reason);
  }

  const { data: updated, error: updateError } = await db
    .from('candidates')
    .update({
      status: 'Rejected',
      rejection_reason: reason,
      last_activity_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (updateError || !updated) throw new Error(`Failed to reject candidate: ${updateError?.message}`);

  await appendEvent(id, 'rejected', `Candidate rejected: ${reason}`);

  return updated as unknown as Candidate;
}

export async function hireCandidate(id: string): Promise<Candidate> {
  const { data: candidate, error: fetchError } = await db
    .from('candidates')
    .select('status')
    .eq('id', id)
    .single();

  if (fetchError || !candidate) throw new NotFoundError(`Candidate not found: ${id}`);

  const { count: offerCount } = await db
    .from('offer_documents')
    .select('id', { count: 'exact', head: true })
    .eq('candidate_id', id);

  const currentStatus = candidate.status as CandidateStatus;
  const result = canTransition(currentStatus, 'Hired', {
    hasCompletedInterview: true,
    hasOffer: (offerCount ?? 0) > 0,
  });

  if (!result.ok) {
    throw new ConflictError(result.reason);
  }

  const { data: updated, error: updateError } = await db
    .from('candidates')
    .update({
      status: 'Hired',
      last_activity_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (updateError || !updated) throw new Error(`Failed to hire candidate: ${updateError?.message}`);

  await appendEvent(id, 'hired', 'Candidate has been hired');

  return updated as unknown as Candidate;
}

export async function touchActivity(candidateId: string): Promise<void> {
  await db
    .from('candidates')
    .update({ last_activity_at: new Date().toISOString() })
    .eq('id', candidateId);
}
