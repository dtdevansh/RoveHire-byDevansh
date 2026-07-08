'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, invalid, ...props }, ref) {
    const border = invalid
      ? 'border-[rgba(239,68,68,0.5)] focus:shadow-[0_0_0_2px_rgba(239,68,68,0.3)]'
      : 'border-border focus:border-brand focus:shadow-[0_0_0_2px_rgba(224,80,32,0.25)]';
    return (
      <textarea
        ref={ref}
        className={cn(
          'w-full rounded-[8px] border bg-surface2 px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:outline-none resize-y',
          border,
          className,
        )}
        {...props}
      />
    );
  },
);

export default Textarea;
