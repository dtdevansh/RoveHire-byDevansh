import axios from 'axios';
import { supabase } from '@/lib/supabase/client';

interface ApiEnvelope<T> {
  data: T;
  error?: string;
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
      return Promise.reject(new Error(envelope.error));
    }
    return response;
  },
  (error) => {
    if (axios.isAxiosError(error) && error.response) {
      const envelope = error.response.data as ApiEnvelope<unknown> | undefined;
      const message = envelope?.error ?? error.message;
      return Promise.reject(new Error(message));
    }
    return Promise.reject(error);
  },
);

export function unwrap<T>(response: { data: ApiEnvelope<T> }): T {
  return response.data.data;
}

export default client;
