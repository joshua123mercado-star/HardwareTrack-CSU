import { type NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/middleware';

/**
 * proxy.ts — Next.js 16 Proxy (formerly "middleware")
 * Runs before every matched request to keep Supabase sessions refreshed.
 */
export function proxy(request: NextRequest) {
  return createClient(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static  (static files)
     * - _next/image   (image optimisation)
     * - favicon.ico
     * - public asset files (svg, png, jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

