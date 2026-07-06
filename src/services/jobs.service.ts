import { db } from '../db/client.js';
import { NotFoundError } from '../lib/errors.js';
import type { JobOpening } from '../types/models.js';
import type { JobListItemDTO } from '../types/dto.js';

export async function listJobs(): Promise<JobListItemDTO[]> {
  const { data: jobs, error } = await db
    .from('job_openings')
    .select('id, title, status, required_skills, created_at')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to list jobs: ${error.message}`);

  const { data: counts, error: countError } = await db
    .from('candidates')
    .select('job_opening_id');

  if (countError) throw new Error(`Failed to count candidates: ${countError.message}`);

  const countMap = new Map<string, number>();
  for (const row of counts ?? []) {
    const jobId = row.job_opening_id as string;
    countMap.set(jobId, (countMap.get(jobId) ?? 0) + 1);
  }

  return (jobs ?? []).map((job) => ({
    id: job.id as string,
    title: job.title as string,
    status: job.status as string,
    required_skills: job.required_skills as string[],
    candidate_count: countMap.get(job.id as string) ?? 0,
    created_at: job.created_at as string,
  }));
}

export async function createJob(data: {
  title: string;
  description?: string | null;
  required_skills?: string[];
  status?: string;
}): Promise<JobOpening> {
  const { data: job, error } = await db
    .from('job_openings')
    .insert({
      title: data.title,
      description: data.description ?? null,
      required_skills: data.required_skills ?? [],
      status: data.status ?? 'Open',
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create job: ${error.message}`);
  return job as unknown as JobOpening;
}

export async function getJob(id: string): Promise<JobOpening> {
  const { data: job, error } = await db
    .from('job_openings')
    .select()
    .eq('id', id)
    .single();

  if (error || !job) throw new NotFoundError(`Job opening not found: ${id}`);
  return job as unknown as JobOpening;
}

export async function updateJob(
  id: string,
  data: {
    title?: string;
    description?: string | null;
    required_skills?: string[];
    status?: string;
  },
): Promise<JobOpening> {
  const { data: job, error } = await db
    .from('job_openings')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error || !job) throw new NotFoundError(`Job opening not found: ${id}`);
  return job as unknown as JobOpening;
}
