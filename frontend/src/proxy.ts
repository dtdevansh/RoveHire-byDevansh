import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Auth gating is handled client-side (AuthProvider + (app)/layout.tsx)
// because Supabase JS stores sessions in localStorage, not cookies.
// Middleware only runs server-side and can't access localStorage.
export function proxy(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|apply).*)'],
};
