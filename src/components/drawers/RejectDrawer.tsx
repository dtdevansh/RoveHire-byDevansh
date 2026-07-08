'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, Info, Check } from 'lucide-react';
import Drawer from '@/components/ui/Drawer';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import Field from '@/components/ui/Field';
import StatusCircle from '@/components/ui/StatusCircle';
import { useAppDispatch } from '@/store/hooks';
import { rejectCandidate } from '@/store/slices/candidatesSlice';

const MAX = 1000;

export default function RejectDrawer({
  open,
  onClose,
  candidateId,
  onViewProfile,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  candidateId: string;
  onViewProfile?: () => void;
  onDone?: () => void;
}) {
  const dispatch = useAppDispatch();
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    if (!reason.trim()) {
      setError('Please provide a reason for rejecting this candidate.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await dispatch(rejectCandidate({ id: candidateId, reason })).unwrap();
      onDone?.();
      setDone(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't reject the candidate");
      setLoading(false);
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Reject candidate"
      footer={
        done ? (
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={() => {
                onViewProfile?.();
                onClose();
              }}
            >
              View profile
            </Button>
          </div>
        ) : (
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              loading={loading}
              onClick={handleSubmit}
            >
              Reject candidate
            </Button>
          </div>
        )
      }
    >
      {done ? (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col items-center pt-2 text-center">
            <StatusCircle tone="error" size={64}>
              <Check className="h-8 w-8" strokeWidth={2.5} />
            </StatusCircle>
            <h3 className="mt-4 text-lg font-semibold text-text-primary">
              Candidate rejected
            </h3>
            <p className="mt-1 max-w-xs text-sm text-text-secondary">
              This candidate has been marked as Rejected. The reason has been
              saved and logged to the timeline.
            </p>
          </div>
          <div className="rounded-[8px] border border-border p-4">
            <p className="text-sm font-medium text-text-primary">Reason provided</p>
            <p className="mt-2 text-sm text-text-secondary">{reason}</p>
          </div>
          <div className="flex items-start gap-2.5 rounded-[8px] border border-border bg-surface2/50 p-3 text-sm text-text-secondary">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#7BB6F6]" />
            <p>You can view this reason on the candidate profile and in the timeline.</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2 text-sm text-[#F58A8A]">
            <AlertTriangle className="h-4 w-4" />
            This action cannot be undone.
          </div>

          <Field
            label="Reason"
            required
            error={error ?? undefined}
            helper="Please provide a reason for rejecting this candidate."
          >
            <div className="relative">
              <Textarea
                rows={6}
                maxLength={MAX}
                placeholder="Enter the reason…"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                invalid={!!error}
              />
              <span className="pointer-events-none absolute bottom-2 right-3 text-xs text-text-muted">
                {reason.length} / {MAX}
              </span>
            </div>
          </Field>

          <div className="flex items-start gap-2.5 rounded-[8px] border border-border bg-surface2/50 p-3 text-sm text-text-secondary">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#7BB6F6]" />
            <p>The reason will be visible on the candidate profile and recorded in the timeline.</p>
          </div>
        </div>
      )}
    </Drawer>
  );
}
