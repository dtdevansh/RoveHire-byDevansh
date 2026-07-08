'use client';

import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, invalid, children, ...props },
  ref,
) {
  const border = invalid
    ? 'border-[rgba(239,68,68,0.5)]'
    : 'border-border focus:border-brand focus:shadow-[0_0_0_2px_rgba(224,80,32,0.25)]';
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          'h-9 w-full appearance-none rounded-[8px] border bg-surface2 pl-3 pr-9 text-sm text-text-primary transition-colors focus:outline-none',
          border,
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
    </div>
  );
});

export default Select;
