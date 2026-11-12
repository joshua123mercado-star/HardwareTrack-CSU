/**
 * Supabase seed helper (optional utility — project uses local mock data).
 * Run manually if a Supabase backend is ever connected.
 *
 * Usage: import { seedProducts } from '@/lib/db/seed';
 *        await seedProducts(supabaseClient);
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function seedProducts(supabaseClient?: Record<string, any>) {
  if (!supabaseClient) {
    console.log(
      'No Supabase client provided. Using local mock data store (lib/mock-products.ts).'
    );
    return [];
  }

  // Dynamically import products to avoid cross-boundary TS path issues
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { INITIAL_PRODUCTS } = require('../../../lib/mock-products') as {
    INITIAL_PRODUCTS: Array<{
      id: string;
      sku: string;
      name: string;
      category: string;
      description: string;
      unitPrice: number;
      costPrice: number;
      stock: number;
      minStockLevel: number;
      location: string;
      updatedAt: string;
    }>;
  };

  const { data, error } = await supabaseClient
    .from('products')
    .upsert(
      INITIAL_PRODUCTS.map(p => ({
        id: p.id,
        sku: p.sku,
        name: p.name,
        category: p.category,
        description: p.description,
        unit_price: p.unitPrice,
        cost_price: p.costPrice,
        stock: p.stock,
        min_stock_level: p.minStockLevel,
        location: p.location,
        updated_at: p.updatedAt,
      })),
      { onConflict: 'sku' }
    );

  if (error) {
    console.error('Error seeding products:', error);
    throw error;
  }

  return data;
}
