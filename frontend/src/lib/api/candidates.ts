import client, { unwrap, unwrapWithMeta } from './client';
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
  const response = await client.get<{
    data: CandidateListItemDTO[];
    meta?: Record<string, unknown>;
  }>('/candidates', { params });
  const { data, meta } = unwrapWithMeta(response);
  return {
    candidates: data,
    pagination: {
      page: (meta.page as number) ?? params.page ?? 1,
      limit: (meta.limit as number) ?? params.limit ?? 8,
      total: (meta.total as number) ?? 0,
    },
  };
}

export async function getCandidateProfile(
  id: string,
): Promise<CandidateProfileDTO> {
  const response = await client.get<{ data: CandidateProfileDTO }>(
    `/candidates/${id}`,
  );
  return unwrap(response);
}

export async function createCandidate(
  formData: FormData,
): Promise<{ id: string; application_url: string }> {
  const response = await client.post<{
    data: { candidate: { id: string }; application_link: string };
  }>('/candidates', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const result = unwrap(response);
  return {
    id: result.candidate.id,
    application_url: result.application_link,
  };
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

export async function getResumeUrl(id: string): Promise<string> {
  const response = await client.get<{ data: { url: string } }>(
    `/candidates/${id}/resume`,
  );
  return unwrap(response).url;
}
