import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'success';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variantStyles = {
      default: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm active:translate-y-px',
      destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-sm active:translate-y-px',
      outline: 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700',
      secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200',
      ghost: 'hover:bg-slate-100 text-slate-600',
      link: 'text-blue-600 underline-offset-4 hover:underline p-0 h-auto',
      success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm active:translate-y-px',
    };

    const sizeStyles = {
      default: 'h-10 px-4 py-2 text-sm',
      sm: 'h-8 rounded-md px-3 text-xs',
      lg: 'h-11 rounded-md px-8 text-base',
      icon: 'h-9 w-9 p-0 flex items-center justify-center',
    };

    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer gap-2',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
