'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Users } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Pagination from '@/components/ui/Pagination';
import CandidatesTable, { type SortKey } from '@/components/candidates/CandidatesTable';
import StatusFilter, { type StatusFilterValue } from '@/components/candidates/StatusFilter';
import AddCandidateDrawer from '@/components/drawers/AddCandidateDrawer';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCandidates } from '@/store/slices/candidatesSlice';

const LIMIT = 8;

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { list, pagination, status } = useAppSelector((s) => s.candidates);

  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('All');
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>('last_activity_at');
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useMemo(
    () => () =>
      dispatch(
        fetchCandidates({
          search: debounced || undefined,
          status: statusFilter === 'All' ? undefined : statusFilter,
          page,
          limit: LIMIT,
        }),
      ),
    [dispatch, debounced, statusFilter, page],
  );

  useEffect(() => {
    load();
  }, [load]);

  const loading = status === 'loading';
  const failed = status === 'failed';
  const total = pagination?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT);
  const hasFilters = statusFilter !== 'All' || debounced.length > 0;

  const sortedRows = useMemo(() => {
    const rows = [...list];
    if (sortKey === 'name') {
      rows.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      rows.sort(
        (a, b) =>
          new Date(b.last_activity_at).getTime() -
          new Date(a.last_activity_at).getTime(),
      );
    }
    return rows;
  }, [list, sortKey]);

  const showEmpty = !loading && !failed && list.length === 0;
  const rangeStart = total === 0 ? 0 : (page - 1) * LIMIT + 1;
  const rangeEnd = Math.min(page * LIMIT, total);

  return (
    <>
      <PageHeader
        title="Candidates"
        subtitle="View and manage all candidates in your pipeline."
        action={
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => setDrawerOpen(true)}>
            Add candidate
          </Button>
        }
      />

      <Card className="p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="w-full max-w-[320px]">
              <Input
                placeholder="Search name or role"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
            <p className="text-sm text-text-secondary">
              {loading ? 'Loading…' : `${total} candidate${total === 1 ? '' : 's'}`}
            </p>
          </div>

          <StatusFilter
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
          />
        </div>

        <div className="mt-2">
          {failed ? (
            <ErrorState title="Couldn't load candidates" onRetry={load} />
          ) : showEmpty ? (
            hasFilters ? (
              <EmptyState
                icon={<Search className="h-5 w-5" />}
                title="No matches"
                body="Try a different status or search term."
                action={
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSearch('');
                      setStatusFilter('All');
                    }}
                  >
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={<Users className="h-5 w-5" />}
                title="No candidates yet"
                body="Add your first candidate to start the pipeline."
                action={
                  <Button
                    icon={<Plus className="h-4 w-4" />}
                    onClick={() => setDrawerOpen(true)}
                  >
                    Add candidate
                  </Button>
                }
              />
            )
          ) : (
            <CandidatesTable
              rows={sortedRows}
              loading={loading}
              sortKey={sortKey}
              onSort={setSortKey}
            />
          )}
        </div>

        {!failed && !showEmpty && total > 0 && (
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <p className="text-sm text-text-muted">
              Showing {rangeStart} to {rangeEnd} of {total} candidates
            </p>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        )}
      </Card>

      <AddCandidateDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onAdded={load}
      />
    </>
  );
}
