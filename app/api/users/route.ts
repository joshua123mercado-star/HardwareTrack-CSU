/**
 * app/api/users/route.ts
 * GET  → returns all users (staff + owner list for auth)
 * POST → upserts a user
 */
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { User } from '@/lib/types';

function toRow(u: User) {
  return {
    id: u.id,
    name: u.name,
    username: u.username,
    email: u.email,
    password: u.password ?? null,
    role: u.role,
    status: u.status,
    created_at: u.createdAt,
  };
}

function fromRow(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    name: row.name as string,
    username: row.username as string,
    email: row.email as string,
    password: (row.password as string) ?? undefined,
    role: row.role as User['role'],
    status: row.status as User['status'],
    createdAt: row.created_at as string,
  };
}

export async function GET() {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from('hw_users')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return NextResponse.json((data ?? []).map(fromRow));
  } catch (err) {
    console.error('[GET /api/users]', err);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body: User = await req.json();
    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from('hw_users')
      .upsert(toRow(body), { onConflict: 'id' });

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[POST /api/users]', err);
    return NextResponse.json({ error: 'Failed to save user' }, { status: 500 });
  }
}

