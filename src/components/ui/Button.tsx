'use client';

import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-[8px] font-medium whitespace-nowrap transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none';

const variants: Record<Variant, string> = {
  primary:
    'bg-brand text-white font-semibold hover:bg-brand-hover active:bg-[#B8431C] shadow-[0_1px_2px_rgba(0,0,0,0.4)]',
  secondary:
    'bg-surface2 text-text-primary border border-border hover:border-border-strong hover:bg-[#232327]',
  ghost:
    'text-text-secondary hover:text-text-primary hover:bg-surface2',
  danger:
    'text-[#F58A8A] border border-[rgba(239,68,68,0.4)] hover:bg-[rgba(239,68,68,0.1)]',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-9 px-4 text-sm',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, icon, className, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children}
    </button>
  );
});

export default Button;
