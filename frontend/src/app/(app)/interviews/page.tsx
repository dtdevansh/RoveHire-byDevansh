'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, ChevronRight, CalendarClock } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Segmented from '@/components/ui/Segmented';
import { TokenChip } from '@/components/ui/Chip';
import { INTERVIEW_TYPE_MAP, RECOMMENDATION_MAP } from '@/lib/constants/statuses';
import { formatDate, formatTime } from '@/lib/utils/date';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchInterviews } from '@/store/slices/interviewsSlice';
import type { Interview } from '@/types/models';

type FilterValue = 'Upcoming' | 'Completed' | 'All';

export default function InterviewsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { list, status } = useAppSelector((s) => s.interviews);
  const [filter, setFilter] = useState<FilterValue>('Upcoming');

  useEffect(() => {
    dispatch(fetchInterviews());
  }, [dispatch]);

  const loading = status === 'loading' || status === 'idle';
  const failed = status === 'failed';

  const rows = useMemo(() => {
    let r = [...list];
    if (filter === 'Upcoming') r = r.filter((i) => i.outcome === 'Scheduled');
    else if (filter === 'Completed') r = r.filter((i) => i.outcome === 'Completed');
    r.sort((a, b) => {
      const t = new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime();
      return filter === 'Completed' ? -t : t;
    });
    return r;
  }, [list, filter]);

  return (
    <>
      <PageHeader
        title="Interviews"
        subtitle="View and manage all interviews across candidates."
      />

      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <Segmented<FilterValue>
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'Upcoming', label: 'Upcoming' },
              { value: 'Completed', label: 'Completed' },
              { value: 'All', label: 'All' },
            ]}
          />
          {!loading && !failed && (
            <p className="text-sm text-text-secondary">
              {list.length} interview{list.length === 1 ? '' : 's'}
            </p>
          )}
        </div>

        {failed ? (
          <ErrorState
            title="Couldn't load interviews"
            onRetry={() => dispatch(fetchInterviews())}
          />
        ) : loading ? (
          <TableSkeleton />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<CalendarClock className="h-5 w-5" />}
            title="No interviews scheduled"
            body="Schedule one from a candidate's profile."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="border-b border-border text-xs font-medium text-text-secondary">
                  <th className="py-3 pl-1 pr-4 font-medium">Date &amp; time</th>
                  <th className="px-4 py-3 font-medium">Candidate</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Interviewer</th>
                  <th className="px-4 py-3 font-medium">Outcome</th>
                  <th className="w-10 px-2 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((iv) => (
                  <InterviewRow
                    key={iv.id}
                    interview={iv}
                    onClick={() => router.push(`/candidates/${iv.candidate_id}`)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}

function InterviewRow({
  interview: iv,
  onClick,
}: {
  interview: Interview;
  onClick: () => void;
}) {
  const start = new Date(iv.scheduled_at);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  return (
    <tr
      onClick={onClick}
      className="group cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-surface2"
    >
      <td className="py-3.5 pl-1 pr-4">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-4 w-4 shrink-0 text-text-muted" />
          <div>
            <p className="text-sm font-medium text-text-primary">
              {formatDate(iv.scheduled_at)}
            </p>
            <p className="text-xs text-text-muted">
              {formatTime(start.toISOString())} – {formatTime(end.toISOString())}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <p className="text-sm font-medium text-text-primary">
          {iv.candidate_name}
        </p>
        <p className="text-xs text-text-muted">{iv.candidate_role}</p>
      </td>
      <td className="px-4 py-3.5">
        <TokenChip token={INTERVIEW_TYPE_MAP[iv.type]} />
      </td>
      <td className="px-4 py-3.5 text-sm text-text-secondary">
        {iv.interviewer_name}
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
              iv.outcome === 'Completed'
                ? 'bg-surface2 text-text-secondary'
                : 'bg-surface2 text-text-muted'
            }`}
          >
            {iv.outcome}
          </span>
          {iv.outcome === 'Completed' && iv.recommendation && (
            <TokenChip token={RECOMMENDATION_MAP[iv.recommendation]} />
          )}
        </div>
      </td>
      <td className="px-2 py-3.5">
        <ChevronRight className="h-4 w-4 text-text-muted opacity-0 transition-opacity group-hover:opacity-100" />
      </td>
    </tr>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-1">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-border py-4 last:border-0">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      ))}
    </div>
  );
}
