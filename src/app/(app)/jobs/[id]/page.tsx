'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import {
  ArrowLeft,
  Pencil,
  Lock,
  Unlock,
  Mail,
  CalendarDays,
  Users,
  CheckCircle2,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { SkillChip } from '@/components/ui/Chip';
import JobStatusBadge from '@/components/jobs/JobStatusBadge';
import CandidatesTable from '@/components/candidates/CandidatesTable';
import JobFormDrawer from '@/components/drawers/JobFormDrawer';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchJob, updateJob } from '@/store/slices/jobsSlice';
import { listCandidates } from '@/lib/api/candidates';
import { formatDate } from '@/lib/utils/date';
import type { CandidateListItemDTO } from '@/types/dto';

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { current: job, status } = useAppSelector((s) => s.jobs);

  const [candidates, setCandidates] = useState<CandidateListItemDTO[]>([]);
  const [candLoading, setCandLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [toggling, setToggling] = useState(false);

  const loadJob = useCallback(() => dispatch(fetchJob(id)), [dispatch, id]);

  useEffect(() => {
    loadJob();
    let active = true;
    listCandidates({ jobId: id })
      .then((res) => active && setCandidates(res.candidates))
      .catch(() => active && setCandidates([]))
      .finally(() => active && setCandLoading(false));
    return () => {
      active = false;
    };
  }, [loadJob, id]);

  const loading = (status === 'loading' || status === 'idle') && !job;
  const notFound = status === 'failed';
  const isOpen = job?.status === 'Open';

  async function toggleStatus() {
    if (!job) return;
    setToggling(true);
    try {
      await dispatch(
        updateJob({ id: job.id, payload: { status: isOpen ? 'Closed' : 'Open' } }),
      ).unwrap();
      toast.success(isOpen ? 'Opening closed' : 'Opening reopened');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't update the opening");
    } finally {
      setToggling(false);
    }
  }

  const filtered = candidates.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()),
  );

  if (notFound) {
    return (
      <Card className="mt-10">
        <EmptyState
          title="Opening not found"
          body="This job opening may have been removed."
          action={
            <Link href="/jobs">
              <Button variant="secondary">Back to jobs</Button>
            </Link>
          }
        />
      </Card>
    );
  }

  return (
    <>
      <Link
        href="/jobs"
        className="mb-5 inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to jobs
      </Link>

      {loading || !job ? (
        <JobDetailSkeleton />
      ) : (
        <>
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-text-primary">
                  {job.title}
                </h1>
                <JobStatusBadge status={job.status} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-text-secondary">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-text-muted" />
                  Created on {formatDate(job.created_at)}
                </span>
                <span className="text-text-muted">•</span>
                <span>Updated on {formatDate(job.updated_at)}</span>
                <span className="text-text-muted">•</span>
                <span>{candidates.length} candidates</span>
              </div>
            </div>
            <div className="flex shrink-0 gap-3">
              <Button
                variant="secondary"
                icon={<Pencil className="h-4 w-4" />}
                onClick={() => setEditOpen(true)}
              >
                Edit
              </Button>
              <Button
                variant={isOpen ? 'danger' : 'secondary'}
                loading={toggling}
                icon={
                  isOpen ? (
                    <Lock className="h-4 w-4" />
                  ) : (
                    <Unlock className="h-4 w-4" />
                  )
                }
                onClick={toggleStatus}
              >
                {isOpen ? 'Close opening' : 'Reopen'}
              </Button>
            </div>
          </div>

          <Card className="p-6">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
              <div>
                <h2 className="mb-3 text-base font-medium text-text-primary">
                  Opening details
                </h2>
                <div className="markdown text-sm leading-relaxed text-text-secondary">
                  <ReactMarkdown>
                    {job.description ?? '_No description provided._'}
                  </ReactMarkdown>
                </div>
              </div>

              <div className="lg:border-l lg:border-border lg:pl-8">
                <p className="mb-2 text-xs font-medium text-text-secondary">
                  Required skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {job.required_skills.map((s) => (
                    <SkillChip key={s}>{s}</SkillChip>
                  ))}
                </div>

                <dl className="mt-6 space-y-4">
                  <DetailRow icon={<Mail className="h-4 w-4" />} label="Status">
                    <JobStatusBadge status={job.status} />
                  </DetailRow>
                  <DetailRow
                    icon={<CalendarDays className="h-4 w-4" />}
                    label="Created"
                  >
                    {formatDate(job.created_at)}
                  </DetailRow>
                  <DetailRow
                    icon={<CalendarDays className="h-4 w-4" />}
                    label="Last updated"
                  >
                    {formatDate(job.updated_at)}
                  </DetailRow>
                  <DetailRow icon={<Users className="h-4 w-4" />} label="Candidates">
                    {candidates.length} candidates
                  </DetailRow>
                </dl>
              </div>
            </div>
          </Card>

          <div
            className={`mt-5 flex items-center gap-2.5 rounded-[12px] border px-4 py-3.5 text-sm ${
              isOpen
                ? 'border-[rgba(16,185,129,0.25)] bg-[rgba(16,185,129,0.08)] text-[#4ADE9B]'
                : 'border-border bg-surface2 text-text-secondary'
            }`}
          >
            {isOpen ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <Lock className="h-4 w-4" />
            )}
            {isOpen
              ? 'This opening is open — new candidates can be added.'
              : "This opening is closed — new candidates can't be added."}
          </div>

          <Card className="mt-5 p-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-base font-medium text-text-primary">
                Attached candidates ({candidates.length})
              </h2>
              <div className="w-full sm:max-w-[260px]">
                <Input
                  placeholder="Search candidates…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  leftIcon={<Search className="h-4 w-4" />}
                />
              </div>
            </div>

            {candLoading ? (
              <CandidatesTable rows={[]} loading />
            ) : candidates.length === 0 ? (
              <EmptyState
                icon={<Users className="h-5 w-5" />}
                title="No candidates for this opening yet."
                body="Add a candidate from the dashboard to start the pipeline."
              />
            ) : (
              <>
                <CandidatesTable rows={filtered.slice(0, 5)} compact />
                {candidates.length > 5 && (
                  <Link
                    href="/"
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-hover hover:underline"
                  >
                    View all {candidates.length} candidates →
                  </Link>
                )}
              </>
            )}
          </Card>
        </>
      )}

      <JobFormDrawer
        key={String(editOpen)}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        job={job}
        onSaved={loadJob}
      />
    </>
  );
}

function DetailRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="inline-flex items-center gap-2 text-sm text-text-secondary">
        <span className="text-text-muted">{icon}</span>
        {label}
      </dt>
      <dd className="text-sm text-text-primary">{children}</dd>
    </div>
  );
}

function JobDetailSkeleton() {
  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div className="space-y-3">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
      <Card className="p-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-md" />
              <Skeleton className="h-6 w-16 rounded-md" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
