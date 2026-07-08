'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { User, Code2, Info } from 'lucide-react';
import Drawer from '@/components/ui/Drawer';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Field from '@/components/ui/Field';
import Segmented from '@/components/ui/Segmented';
import { useAppDispatch } from '@/store/hooks';
import { scheduleInterview } from '@/store/slices/interviewsSlice';
import type { InterviewType } from '@/types/models';

export default function ScheduleInterviewDrawer({
  open,
  onClose,
  candidateId,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  candidateId: string;
  onDone?: () => void;
}) {
  const dispatch = useAppDispatch();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState<InterviewType>('Screening');
  const [interviewer, setInterviewer] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    const next: Record<string, string> = {};
    if (!date) next.date = 'Pick a date.';
    if (!time) next.time = 'Pick a time.';
    if (!interviewer.trim()) next.interviewer = 'Interviewer name is required.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      await dispatch(
        scheduleInterview({
          candidateId,
          payload: {
            scheduled_at: new Date(`${date}T${time}`).toISOString(),
            type,
            interviewer_name: interviewer,
            notes: notes || undefined,
          },
        }),
      ).unwrap();
      toast.success('Interview scheduled');
      onDone?.();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't schedule the interview");
      setLoading(false);
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Schedule interview"
      description="Pick a time, type, and interviewer for this candidate."
      footer={
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1" loading={loading} onClick={handleSubmit}>
            Schedule interview
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <Field label="Date" required error={errors.date} htmlFor="iv-date">
          <Input
            id="iv-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            invalid={!!errors.date}
          />
        </Field>

        <Field label="Time" required error={errors.time} htmlFor="iv-time">
          <Input
            id="iv-time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            invalid={!!errors.time}
          />
        </Field>

        <Field label="Interview type" required>
          <Segmented<InterviewType>
            value={type}
            onChange={setType}
            fill
            options={[
              { value: 'Screening', label: 'Screening', icon: <User className="h-3.5 w-3.5" /> },
              { value: 'Technical', label: 'Technical', icon: <Code2 className="h-3.5 w-3.5" /> },
            ]}
          />
        </Field>

        <Field
          label="Interviewer name"
          required
          error={errors.interviewer}
          htmlFor="iv-interviewer"
        >
          <Input
            id="iv-interviewer"
            placeholder="e.g. Neha Patel"
            value={interviewer}
            onChange={(e) => setInterviewer(e.target.value)}
            invalid={!!errors.interviewer}
            leftIcon={<User className="h-4 w-4" />}
          />
        </Field>

        <Field label="Notes (optional)" htmlFor="iv-notes">
          <Textarea
            id="iv-notes"
            rows={4}
            placeholder="Add any context or preparation notes for the interviewer…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Field>

        <div className="flex items-start gap-2.5 rounded-[8px] border border-border bg-surface2/50 p-3 text-sm text-text-secondary">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#7BB6F6]" />
          <p>
            Once scheduled, the candidate status will be updated to{' '}
            <span className="font-medium text-brand-hover">Interview Scheduled</span>.
          </p>
        </div>
      </div>
    </Drawer>
  );
}
