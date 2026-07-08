'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Check, Copy, FileText, Info, UploadCloud, X } from 'lucide-react';
import Drawer from '@/components/ui/Drawer';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Field from '@/components/ui/Field';
import StatusCircle from '@/components/ui/StatusCircle';
import { createCandidate } from '@/lib/api/candidates';
import { listJobs } from '@/lib/api/jobs';
import { formatFileSize } from '@/lib/utils/format';
import type { JobListItemDTO } from '@/types/dto';

const MAX_SIZE = 10 * 1024 * 1024;

export default function AddCandidateDrawer({
  open,
  onClose,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  onAdded?: () => void;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [jobs, setJobs] = useState<JobListItemDTO[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [jobId, setJobId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState<{ id: string; url: string } | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    listJobs()
      .then((all) => setJobs(all.filter((j) => j.status === 'Open')))
      .catch(() => setJobs([]));
  }, [open]);

  function reset() {
    setName('');
    setEmail('');
    setJobId('');
    setFile(null);
    setErrors({});
    setResult(null);
    setCreatedId(null);
    setLoading(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function validateFile(f: File): string | null {
    if (f.type !== 'application/pdf') return 'Only PDF files up to 10MB are allowed.';
    if (f.size > MAX_SIZE) return 'Only PDF files up to 10MB are allowed.';
    return null;
  }

  function onFile(f: File | undefined) {
    if (!f) return;
    const err = validateFile(f);
    if (err) {
      setErrors((e) => ({ ...e, resume: err }));
      return;
    }
    setErrors((e) => ({ ...e, resume: '' }));
    setFile(f);
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Name is required.';
    if (!email.trim()) next.email = 'Email is required.';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
      next.email = 'Enter a valid email address.';
    if (!jobId) next.jobId = 'Select a job opening.';
    if (!file) next.resume = 'A PDF resume is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', name);
      fd.append('email', email);
      fd.append('job_opening_id', jobId);
      if (file) fd.append('resume', file);
      const res = await createCandidate(fd);
      setCreatedId(res.id);
      setResult({ id: res.id, url: res.application_url });
      onAdded?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't add candidate");
      setLoading(false);
    }
  }

  async function copyLink() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.url);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error("Couldn't copy the link");
    }
  }

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title="Add candidate"
      description={
        result
          ? undefined
          : 'Add a new candidate to the pipeline and invite them to complete their application.'
      }
      footer={
        result ? (
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => createdId && router.push(`/candidates/${createdId}`)}
            >
              View profile
            </Button>
            <Button className="flex-1" onClick={handleClose}>
              Done
            </Button>
          </div>
        ) : (
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              loading={loading}
              onClick={handleSubmit}
              type="submit"
            >
              Add candidate
            </Button>
          </div>
        )
      }
    >
      {result ? (
        <div className="flex flex-col items-center pt-4 text-center">
          <StatusCircle tone="success">
            <Check className="h-9 w-9" strokeWidth={2.5} />
          </StatusCircle>
          <h3 className="mt-5 text-lg font-semibold text-text-primary">
            Candidate added
          </h3>
          <p className="mt-1.5 max-w-xs text-sm text-text-secondary">
            Share the application link with the candidate to complete their
            details.
          </p>

          <div className="mt-6 w-full text-left">
            <p className="mb-1.5 text-xs font-medium text-text-secondary">
              Application link{' '}
              <span className="text-text-muted">(valid for 14 days)</span>
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 overflow-x-auto rounded-[8px] border border-border bg-surface2 px-3 py-2.5 font-mono text-xs text-text-primary">
                {result.url}
              </div>
              <Button
                variant="secondary"
                size="sm"
                icon={<Copy className="h-3.5 w-3.5" />}
                onClick={copyLink}
              >
                Copy link
              </Button>
            </div>
            <p className="mt-3 text-sm text-text-secondary">
              Share this link with the candidate to complete their application.
              Valid for 14 days.
            </p>

            <div className="mt-5 flex gap-3 rounded-[8px] border border-border bg-surface2/50 p-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#7BB6F6]" />
              <div>
                <p className="text-sm font-medium text-text-primary">
                  How it works
                </p>
                <p className="mt-0.5 text-[13px] text-text-secondary">
                  The candidate will use this link to complete their application
                  form. You&apos;ll be notified once they submit.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Field label="Name" required error={errors.name} htmlFor="cand-name">
            <Input
              id="cand-name"
              placeholder="Enter full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              invalid={!!errors.name}
            />
          </Field>

          <Field label="Email" required error={errors.email} htmlFor="cand-email">
            <Input
              id="cand-email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              invalid={!!errors.email}
            />
          </Field>

          <Field
            label="Job opening"
            required
            error={errors.jobId}
            helper="Only open job openings are shown."
            htmlFor="cand-job"
          >
            <Select
              id="cand-job"
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              invalid={!!errors.jobId}
            >
              <option value="" disabled>
                Select an open job
              </option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Resume (PDF only, up to 10MB)"
            required
            error={errors.resume}
          >
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                onFile(e.dataTransfer.files?.[0]);
              }}
              onClick={() => fileRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-[8px] border border-dashed px-4 py-8 text-center transition-colors ${
                dragging
                  ? 'border-brand bg-brand-subtle'
                  : errors.resume
                    ? 'border-[rgba(239,68,68,0.5)]'
                    : 'border-border hover:border-border-strong'
              }`}
            >
              <UploadCloud className="mb-2 h-6 w-6 text-text-muted" />
              <p className="text-sm text-text-secondary">
                Drag and drop your file here
              </p>
              <p className="text-sm text-text-secondary">
                or <span className="font-medium text-brand-hover">click to browse</span>
              </p>
              <input
                ref={fileRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => onFile(e.target.files?.[0])}
              />
            </div>

            {file && (
              <div className="mt-2 flex items-center gap-3 rounded-[8px] border border-border bg-surface2 px-3 py-2.5">
                <FileText className="h-5 w-5 shrink-0 text-text-secondary" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-text-primary">{file.name}</p>
                  <p className="text-xs text-text-muted">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="rounded-md p-1 text-text-muted hover:text-text-primary"
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </Field>
        </form>
      )}
    </Drawer>
  );
}
