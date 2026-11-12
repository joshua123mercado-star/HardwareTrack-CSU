/**
 * app/api/logs/route.ts
 * GET  → returns all activity logs
 * POST → appends a new log entry
 */
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { StockActivityLog } from '@/lib/types';

function toRow(l: StockActivityLog) {
  return {
    id: l.id,
    timestamp: l.timestamp,
    product_id: l.productId,
    product_name: l.productName,
    sku: l.sku,
    action_type: l.actionType,
    quantity_change: l.quantityChange,
    previous_stock: l.previousStock,
    new_stock: l.newStock,
    reason: l.reason ?? null,
    user_id: l.userId,
    user_name: l.userName,
  };
}

function fromRow(row: Record<string, unknown>): StockActivityLog {
  return {
    id: row.id as string,
    timestamp: row.timestamp as string,
    productId: row.product_id as string,
    productName: row.product_name as string,
    sku: row.sku as string,
    actionType: row.action_type as StockActivityLog['actionType'],
    quantityChange: Number(row.quantity_change),
    previousStock: Number(row.previous_stock),
    newStock: Number(row.new_stock),
    reason: (row.reason as string) ?? undefined,
    userId: row.user_id as string,
    userName: row.user_name as string,
  };
}

export async function GET() {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from('hw_activity_logs')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return NextResponse.json((data ?? []).map(fromRow));
  } catch (err) {
    console.error('[GET /api/logs]', err);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body: StockActivityLog | StockActivityLog[] = await req.json();
    const rows = Array.isArray(body) ? body.map(toRow) : [toRow(body)];
    const admin = getSupabaseAdmin();
    const { error } = await admin.from('hw_activity_logs').insert(rows);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[POST /api/logs]', err);
    return NextResponse.json({ error: 'Failed to record log' }, { status: 500 });
  }
}

