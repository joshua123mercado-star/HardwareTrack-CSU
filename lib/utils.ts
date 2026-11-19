import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Strict stock status logic:
 * - OUT OF STOCK: Stock === 0 (Red)
 * - LOW STOCK: Stock <= Minimum Level (Yellow)
 * - IN STOCK: Stock > Minimum Level (Green)
 */
export function getStockStatus(stock: number, minStockLevel: number): 'OUT OF STOCK' | 'LOW STOCK' | 'IN STOCK' {
  if (stock <= 0) return 'OUT OF STOCK';
  if (stock <= minStockLevel) return 'LOW STOCK';
  return 'IN STOCK';
}

