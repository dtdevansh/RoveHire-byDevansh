import client, { unwrap } from './client';
import type { Interview, InterviewType, Recommendation } from '@/types/models';

export async function listInterviews(): Promise<Interview[]> {
  const response = await client.get<{ data: Interview[] }>('/interviews');
  return unwrap(response);
}

export async function scheduleInterview(
  candidateId: string,
  payload: {
    scheduled_at: string;
    type: InterviewType;
    interviewer_name: string;
    notes?: string;
  },
): Promise<Interview> {
  const response = await client.post<{ data: Interview }>(
    `/candidates/${candidateId}/interviews`,
    payload,
  );
  return unwrap(response);
}

export async function completeInterview(
  id: string,
  payload: {
    recommendation: Recommendation;
    feedback_note: string;
  },
): Promise<Interview> {
  const response = await client.patch<{ data: Interview }>(
    `/interviews/${id}`,
    {
      outcome: 'Completed',
      recommendation: payload.recommendation,
      feedback_note: payload.feedback_note,
    },
  );
  return unwrap(response);
}
