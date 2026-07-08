import client, { unwrap } from './client';
import type { OfferDocument } from '@/types/models';

export interface GeneratedOffer extends OfferDocument {
  offer_download_url: string;
  nda_download_url: string;
  offer_size_bytes: number;
  nda_size_bytes: number;
}

export async function generateOffer(
  candidateId: string,
  payload: {
    role_title: string;
    salary_currency: string;
    salary_amount: number;
    start_date: string;
    manager_name: string;
    location: string;
  },
): Promise<GeneratedOffer> {
  const response = await client.post<{ data: GeneratedOffer }>(
    `/candidates/${candidateId}/offers`,
    payload,
  );
  return unwrap(response);
}

export async function getOfferDownloadUrl(
  id: string,
  doc: 'offer' | 'nda',
): Promise<string> {
  const response = await client.get<{ data: { url: string } }>(
    `/offers/${id}/download`,
    { params: { doc } },
  );
  return unwrap(response).url;
}
