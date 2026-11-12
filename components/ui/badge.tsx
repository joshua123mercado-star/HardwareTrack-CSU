import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
}

export function Badge({
  className,
  variant = 'default',
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: 'bg-blue-600 text-white border-transparent',
    secondary: 'bg-slate-100 text-slate-700 border-transparent',
    destructive: 'bg-red-50 text-red-700 border border-red-200 font-semibold',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200 font-semibold',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold',
    outline: 'text-slate-600 border border-slate-200',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

/**
 * StockBadge respecting strict business logic:
 * - OUT OF STOCK: Red (Stock = 0)
 * - LOW STOCK: Amber (Stock <= Min Level)
 * - IN STOCK: Green (Stock > Min Level)
 */
export function StockBadge({ stock, minStockLevel }: { stock: number; minStockLevel: number }) {
  if (stock <= 0) {
    return (
      <Badge variant="destructive" className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        Out of Stock
      </Badge>
    );
  }
  if (stock <= minStockLevel) {
    return (
      <Badge variant="warning" className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Low Stock ({stock} left)
      </Badge>
    );
  }
  return (
    <Badge variant="success" className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-semibold">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      In Stock ({stock})
    </Badge>
  );
}
