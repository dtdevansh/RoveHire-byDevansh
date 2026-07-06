import type { Request, Response, NextFunction } from 'express';
import type { AnyZodObject, ZodError } from 'zod';
import { fail } from '../lib/response.js';

/**
 * Generic Zod validation middleware.
 *
 * Validates req.body, req.params, and req.query against the provided schema.
 * On failure, returns a 422 with structured validation errors.
 * On success, replaces req.body/params/query with the parsed (whitelisted) values —
 * any fields not in the schema are stripped (API3).
 */
export function validate(schema: AnyZodObject) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      const zodError = result.error as ZodError;
      fail(res, 422, 'VALIDATION_ERROR', 'Request validation failed', zodError.flatten());
      return;
    }

    // Replace with parsed values (strips unknown fields)
    req.body = result.data.body ?? req.body;
    req.params = result.data.params ?? req.params;
    req.query = result.data.query ?? req.query;

    next();
  };
}
