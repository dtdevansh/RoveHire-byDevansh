import client, { unwrap } from './client';
import type { ApplyContextDTO } from '@/types/dto';

export type ApplyError = 'EXPIRED' | 'INVALID' | 'ALREADY_USED';

export async function getApplyContext(
  token: string,
): Promise<ApplyContextDTO> {
  const response = await client.get<{ data: ApplyContextDTO }>(
    `/apply/${token}`,
  );
  return unwrap(response);
}

export async function submitApplication(
  token: string,
  payload: {
    phone: string;
    current_location: string;
    current_role: string;
    notice_period: string;
    salary_expectation: string;
    linkedin_url: string;
  },
): Promise<void> {
  await client.post(`/apply/${token}`, payload);
}
