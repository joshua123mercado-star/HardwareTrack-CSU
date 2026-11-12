export type UserRole = 'owner' | 'staff';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export type ProductCategory = 
  | 'Electrical'
  | 'Plumbing'
  | 'Tools'
  | 'Fasteners & Hardware'
  | 'Paint & Building'
  | 'Safety & Security';

export type StockStatus = 'IN STOCK' | 'LOW STOCK' | 'OUT OF STOCK';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  description: string;
  unitPrice: number;       // Selling price (public and POS)
  costPrice: number;       // Store internal cost (private to staff/owner)
  stock: number;           // Current stock
  minStockLevel: number;   // Low stock threshold
  location?: string;       // e.g. Aisle 3, Shelf B
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface SaleTransaction {
  id: string;
  receiptNumber: string;
  items: {
    productId: string;
    productName: string;
    sku: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: 'Cash' | 'Card' | 'Digital Transfer';
  amountTendered?: number;
  change?: number;
  timestamp: string;
  cashierId: string;
  cashierName: string;
}

export type ActivityActionType = 
  | 'Sale'
  | 'Manual Adjustment'
  | 'Restock'
  | 'Product Created'
  | 'Product Updated'
  | 'Product Deleted';

export interface StockActivityLog {
  id: string;
  timestamp: string;
  productId: string;
  productName: string;
  sku: string;
  actionType: ActivityActionType;
  quantityChange: number; // e.g. -2 for sale, +10 for restock
  previousStock: number;
  newStock: number;
  reason?: string;
  userId: string;
  userName: string;
}
