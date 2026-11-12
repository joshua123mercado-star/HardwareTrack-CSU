/**
 * lib/supabase.ts
 * Supabase client instances for the project.
 *
 * - `getSupabaseAdmin` → server-only admin client (service-role, API routes only)
 *
 * For Server Components and Route Handlers use:
 *   import { createClient } from '@/utils/supabase/server'
 * For Client Components use:
 *   import { createClient } from '@/utils/supabase/client'
 */

import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

/**
 * Admin Supabase client using the service-role key.
 * ⚠️  NEVER import this in 'use client' files — server-only.
 *     Only for Route Handlers (app/api/**).
 */
export function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local'
    );
  }

  return createSupabaseAdmin(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
