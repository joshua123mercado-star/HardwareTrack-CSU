/**
 * app/api/sales/route.ts
 * GET  → returns all sales transactions
 * POST → records a new sale
 */
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { SaleTransaction } from '@/lib/types';

function toRow(s: SaleTransaction) {
  return {
    id: s.id,
    receipt_number: s.receiptNumber,
    items: s.items,
    subtotal: s.subtotal,
    tax: s.tax,
    total: s.total,
    payment_method: s.paymentMethod,
    amount_tendered: s.amountTendered ?? null,
    change: s.change ?? null,
    timestamp: s.timestamp,
    cashier_id: s.cashierId,
    cashier_name: s.cashierName,
  };
}

function fromRow(row: Record<string, unknown>): SaleTransaction {
  return {
    id: row.id as string,
    receiptNumber: row.receipt_number as string,
    items: row.items as SaleTransaction['items'],
    subtotal: Number(row.subtotal),
    tax: Number(row.tax),
    total: Number(row.total),
    paymentMethod: row.payment_method as SaleTransaction['paymentMethod'],
    amountTendered: row.amount_tendered != null ? Number(row.amount_tendered) : undefined,
    change: row.change != null ? Number(row.change) : undefined,
    timestamp: row.timestamp as string,
    cashierId: row.cashier_id as string,
    cashierName: row.cashier_name as string,
  };
}

export async function GET() {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from('hw_sales')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return NextResponse.json((data ?? []).map(fromRow));
  } catch (err) {
    console.error('[GET /api/sales]', err);
    return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body: SaleTransaction = await req.json();
    const admin = getSupabaseAdmin();
    const { error } = await admin.from('hw_sales').insert(toRow(body));
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[POST /api/sales]', err);
    return NextResponse.json({ error: 'Failed to record sale' }, { status: 500 });
  }
}

