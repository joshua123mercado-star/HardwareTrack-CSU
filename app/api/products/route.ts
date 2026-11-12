/**
 * app/api/products/route.ts
 * GET  → returns all products (anon-safe via service role)
 * POST → upserts (creates or updates) a product
 */
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { Product } from '@/lib/types';

function toRow(p: Product) {
  return {
    id: p.id,
    sku: p.sku,
    name: p.name,
    category: p.category,
    description: p.description,
    unit_price: p.unitPrice,
    cost_price: p.costPrice,
    stock: p.stock,
    min_stock_level: p.minStockLevel,
    location: p.location ?? null,
    updated_at: p.updatedAt,
  };
}

function fromRow(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    sku: row.sku as string,
    name: row.name as string,
    category: row.category as Product['category'],
    description: (row.description as string) ?? '',
    unitPrice: Number(row.unit_price),
    costPrice: Number(row.cost_price),
    stock: Number(row.stock),
    minStockLevel: Number(row.min_stock_level),
    location: (row.location as string) ?? undefined,
    updatedAt: row.updated_at as string,
  };
}

export async function GET() {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from('products')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return NextResponse.json((data ?? []).map(fromRow));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const code = (err as Record<string, unknown>)?.code ?? null;
    console.error('[GET /api/products]', err);
    return NextResponse.json({ error: message, code }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body: Product = await req.json();
    const admin = getSupabaseAdmin();
    const row = toRow(body);
    const { error } = await admin
      .from('products')
      .upsert(row, { onConflict: 'id' });

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const code = (err as Record<string, unknown>)?.code ?? null;
    console.error('[POST /api/products]', err);
    return NextResponse.json({ error: message, code }, { status: 500 });
  }
}

