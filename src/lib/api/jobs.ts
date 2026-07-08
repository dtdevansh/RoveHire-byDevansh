import client, { unwrap } from './client';
import type { JobOpening } from '@/types/models';
import type { JobListItemDTO } from '@/types/dto';

export async function listJobs(): Promise<JobListItemDTO[]> {
  const response = await client.get<{ data: JobListItemDTO[] }>('/jobs');
  return unwrap(response);
}

export async function getJob(id: string): Promise<JobOpening> {
  const response = await client.get<{ data: JobOpening }>(`/jobs/${id}`);
  return unwrap(response);
}

export async function createJob(
  payload: Pick<JobOpening, 'title' | 'description' | 'required_skills'> & {
    status?: JobOpening['status'];
  },
): Promise<JobOpening> {
  const response = await client.post<{ data: JobOpening }>('/jobs', payload);
  return unwrap(response);
}

export async function updateJob(
  id: string,
  payload: Partial<Pick<JobOpening, 'title' | 'description' | 'required_skills' | 'status'>>,
): Promise<JobOpening> {
  const response = await client.patch<{ data: JobOpening }>(
    `/jobs/${id}`,
    payload,
  );
  return unwrap(response);
}
