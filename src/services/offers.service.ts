import { randomUUID } from 'node:crypto';
import { db } from '../db/client.js';
import { NotFoundError, ConflictError } from '../lib/errors.js';
import { uploadObject, buildOfferKey, getSignedDownloadUrl } from '../lib/storage.js';
import { renderOfferLetter, renderNDA } from '../lib/pdf/render.js';
import { canTransition } from './stateMachine.js';
import { appendEvent } from './timeline.service.js';
import type { OfferDocument, CandidateStatus } from '../types/models.js';

export async function generateOffer(
  candidateId: string,
  data: {
    role_title: string;
    salary_currency: string;
    salary_amount: number;
    start_date: string;
    manager_name: string;
    location: string;
  },
): Promise<{
  offer: OfferDocument;
  offer_download_url: string;
  nda_download_url: string;
}> {
  const { data: candidate, error: fetchError } = await db
    .from('candidates')
    .select('id, name, status')
    .eq('id', candidateId)
    .single();

  if (fetchError || !candidate) throw new NotFoundError(`Candidate not found: ${candidateId}`);

  const currentStatus = candidate.status as CandidateStatus;

  const { count: completedCount } = await db
    .from('interviews')
    .select('id', { count: 'exact', head: true })
    .eq('candidate_id', candidateId)
    .eq('outcome', 'Completed');

  const hasCompletedInterview = (completedCount ?? 0) > 0;

  const { count: offerCount } = await db
    .from('offer_documents')
    .select('id', { count: 'exact', head: true })
    .eq('candidate_id', candidateId);

  const isFirstOffer = (offerCount ?? 0) === 0;

  if (isFirstOffer) {
    const result = canTransition(currentStatus, 'Offer Sent', {
      hasCompletedInterview,
      hasOffer: false,
    });

    if (!result.ok) throw new ConflictError(result.reason);
  } else if (currentStatus === 'Hired') {
    throw new ConflictError('Cannot generate offers for a hired candidate');
  }

  const offerId = randomUUID();

  const offerLetterBuffer = await renderOfferLetter({
    candidateName: candidate.name as string,
    roleTitle: data.role_title,
    salaryCurrency: data.salary_currency,
    salaryAmount: data.salary_amount,
    startDate: data.start_date,
    managerName: data.manager_name,
    location: data.location,
  });

  const ndaBuffer = await renderNDA({
    candidateName: candidate.name as string,
    roleTitle: data.role_title,
    startDate: data.start_date,
  });

  const offerLetterKey = buildOfferKey(candidateId, offerId, 'offer');
  const ndaKey = buildOfferKey(candidateId, offerId, 'nda');

  await Promise.all([
    uploadObject(offerLetterKey, offerLetterBuffer, 'application/pdf'),
    uploadObject(ndaKey, ndaBuffer, 'application/pdf'),
  ]);

  const { data: offer, error: insertError } = await db
    .from('offer_documents')
    .insert({
      id: offerId,
      candidate_id: candidateId,
      offer_letter_key: offerLetterKey,
      nda_key: ndaKey,
      role_title: data.role_title,
      salary_currency: data.salary_currency,
      salary_amount: data.salary_amount,
      start_date: data.start_date,
      manager_name: data.manager_name,
      location: data.location,
    })
    .select()
    .single();

  if (insertError || !offer) {
    throw new Error(`Failed to create offer: ${insertError?.message}`);
  }

  if (isFirstOffer) {
    await db
      .from('candidates')
      .update({
        status: 'Offer Sent',
        last_activity_at: new Date().toISOString(),
      })
      .eq('id', candidateId);
  } else {
    await db
      .from('candidates')
      .update({ last_activity_at: new Date().toISOString() })
      .eq('id', candidateId);
  }

  await appendEvent(
    candidateId,
    'offer_generated',
    `Offer generated: ${data.role_title} at ${data.salary_currency} ${data.salary_amount}`,
    { offer_id: offerId, role_title: data.role_title, salary_amount: data.salary_amount },
  );

  const [offerDownloadUrl, ndaDownloadUrl] = await Promise.all([
    getSignedDownloadUrl(offerLetterKey),
    getSignedDownloadUrl(ndaKey),
  ]);

  return {
    offer: offer as unknown as OfferDocument,
    offer_download_url: offerDownloadUrl,
    nda_download_url: ndaDownloadUrl,
  };
}

export async function getOfferDownloadUrl(
  offerId: string,
  doc: 'offer' | 'nda',
): Promise<string> {
  const { data: offer, error } = await db
    .from('offer_documents')
    .select('offer_letter_key, nda_key')
    .eq('id', offerId)
    .single();

  if (error || !offer) throw new NotFoundError(`Offer not found: ${offerId}`);

  const key = doc === 'offer'
    ? (offer.offer_letter_key as string)
    : (offer.nda_key as string);

  return getSignedDownloadUrl(key);
}
