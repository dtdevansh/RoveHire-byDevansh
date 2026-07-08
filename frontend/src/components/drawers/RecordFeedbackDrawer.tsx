'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Check,
  Info,
  ThumbsUp,
  ThumbsDown,
  MinusCircle,
  CalendarDays,
  User,
  Code2,
} from 'lucide-react';
import Drawer from '@/components/ui/Drawer';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import Field from '@/components/ui/Field';
import StatusCircle from '@/components/ui/StatusCircle';
import { TokenChip } from '@/components/ui/Chip';
import { RECOMMENDATION_MAP } from '@/lib/constants/statuses';
import { formatDate, formatTime } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';
import { useAppDispatch } from '@/store/hooks';
import { completeInterview } from '@/store/slices/interviewsSlice';
import type { Interview, Recommendation } from '@/types/models';

const MAX = 1000;

const OPTIONS: {
  value: Recommendation;
  label: string;
  icon: React.ReactNode;
  color: string;
  activeBorder: string;
  activeBg: string;
}[] = [
  {
    value: 'hire',
    label: 'Hire',
    icon: <ThumbsUp className="h-5 w-5" />,
    color: 'text-[#4ADE9B]',
    activeBorder: 'border-[#10B981]',
    activeBg: 'bg-[rgba(16,185,129,0.1)]',
  },
  {
    value: 'maybe',
    label: 'Maybe',
    icon: <MinusCircle className="h-5 w-5" />,
    color: 'text-[#F3CC5C]',
    activeBorder: 'border-[#EAB308]',
    activeBg: 'bg-[rgba(234,179,8,0.1)]',
  },
  {
    value: 'no_hire',
    label: 'No-hire',
    icon: <ThumbsDown className="h-5 w-5" />,
    color: 'text-[#F58A8A]',
    activeBorder: 'border-[#EF4444]',
    activeBg: 'bg-[rgba(239,68,68,0.1)]',
  },
];

export default function RecordFeedbackDrawer({
  open,
  onClose,
  interview,
  candidateName,
  candidateRole,
  onViewProfile,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  interview: Interview | null;
  candidateName: string;
  candidateRole: string;
  onViewProfile?: () => void;
  onDone?: () => void;
}) {
  const dispatch = useAppDispatch();
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit() {
    if (!recommendation) {
      setError('Choose a recommendation.');
      return;
    }
    if (!note.trim()) {
      setError('Add a short feedback note.');
      return;
    }
    if (!interview) return;
    setError(null);
    setLoading(true);
    try {
      await dispatch(
        completeInterview({
          id: interview.id,
          payload: { recommendation, feedback_note: note },
        }),
      ).unwrap();
      onDone?.();
      setSaved(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save feedback");
      setLoading(false);
    }
  }

  const summary = interview && (
    <div className="rounded-[8px] border border-border bg-surface2/50 p-4 text-sm">
      <div className="flex items-center gap-2 text-text-primary">
        <CalendarDays className="h-4 w-4 text-text-muted" />
        {formatDate(interview.scheduled_at)} · {formatTime(interview.scheduled_at)}
      </div>
      <div className="mt-3 flex items-center gap-2 text-text-primary">
        <User className="h-4 w-4 text-text-muted" />
        {candidateName}
        <span className="text-text-muted">· {candidateRole}</span>
      </div>
      <div className="mt-3 flex items-center gap-2 text-text-primary">
        <Code2 className="h-4 w-4 text-text-muted" />
        {interview.type} interview · {interview.interviewer_name}
      </div>
    </div>
  );

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Record feedback"
      description={saved ? undefined : 'Share your feedback for this interview.'}
      footer={
        saved ? (
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={onClose}>
              Close
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                onViewProfile?.();
                onClose();
              }}
            >
              View candidate profile
            </Button>
          </div>
        ) : (
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button className="flex-1" loading={loading} onClick={handleSubmit}>
              Save feedback
            </Button>
          </div>
        )
      }
    >
      {saved ? (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col items-center pt-2 text-center">
            <StatusCircle tone="success" size={64}>
              <Check className="h-8 w-8" strokeWidth={2.5} />
            </StatusCircle>
            <h3 className="mt-4 text-lg font-semibold text-text-primary">
              Feedback saved
            </h3>
            <p className="mt-1 text-sm text-text-secondary">
              This interview has been marked as completed.
            </p>
          </div>
          {summary}
          <div className="rounded-[8px] border border-border p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-text-primary">
                Your recommendation
              </p>
              {recommendation && (
                <TokenChip token={RECOMMENDATION_MAP[recommendation]} dot />
              )}
            </div>
            <p className="mt-3 text-sm font-medium text-text-primary">Feedback note</p>
            <p className="mt-1 text-sm text-text-secondary">{note}</p>
          </div>
          <div className="flex items-start gap-2.5 rounded-[8px] border border-border bg-surface2/50 p-3 text-sm text-text-secondary">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#7BB6F6]" />
            <p>
              The candidate status remains unchanged. You can now generate offer
              documents.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {summary}

          <Field label="Recommendation" required error={error && !recommendation ? error : undefined}>
            <div className="grid grid-cols-3 gap-2">
              {OPTIONS.map((opt) => {
                const active = recommendation === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRecommendation(opt.value)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-[8px] border py-3 text-sm font-medium transition-colors',
                      opt.color,
                      active
                        ? `${opt.activeBorder} ${opt.activeBg}`
                        : 'border-border hover:border-border-strong',
                    )}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field
            label="Feedback note"
            required
            error={error && recommendation ? error : undefined}
            helper="Provide a short summary of the candidate's performance."
          >
            <div className="relative">
              <Textarea
                rows={6}
                maxLength={MAX}
                placeholder="Write your feedback here…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                invalid={!!(error && recommendation)}
              />
              <span className="pointer-events-none absolute bottom-2 right-3 text-xs text-text-muted">
                {note.length} / {MAX}
              </span>
            </div>
          </Field>

          <div className="flex items-start gap-2.5 rounded-[8px] border border-border bg-surface2/50 p-3 text-sm text-text-secondary">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#7BB6F6]" />
            <p>
              This will mark the interview as completed. The candidate status
              will not change.
            </p>
          </div>
        </div>
      )}
    </Drawer>
  );
}
