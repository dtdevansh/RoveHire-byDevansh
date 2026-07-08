import client, { unwrap } from './client';
import type { ApplyContextDTO } from '@/types/dto';

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
  formData: FormData,
): Promise<void> {
  await client.post(`/apply/${token}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}
