import * as React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'warning' | 'success';
}

export function Alert({
  className,
  variant = 'default',
  children,
  ...props
}: AlertProps) {
  const variantStyles = {
    default: 'bg-blue-50 text-blue-900 border-blue-200',
    destructive: 'bg-red-50 text-red-900 border-red-200',
    warning: 'bg-amber-50 text-amber-900 border-amber-200',
    success: 'bg-emerald-50 text-emerald-900 border-emerald-200',
  };

  const icons = {
    default: <Info className="h-4 w-4 text-blue-600 shrink-0" />,
    destructive: <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />,
    warning: <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />,
    success: <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />,
  };

  return (
    <div
      role="alert"
      className={cn(
        'relative w-full rounded-lg border p-3.5 text-sm flex gap-3 items-start',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {icons[variant]}
      <div className="flex-1">{children}</div>
    </div>
  );
}

export function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5
      className={cn('font-semibold leading-tight tracking-tight mb-0.5 text-sm', className)}
      {...props}
    />
  );
}

export function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div
      className={cn('text-xs leading-relaxed opacity-90', className)}
      {...props}
    />
  );
}
