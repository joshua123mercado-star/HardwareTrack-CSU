/**
 * app/api/users/[id]/route.ts
 * PATCH → partial update (status toggle, password reset, etc.)
 */
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { User } from '@/lib/types';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: Partial<User> = await req.json();
    const admin = getSupabaseAdmin();

    // Map camelCase → snake_case selectively
    const patch: Record<string, unknown> = {};
    if (body.name !== undefined)     patch.name = body.name;
    if (body.email !== undefined)    patch.email = body.email;
    if (body.username !== undefined) patch.username = body.username;
    if (body.password !== undefined) patch.password = body.password;
    if (body.role !== undefined)     patch.role = body.role;
    if (body.status !== undefined)   patch.status = body.status;

    const { error } = await admin.from('hw_users').update(patch).eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[PATCH /api/users/[id]]', err);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

