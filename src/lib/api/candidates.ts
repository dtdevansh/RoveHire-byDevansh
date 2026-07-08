import client, { unwrap } from './client';
import type { CandidateProfileDTO, CandidateListItemDTO, PaginationMeta } from '@/types/dto';

interface ListCandidatesParams {
  jobId?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface ListCandidatesResponse {
  candidates: CandidateListItemDTO[];
  pagination: PaginationMeta;
}

export async function listCandidates(
  params: ListCandidatesParams,
): Promise<ListCandidatesResponse> {
  const response = await client.get<{ data: ListCandidatesResponse }>(
    '/candidates',
    { params },
  );
  return unwrap(response);
}

export async function getCandidateProfile(
  id: string,
): Promise<CandidateProfileDTO> {
  const response = await client.get<{ data: CandidateProfileDTO }>(
    `/candidates/${id}`,
  );
  return unwrap(response);
}

export async function createCandidate(formData: FormData): Promise<{ id: string }> {
  const response = await client.post<{ data: { id: string } }>(
    '/candidates',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return unwrap(response);
}

export async function rejectCandidate(
  id: string,
  reason: string,
): Promise<void> {
  await client.post(`/candidates/${id}/reject`, { reason });
}

export async function hireCandidate(id: string): Promise<void> {
  await client.post(`/candidates/${id}/hire`);
}

export function getResumeUrl(id: string): string {
  return `${client.defaults.baseURL}/candidates/${id}/resume`;
}
