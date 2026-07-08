'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Clock,
  IndianRupee,
  Link2,
  FileText,
  Download,
  ChevronRight,
  ExternalLink,
  CalendarPlus,
  MessageSquare,
  FilePlus2,
  CheckCircle2,
  XCircle,
  Plus,
  User,
  CalendarClock,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import StatusPill from '@/components/ui/StatusPill';
import { TokenChip } from '@/components/ui/Chip';
import ScheduleInterviewDrawer from '@/components/drawers/ScheduleInterviewDrawer';
import RecordFeedbackDrawer from '@/components/drawers/RecordFeedbackDrawer';
import GenerateOfferDrawer from '@/components/drawers/GenerateOfferDrawer';
import RejectDrawer from '@/components/drawers/RejectDrawer';
import MarkHiredDialog from '@/components/drawers/MarkHiredDialog';
import {
  INTERVIEW_TYPE_MAP,
  RECOMMENDATION_MAP,
  ACTIONS,
} from '@/lib/constants/statuses';
import { formatDate, formatDateTime, formatTime, relativeTime } from '@/lib/utils/date';
import { formatMoney } from '@/lib/utils/format';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCandidateProfile } from '@/store/slices/candidatesSlice';
import type { Interview, TimelineEventType } from '@/types/models';

type DrawerKind = 'schedule' | 'feedback' | 'offer' | 'reject' | 'hire' | null;

