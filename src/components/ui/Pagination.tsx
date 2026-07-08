'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const btn =
    'flex h-9 min-w-9 items-center justify-center rounded-[8px] border border-border px-2 text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <div className="flex items-center gap-2">
      <button
        className={cn(btn, 'text-text-secondary hover:bg-surface2')}
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={cn(
            btn,
            p === page
              ? 'border-brand bg-brand font-medium text-white'
              : 'text-text-secondary hover:bg-surface2',
          )}
        >
          {p}
        </button>
      ))}
      <button
        className={cn(btn, 'text-text-secondary hover:bg-surface2')}
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
