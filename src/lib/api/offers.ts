import client, { unwrap } from './client';
import type { OfferDocument } from '@/types/models';

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
): Promise<OfferDocument> {
  const response = await client.post<{ data: OfferDocument }>(
    `/candidates/${candidateId}/offers`,
    payload,
  );
  return unwrap(response);
}

export function getOfferDownloadUrl(id: string): string {
  return `${client.defaults.baseURL}/offers/${id}/download`;
}