export default function CandidateProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { current: c, status } = useAppSelector((s) => s.candidates);

  const [drawer, setDrawer] = useState<DrawerKind>(null);
  const [activeInterview, setActiveInterview] = useState<Interview | null>(null);

  const load = useCallback(
    () => dispatch(fetchCandidateProfile(id)),
    [dispatch, id],
  );

  useEffect(() => {
    load();
  }, [load]);

  const loading = (status === 'loading' || status === 'idle') && (!c || c.id !== id);
  const failed = status === 'failed';

  const can = (a: string) => c?.allowed_actions.includes(a);
  const terminal = c?.status === 'Hired' || c?.status === 'Rejected';
  const scheduledInterview = c?.interviews.find((i) => i.outcome === 'Scheduled');

  function openFeedback(interview: Interview) {
    setActiveInterview(interview);
    setDrawer('feedback');
  }

  if (failed) {
    return (
      <Card className="mt-10">
        <EmptyState
          title="Candidate not found"
          body="This candidate may have been removed."
          action={
            <Link href="/">
              <Button variant="secondary">Back to dashboard</Button>
            </Link>
          }
        />
      </Card>
    );
  }

  return (
    <>
      <Link
        href="/"
        className="mb-5 inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to candidates
      </Link>

      {loading || !c ? (
        <ProfileSkeleton />
      ) : (
        <>
          {/* Header band */}
          <Card className="p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <Avatar name={c.name} size="lg" />
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-semibold text-text-primary">
                      {c.name}
                    </h1>
                    <StatusPill status={c.status} />
                  </div>
                  <p className="mt-1 text-sm text-text-secondary">
                    {c.job_opening.title}
                    <span className="text-text-muted">
                      {' '}
                      · Applied on {formatDate(c.created_at)} (
                      {relativeTime(c.created_at)})
                    </span>
                  </p>
                </div>
              </div>

              {!terminal && (
                <div className="flex flex-wrap gap-2.5">
                  {can(ACTIONS.SCHEDULE_INTERVIEW) && (
                    <Button
                      icon={<CalendarPlus className="h-4 w-4" />}
                      onClick={() => setDrawer('schedule')}
                    >
                      Schedule interview
                    </Button>
                  )}
                  {can(ACTIONS.RECORD_FEEDBACK) && scheduledInterview && (
                    <Button
                      variant="secondary"
                      icon={<MessageSquare className="h-4 w-4" />}
                      onClick={() => openFeedback(scheduledInterview)}
                    >
                      Record feedback
                    </Button>
                  )}
                  {can(ACTIONS.GENERATE_OFFER) && (
                    <Button
                      variant="secondary"
                      icon={<FilePlus2 className="h-4 w-4" />}
                      onClick={() => setDrawer('offer')}
                    >
                      Generate offer documents
                    </Button>
                  )}
                  {can(ACTIONS.MARK_HIRED) && (
                    <Button
                      className="bg-[#10B981] text-white hover:bg-[#0EA372]"
                      icon={<CheckCircle2 className="h-4 w-4" />}
                      onClick={() => setDrawer('hire')}
                    >
                      Mark hired
                    </Button>
                  )}
                  {can(ACTIONS.REJECT) && (
                    <Button
                      variant="danger"
                      icon={<XCircle className="h-4 w-4" />}
                      onClick={() => setDrawer('reject')}
                    >
                      Reject
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Terminal banners */}
            {c.status === 'Hired' && (
              <div className="mt-5 flex items-center gap-2.5 rounded-[8px] border border-[rgba(16,185,129,0.25)] bg-[rgba(16,185,129,0.08)] px-4 py-3 text-sm text-[#4ADE9B]">
                <CheckCircle2 className="h-4 w-4" />
                This candidate has been hired.
              </div>
            )}
            {c.status === 'Rejected' && (
              <div className="mt-5 rounded-[8px] border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.08)] px-4 py-3 text-sm text-[#F58A8A]">
                <div className="flex items-center gap-2.5">
                  <XCircle className="h-4 w-4" />
                  This candidate has been rejected.
                </div>
                {c.rejection_reason && (
                  <p className="mt-1.5 pl-6 text-text-secondary">
                    Reason: {c.rejection_reason}
                  </p>
                )}
              </div>
            )}
          </Card>

          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[360px_1fr]">
            {/* Left: identity */}
            <div className="flex flex-col gap-5">
              <Card className="p-6">
                <h2 className="mb-4 text-base font-medium text-text-primary">
                  Candidate details
                </h2>
                <dl className="space-y-4">
                  <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={c.email} />
                  <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone" value={c.phone} />
                  <InfoRow icon={<MapPin className="h-4 w-4" />} label="Current location" value={c.current_location} />
                  <InfoRow icon={<Briefcase className="h-4 w-4" />} label="Current role" value={c.current_role} />
                  <InfoRow icon={<Clock className="h-4 w-4" />} label="Notice period" value={c.notice_period} />
                  <InfoRow icon={<IndianRupee className="h-4 w-4" />} label="Salary expectation" value={c.salary_expectation} />
                  <InfoRow
                    icon={<Link2 className="h-4 w-4" />}
                    label="LinkedIn"
                    value={
                      c.linkedin_url ? (
                        <a
                          href={c.linkedin_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-brand-hover hover:underline"
                        >
                          {c.linkedin_url.replace(/^https?:\/\/(www\.)?/, '')}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : null
                    }
                  />
                </dl>

                <div className="mt-5 border-t border-border pt-5">
                  <p className="mb-2 text-xs font-medium text-text-secondary">Resume</p>
                  {c.resume_download_url ? (
                    <div className="flex items-center gap-3 rounded-[8px] border border-border bg-surface2/50 p-3">
                      <FileText className="h-5 w-5 shrink-0 text-text-secondary" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-text-primary">
                          {c.name.replace(/\s+/g, '_')}_Resume.pdf
                        </p>
                      </div>
                      <a href={c.resume_download_url} download>
                        <Button variant="secondary" size="sm" icon={<Download className="h-3.5 w-3.5" />}>
                          Download
                        </Button>
                      </a>
                    </div>
                  ) : (
                    <p className="text-sm text-text-muted">Not provided yet</p>
                  )}
                </div>

                <div className="mt-5 border-t border-border pt-5">
                  <p className="mb-2 text-xs font-medium text-text-secondary">Job opening</p>
                  <Link
                    href={`/jobs/${c.job_opening.id}`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-hover hover:underline"
                  >
                    {c.job_opening.title}
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </Card>
            </div>

            {/* Right: sections */}
            <div className="flex flex-col gap-5">
              {/* Interviews */}
              <Card className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base font-medium text-text-primary">Interviews</h2>
                  {!terminal && can(ACTIONS.SCHEDULE_INTERVIEW) && (
                    <button
                      onClick={() => setDrawer('schedule')}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-hover hover:underline"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Schedule interview
                    </button>
                  )}
                </div>
                {c.interviews.length === 0 ? (
                  <EmptyState
                    icon={<CalendarClock className="h-5 w-5" />}
                    title="No interviews scheduled."
                    className="py-10"
                  />
                ) : (
                  <div className="flex flex-col divide-y divide-border">
                    {c.interviews.map((iv) => (
                      <div key={iv.id} className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-2 text-sm">
                            <CalendarClock className="h-4 w-4 text-text-muted" />
                            <span className="font-medium text-text-primary">
                              {formatDate(iv.scheduled_at)}
                            </span>
                            <span className="text-text-muted">
                              {formatTime(iv.scheduled_at)}
                            </span>
                          </div>
                          <TokenChip token={INTERVIEW_TYPE_MAP[iv.type]} />
                          <span className="text-sm text-text-secondary">
                            {iv.interviewer_name}
                          </span>
                          <div className="ml-auto flex items-center gap-2">
                            <span className="rounded-full bg-surface2 px-2.5 py-1 text-xs text-text-secondary">
                              {iv.outcome}
                            </span>
                            {iv.outcome === 'Completed' && iv.recommendation && (
                              <TokenChip token={RECOMMENDATION_MAP[iv.recommendation]} />
                            )}
                            {iv.outcome === 'Scheduled' && !terminal && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openFeedback(iv)}
                              >
                                Add feedback
                              </Button>
                            )}
                          </div>
                        </div>
                        {iv.feedback_note && (
                          <p className="text-sm text-text-secondary">
                            <span className="text-text-muted">Feedback: </span>
                            {iv.feedback_note}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Offers */}
              <Card className="p-6">
                <h2 className="mb-4 text-base font-medium text-text-primary">Offers</h2>
                {c.offers.length === 0 ? (
                  <EmptyState
                    icon={<FileText className="h-5 w-5" />}
                    title="No offer documents generated."
                    className="py-10"
                  />
                ) : (
                  <div className="flex flex-col gap-4">
                    {c.offers.map((offer) => (
                      <div
                        key={offer.id}
                        className="rounded-[8px] border border-border p-4"
                      >
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
                          <OfferField label="Created on" value={formatDate(offer.created_at)} />
                          <OfferField
                            label="Salary"
                            value={formatMoney(offer.salary_currency, offer.salary_amount)}
                            mono
                          />
                          <OfferField label="Start date" value={formatDate(offer.start_date)} />
                          <OfferField label="Manager" value={offer.manager_name} />
                          <OfferField label="Location" value={offer.location} />
                          <OfferField label="Role" value={offer.role_title} />
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                          <a href={offer.offer_download_url} download>
                            <Button variant="secondary" size="sm" icon={<Download className="h-3.5 w-3.5" />}>
                              Offer letter
                            </Button>
                          </a>
                          <a href={offer.nda_download_url} download>
                            <Button variant="secondary" size="sm" icon={<Download className="h-3.5 w-3.5" />}>
                              NDA
                            </Button>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Timeline */}
              <Card className="p-6">
                <h2 className="mb-4 text-base font-medium text-text-primary">Timeline</h2>
                <ol className="relative flex flex-col">
                  {c.timeline.map((ev, i) => (
                    <li key={ev.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <TimelineIcon type={ev.type} />
                        {i < c.timeline.length - 1 && (
                          <span className="my-1 w-px flex-1 bg-border" />
                        )}
                      </div>
                      <div className="flex-1 pb-5">
                        <p className="text-sm text-text-primary">{ev.message}</p>
                        <p className="mt-0.5 text-xs text-text-muted">
                          {formatDateTime(ev.created_at)} ({relativeTime(ev.created_at)})
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </Card>
            </div>
          </div>
        </>
      )}

      {/* Drawers */}
      {c && (
        <>
          <ScheduleInterviewDrawer
            key={`schedule-${drawer === 'schedule'}`}
            open={drawer === 'schedule'}
            onClose={() => setDrawer(null)}
            candidateId={c.id}
            onDone={load}
          />
          <RecordFeedbackDrawer
            key={`feedback-${drawer === 'feedback'}-${activeInterview?.id ?? ''}`}
            open={drawer === 'feedback'}
            onClose={() => setDrawer(null)}
            interview={activeInterview}
            candidateName={c.name}
            candidateRole={c.job_opening.title}
            onDone={load}
            onViewProfile={() => router.refresh()}
          />
          <GenerateOfferDrawer
            key={`offer-${drawer === 'offer'}`}
            open={drawer === 'offer'}
            onClose={() => setDrawer(null)}
            candidateId={c.id}
            defaultRole={c.job_opening.title}
            blocked={c.status === 'Hired'}
            onDone={load}
          />
          <RejectDrawer
            key={`reject-${drawer === 'reject'}`}
            open={drawer === 'reject'}
            onClose={() => setDrawer(null)}
            candidateId={c.id}
            onDone={load}
          />
          <MarkHiredDialog
            open={drawer === 'hire'}
            onClose={() => setDrawer(null)}
            candidateId={c.id}
            candidateName={c.name}
            onDone={load}
          />
        </>
      )}
    </>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="inline-flex items-center gap-2 text-sm text-text-secondary">
        <span className="text-text-muted">{icon}</span>
        {label}
      </dt>
      <dd className="max-w-[55%] text-right text-sm text-text-primary">
        {value || <span className="text-text-muted">Not provided yet</span>}
      </dd>
    </div>
  );
}

function OfferField({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-text-muted">{label}</p>
      <p className={`mt-0.5 text-sm text-text-primary ${mono ? 'font-mono' : ''}`}>
        {value}
      </p>
    </div>
  );
}

const TIMELINE_STYLES: Record<
  TimelineEventType,
  { icon: React.ReactNode; className: string }
> = {
  applied: { icon: <User className="h-3.5 w-3.5" />, className: 'bg-[rgba(75,147,247,0.15)] text-[#7BB6F6]' },
  form_submitted: { icon: <FileText className="h-3.5 w-3.5" />, className: 'bg-[rgba(75,147,247,0.15)] text-[#7BB6F6]' },
  interview_scheduled: { icon: <CalendarClock className="h-3.5 w-3.5" />, className: 'bg-[rgba(139,92,246,0.15)] text-[#BFAEFB]' },
  feedback_recorded: { icon: <MessageSquare className="h-3.5 w-3.5" />, className: 'bg-[rgba(139,92,246,0.15)] text-[#BFAEFB]' },
  offer_generated: { icon: <FileText className="h-3.5 w-3.5" />, className: 'bg-[rgba(234,179,8,0.15)] text-[#F3CC5C]' },
  hired: { icon: <CheckCircle2 className="h-3.5 w-3.5" />, className: 'bg-[rgba(16,185,129,0.15)] text-[#4ADE9B]' },
  rejected: { icon: <XCircle className="h-3.5 w-3.5" />, className: 'bg-[rgba(239,68,68,0.15)] text-[#F58A8A]' },
};

function TimelineIcon({ type }: { type: TimelineEventType }) {
  const s = TIMELINE_STYLES[type];
  return (
    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${s.className}`}>
      {s.icon}
    </span>
  );
}

function ProfileSkeleton() {
  return (
    <div>
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </Card>
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[360px_1fr]">
        <Card className="space-y-4 p-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
        </Card>
        <div className="flex flex-col gap-5">
          <Card className="space-y-4 p-6">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </Card>
          <Card className="space-y-4 p-6">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-24 w-full" />
          </Card>
        </div>
      </div>
    </div>
  );
}
