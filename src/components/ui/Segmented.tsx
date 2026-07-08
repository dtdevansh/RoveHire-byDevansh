'use client';

import { cn } from '@/lib/utils/cn';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  /** Optional custom active styling (color-coded segments like Hire/Maybe/No-hire). */
  activeClassName?: string;
}

export default function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  fill = false,
  className,
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
  fill?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'inline-flex gap-1 rounded-[8px] border border-border bg-surface1 p-1',
        fill && 'flex w-full',
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'inline-flex items-center justify-center gap-1.5 rounded-[6px] font-medium transition-colors focus-visible:outline-none',
              size === 'sm' ? 'h-7 px-2.5 text-xs' : 'h-8 px-3.5 text-[13px]',
              fill && 'flex-1',
              active
                ? opt.activeClassName ?? 'bg-brand text-white'
                : 'text-text-secondary hover:text-text-primary',
            )}
          >
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
