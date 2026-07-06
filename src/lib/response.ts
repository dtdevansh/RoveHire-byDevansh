import type { Response } from 'express';

interface SuccessResponse<T> {
  data: T;
  error: null;
  meta?: Record<string, unknown>;
}

interface ErrorResponse {
  data: null;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: undefined;
}

export function ok<T>(res: Response, data: T, meta?: Record<string, unknown>, statusCode = 200): void {
  const body: SuccessResponse<T> = { data, error: null };
  if (meta) {
    body.meta = meta;
  }
  res.status(statusCode).json(body);
}

export function fail(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: unknown,
): void {
  const body: ErrorResponse = {
    data: null,
    error: { code, message },
  };
  if (details !== undefined) {
    body.error.details = details;
  }
  res.status(statusCode).json(body);
}
