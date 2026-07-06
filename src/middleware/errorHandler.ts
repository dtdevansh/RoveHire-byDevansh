import type { Request, Response, NextFunction } from 'express';
import { MulterError } from 'multer';
import { AppError, ValidationError } from '../lib/errors.js';
import { fail } from '../lib/response.js';
import pino from 'pino';

const logger = pino({ name: 'error-handler' });

/**
 * Centralized error handler.
 *
 * - Maps AppError subclasses to their status codes
 * - Handles Multer errors (file upload issues)
 * - Catches unexpected errors → 500 with no stack leak (API8)
 * - Logs full error details server-side
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Operational AppErrors — expected, safe to expose
  if (err instanceof AppError) {
    if (err instanceof ValidationError) {
      fail(res, err.statusCode, err.code, err.message, err.details);
      return;
    }
    fail(res, err.statusCode, err.code, err.message);
    return;
  }

  // Multer file upload errors
  if (err instanceof MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      fail(res, 422, 'FILE_TOO_LARGE', 'File exceeds the maximum allowed size');
      return;
    }
    fail(res, 422, 'UPLOAD_ERROR', err.message);
    return;
  }

  // Unexpected errors — log full details, never expose stack to client
  logger.error({ err, message: err.message, stack: err.stack }, 'Unhandled error');
  fail(res, 500, 'INTERNAL_ERROR', 'An unexpected error occurred');
}
