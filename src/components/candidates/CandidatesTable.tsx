'use client';

import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronsUpDown } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import StatusPill from '@/components/ui/StatusPill';
import Skeleton from '@/components/ui/Skeleton';
import { relativeTime } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';
import type { CandidateListItemDTO } from '@/types/dto';

export type SortKey = 'name' | 'last_activity_at';

export default function CandidatesTable({
  rows,
  loading,
  sortKey,
  onSort,
  compact,
}: {
  rows: CandidateListItemDTO[];
  loading?: boolean;
  sortKey?: SortKey;
  onSort?: (key: SortKey) => void;
  compact?: boolean;
}) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead>
          <tr className="border-b border-border text-xs font-medium text-text-secondary">
            <SortHeader
              label="Candidate"
              active={sortKey === 'name'}
              onClick={onSort ? () => onSort('name') : undefined}
              className="py-3 pl-1 pr-4"
            />
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <SortHeader
              label="Last activity"
              active={sortKey === 'last_activity_at'}
              onClick={onSort ? () => onSort('last_activity_at') : undefined}
              className="px-4 py-3"
            />
            <th className="w-10 px-2 py-3" />
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <RowSkeleton key={i} />)
            : rows.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => router.push(`/candidates/${c.id}`)}
                  className="group cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-surface2"
                >
                  <td className={cn('py-3 pl-1 pr-4', compact && 'py-2.5')}>
                    <div className="flex items-center gap-3">
                      <Avatar name={c.name} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-text-primary">
                          {c.name}
                        </p>
                        <p className="truncate text-[13px] text-text-muted">
                          {c.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    {c.role}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={c.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    {relativeTime(c.last_activity_at)}
                  </td>
                  <td className="px-2 py-3">
                    <ChevronRight className="h-4 w-4 text-text-muted opacity-0 transition-opacity group-hover:opacity-100" />
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}

function SortHeader({
  label,
  active,
  onClick,
  className,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <th className={cn('font-medium', className)}>
      {onClick ? (
        <button
          onClick={onClick}
          className={cn(
            'inline-flex items-center gap-1.5 transition-colors hover:text-text-primary',
            active && 'text-text-primary',
          )}
        >
          {label}
          <ChevronsUpDown className="h-3.5 w-3.5" />
        </button>
      ) : (
        label
      )}
    </th>
  );
}

function RowSkeleton() {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="py-3.5 pl-1 pr-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <Skeleton className="h-3.5 w-28" />
      </td>
      <td className="px-4 py-3.5">
        <Skeleton className="h-6 w-24 rounded-full" />
      </td>
      <td className="px-4 py-3.5">
        <Skeleton className="h-3.5 w-20" />
      </td>
      <td className="px-2 py-3.5" />
    </tr>
  );
}
