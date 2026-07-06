import type { Request, Response, NextFunction } from 'express';
import type { AnyZodObject, ZodError } from 'zod';
import { fail } from '../lib/response.js';

// API3: schemas whitelist fields, so parsing strips any unknown keys before they reach a service.
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

    req.body = result.data.body ?? req.body;
    req.params = result.data.params ?? req.params;
    req.query = result.data.query ?? req.query;

    next();
  };
}
