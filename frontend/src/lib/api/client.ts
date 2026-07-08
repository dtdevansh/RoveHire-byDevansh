import axios from 'axios';
import { supabase } from '@/lib/supabase/client';

interface ApiEnvelope<T> {
  data: T;
  error: { code: string; message: string; details?: unknown } | null;
  meta?: Record<string, unknown>;
}

const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => {
    const envelope = response.data as ApiEnvelope<unknown>;
    if (envelope.error) {
      const err = new Error(envelope.error.message) as Error & {
        code?: string;
        status?: number;
      };
      err.code = envelope.error.code;
      err.status = response.status;
      return Promise.reject(err);
    }
    return response;
  },
  (error) => {
    if (axios.isAxiosError(error) && error.response) {
      const envelope = error.response.data as ApiEnvelope<unknown> | undefined;
      const message = envelope?.error?.message ?? error.message;
      const err = new Error(message) as Error & {
        code?: string;
        status?: number;
      };
      err.code = envelope?.error?.code;
      err.status = error.response.status;
      return Promise.reject(err);
    }
    return Promise.reject(error);
  },
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function unwrap<T>(response: { data: { data: T; [k: string]: any } }): T {
  return response.data.data;
}

/** Unwrap both data and meta from the envelope (for paginated endpoints). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function unwrapWithMeta<T>(
  response: { data: { data: T; meta?: Record<string, unknown>; [k: string]: any } },
): { data: T; meta: Record<string, unknown> } {
  return {
    data: response.data.data,
    meta: response.data.meta ?? {},
  };
}

export default client;
