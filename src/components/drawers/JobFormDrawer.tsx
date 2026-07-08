'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { Bold, Italic, Link2, List, ListOrdered, Code, Quote, Info } from 'lucide-react';
import Drawer from '@/components/ui/Drawer';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Field from '@/components/ui/Field';
import TagInput from '@/components/ui/TagInput';
import Segmented from '@/components/ui/Segmented';
import { cn } from '@/lib/utils/cn';
import { useAppDispatch } from '@/store/hooks';
import { createJob, updateJob } from '@/store/slices/jobsSlice';
import type { JobOpening, JobStatus } from '@/types/models';

const TOOLBAR = [Bold, Italic, Link2, List, ListOrdered, Code, Quote];

export default function JobFormDrawer({
  open,
  onClose,
  job,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  job?: JobOpening | null;
  onSaved?: () => void;
}) {
  const dispatch = useAppDispatch();
  const editing = Boolean(job);

  const [title, setTitle] = useState(job?.title ?? '');
  const [description, setDescription] = useState(job?.description ?? '');
  const [skills, setSkills] = useState<string[]>(job?.required_skills ?? []);
  const [status, setStatus] = useState<JobStatus>(job?.status ?? 'Open');
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = 'Title is required.';
    if (!description.trim()) next.description = 'Description is required.';
    if (skills.length === 0) next.skills = 'Add at least one skill.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    try {
      if (editing && job) {
        await dispatch(
          updateJob({
            id: job.id,
            payload: { title, description, required_skills: skills, status },
          }),
        ).unwrap();
        toast.success('Changes saved');
      } else {
        await dispatch(
          createJob({ title, description, required_skills: skills, status }),
        ).unwrap();
        toast.success('Job created');
      }
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save the job");
      setLoading(false);
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={editing ? 'Edit job' : 'Create job'}
      description={
        editing
          ? 'Update the job details below.'
          : 'Add a new opening to start attracting candidates.'
      }
      footer={
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1" loading={loading} onClick={handleSubmit}>
            {editing ? 'Save changes' : 'Create job'}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <Field label="Title" required error={errors.title} htmlFor="job-title">
          <Input
            id="job-title"
            placeholder="e.g. Frontend Engineer"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            invalid={!!errors.title}
          />
        </Field>

        <Field label="Description" required error={errors.description}>
          <div
            className={cn(
              'overflow-hidden rounded-[8px] border bg-surface2',
              errors.description ? 'border-[rgba(239,68,68,0.5)]' : 'border-border',
            )}
          >
            <div className="flex items-center justify-between border-b border-border px-2 py-1.5">
              <div className="flex gap-1">
                {(['write', 'preview'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    className={cn(
                      'rounded-[6px] px-2.5 py-1 text-xs font-medium capitalize transition-colors',
                      tab === t
                        ? 'bg-brand-subtle text-brand-hover'
                        : 'text-text-secondary hover:text-text-primary',
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-0.5 text-text-muted">
                {TOOLBAR.map((Icon, i) => (
                  <span key={i} className="rounded p-1">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                ))}
              </div>
            </div>
            {tab === 'write' ? (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the role, responsibilities, requirements, benefits, and anything else candidates should know…"
                className="h-56 w-full resize-y bg-transparent px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
              />
            ) : (
              <div className="prose-invert h-56 overflow-y-auto px-3 py-2.5 text-sm text-text-secondary">
                {description ? (
                  <div className="markdown space-y-2">
                    <ReactMarkdown>{description}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-text-muted">Nothing to preview yet.</p>
                )}
              </div>
            )}
            <div className="border-t border-border px-3 py-1.5 text-right text-[11px] text-text-muted">
              Markdown supported
            </div>
          </div>
        </Field>

        <Field
          label="Required skills"
          required
          error={errors.skills}
          helper="Add the key skills needed for this role."
        >
          <TagInput
            value={skills}
            onChange={setSkills}
            placeholder="Type a skill and press Enter"
            invalid={!!errors.skills}
          />
        </Field>

        <Field label="Status" required>
          <Segmented<JobStatus>
            value={status}
            onChange={setStatus}
            options={[
              { value: 'Open', label: 'Open' },
              { value: 'Closed', label: 'Closed' },
            ]}
          />
          <div className="mt-1 flex items-start gap-2 text-xs text-text-muted">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#7BB6F6]" />
            {status === 'Open'
              ? 'Open jobs are visible to candidates in the application flow.'
              : 'Closed jobs are hidden from the application flow and no new candidates can be added.'}
          </div>
        </Field>
      </div>
    </Drawer>
  );
}
