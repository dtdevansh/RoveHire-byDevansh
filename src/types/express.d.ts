// Augment Express Request to include the authenticated user payload.
// This is populated by the requireAuth middleware after JWT verification.

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export {};
