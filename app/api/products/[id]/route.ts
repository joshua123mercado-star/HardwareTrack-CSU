/**
 * app/api/products/[id]/route.ts
 * DELETE → removes a product by id
 */
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = getSupabaseAdmin();
    const { error } = await admin.from('products').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/products/[id]]', err);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}

