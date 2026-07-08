'use client';

import { useEffect, useState } from 'react';
import { Plus, Briefcase } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import JobCard from '@/components/jobs/JobCard';
import JobFormDrawer from '@/components/drawers/JobFormDrawer';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchJobs } from '@/store/slices/jobsSlice';

export default function JobsPage() {
  const dispatch = useAppDispatch();
  const { list, status } = useAppSelector((s) => s.jobs);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  const loading = status === 'loading' || status === 'idle';
  const failed = status === 'failed';

  return (
    <>
      <PageHeader
        title="Jobs"
        subtitle="Manage all job openings and their pipelines."
        action={
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => setDrawerOpen(true)}>
            New job
          </Button>
        }
      />

      {failed ? (
        <Card>
          <ErrorState
            title="Couldn't load jobs"
            onRetry={() => dispatch(fetchJobs())}
          />
        </Card>
      ) : loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="flex flex-col gap-4 p-5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-28" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-md" />
                <Skeleton className="h-6 w-16 rounded-md" />
                <Skeleton className="h-6 w-16 rounded-md" />
              </div>
              <Skeleton className="h-4 w-32" />
            </Card>
          ))}
        </div>
      ) : list.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Briefcase className="h-5 w-5" />}
            title="No job openings yet"
            body="Create an opening to start adding candidates."
            action={
              <Button
                icon={<Plus className="h-4 w-4" />}
                onClick={() => setDrawerOpen(true)}
              >
                New job
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {list.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
          <p className="mt-6 text-sm text-text-muted">
            Showing 1 to {list.length} of {list.length} jobs
          </p>
        </>
      )}

      <JobFormDrawer
        key={String(drawerOpen)}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
}
