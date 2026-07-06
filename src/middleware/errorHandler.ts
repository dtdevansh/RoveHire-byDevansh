import type { Request, Response, NextFunction } from 'express';
import { MulterError } from 'multer';
import pino from 'pino';
import { AppError, ValidationError } from '../lib/errors.js';
import { fail } from '../lib/response.js';

const logger = pino({ name: 'error-handler' });

// API8: unexpected errors are logged server-side and never leak stack traces to the client.
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    if (err instanceof ValidationError) {
      fail(res, err.statusCode, err.code, err.message, err.details);
      return;
    }
    fail(res, err.statusCode, err.code, err.message);
    return;
  }

  if (err instanceof MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      fail(res, 422, 'FILE_TOO_LARGE', 'File exceeds the maximum allowed size');
      return;
    }
    fail(res, 422, 'UPLOAD_ERROR', err.message);
    return;
  }

  logger.error({ err, message: err.message, stack: err.stack }, 'Unhandled error');
  fail(res, 500, 'INTERNAL_ERROR', 'An unexpected error occurred');
}
