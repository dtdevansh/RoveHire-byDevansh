'use client';

import { STATUS_MAP, CANDIDATE_STATUSES } from '@/lib/constants/statuses';
import type { CandidateStatus } from '@/types/models';
import { cn } from '@/lib/utils/cn';

export type StatusFilterValue = CandidateStatus | 'All';

export default function StatusFilter({
  value,
  onChange,
}: {
  value: StatusFilterValue;
  onChange: (value: StatusFilterValue) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => onChange('All')}
        className={cn(
          'rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors',
          value === 'All'
            ? 'bg-brand text-white'
            : 'border border-border bg-surface2 text-text-secondary hover:text-text-primary',
        )}
      >
        All
      </button>
      {CANDIDATE_STATUSES.map((status) => {
        const token = STATUS_MAP[status];
        const active = value === status;
        return (
          <button
            key={status}
            onClick={() => onChange(status)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors',
              active
                ? 'border-transparent'
                : 'border-border bg-surface2 text-text-secondary hover:text-text-primary',
            )}
            style={
              active
                ? { backgroundColor: token.bg, color: token.text }
                : undefined
            }
          >
            <span
              className="h-[7px] w-[7px] rounded-full"
              style={{ backgroundColor: token.base }}
            />
            {token.label}
          </button>
        );
      })}
    </div>
  );
}
