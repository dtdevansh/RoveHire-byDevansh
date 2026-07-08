'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  leftIcon?: React.ReactNode;
  rightSlot?: React.ReactNode;
}

export const inputBase =
  'h-9 w-full rounded-[8px] bg-surface2 px-3 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:outline-none';

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, leftIcon, rightSlot, ...props },
  ref,
) {
  const border = invalid
    ? 'border border-[rgba(239,68,68,0.5)] focus:shadow-[0_0_0_2px_rgba(239,68,68,0.3)]'
    : 'border border-border focus:border-brand focus:shadow-[0_0_0_2px_rgba(224,80,32,0.25)]';

  if (leftIcon || rightSlot) {
    return (
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 text-text-muted">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            inputBase,
            border,
            leftIcon && 'pl-9',
            rightSlot && 'pr-10',
            className,
          )}
          {...props}
        />
        {rightSlot && (
          <span className="absolute right-2 flex items-center">{rightSlot}</span>
        )}
      </div>
    );
  }

  return (
    <input ref={ref} className={cn(inputBase, border, className)} {...props} />
  );
});

export default Input;
