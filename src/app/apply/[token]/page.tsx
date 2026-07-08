'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Phone,
  MapPin,
  Briefcase,
  IndianRupee,
  Link2,
  ShieldCheck,
  Check,
  Clock,
  X,
  Mail,
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Field from '@/components/ui/Field';
import Spinner from '@/components/ui/Spinner';
import StatusCircle from '@/components/ui/StatusCircle';
import { getApplyContext, submitApplication } from '@/lib/api/apply';
import type { ApplyContextDTO } from '@/types/dto';

type Phase = 'loading' | 'form' | 'submitted' | 'expired' | 'invalid';

const NOTICE_OPTIONS = ['Immediate', '15 days', '30 days', '60 days', '90 days'];

export default function ApplyPage() {
  const { token } = useParams<{ token: string }>();
  const [phase, setPhase] = useState<Phase>('loading');
  const [ctx, setCtx] = useState<ApplyContextDTO | null>(null);
  const [alreadyUsed, setAlreadyUsed] = useState(false);

  const [form, setForm] = useState({
    phone: '',
    location: '',
    role: '',
    notice: '',
    salary: '',
    linkedin: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    getApplyContext(token)
      .then((data) => {
        if (!active) return;
        setCtx(data);
        setPhase('form');
      })
      .catch((err: unknown) => {
        if (!active) return;
        const { code } = classifyError(err);
        if (code === 'EXPIRED') setPhase('expired');
        else {
          setAlreadyUsed(code === 'ALREADY_USED');
          setPhase('invalid');
        }
      });
    return () => {
      active = false;
    };
  }, [token]);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.phone.trim()) next.phone = 'Phone number is required.';
    if (!form.location.trim()) next.location = 'Current location is required.';
    if (!form.role.trim()) next.role = 'Current role is required.';
    if (!form.notice) next.notice = 'Select your notice period.';
    if (!form.salary.trim()) next.salary = 'Salary expectation is required.';
    if (!form.linkedin.trim()) next.linkedin = 'LinkedIn URL is required.';
    else if (!/^https?:\/\/.+/.test(form.linkedin))
      next.linkedin = 'Enter a valid URL (starting with http).';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitError(null);
    setSubmitting(true);
    try {
      await submitApplication(token, {
        phone: form.phone,
        current_location: form.location,
        current_role: form.role,
        notice_period: form.notice,
        salary_expectation: form.salary,
        linkedin_url: form.linkedin,
      });
      setPhase('submitted');
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-4 py-12">
      <div className="w-full max-w-[480px]">
        {phase === 'loading' && (
          <Shell>
            <div className="flex flex-col items-center py-10 text-center">
              <Spinner size={36} />
              <p className="mt-5 text-sm text-text-secondary">
                Validating your application link…
              </p>
              <p className="text-sm text-text-muted">Please wait a moment.</p>
            </div>
          </Shell>
        )}

        {phase === 'form' && ctx && (
          <Shell>
            <div className="mb-6 text-center">
              <h1 className="text-xl font-semibold text-text-primary">
                Hi {ctx.candidate_name},
              </h1>
              <p className="mt-1 text-sm text-text-secondary">
                Complete your application for{' '}
                <span className="font-medium text-text-primary">{ctx.role}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Field label="Phone number" required error={errors.phone}>
                <Input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  invalid={!!errors.phone}
                  leftIcon={<Phone className="h-4 w-4" />}
                />
              </Field>

              <Field label="Current location" required error={errors.location}>
                <Input
                  placeholder="City, Country"
                  value={form.location}
                  onChange={(e) => set('location', e.target.value)}
                  invalid={!!errors.location}
                  leftIcon={<MapPin className="h-4 w-4" />}
                />
              </Field>

              <Field label="Current role" required error={errors.role}>
                <Input
                  placeholder="e.g. Frontend Developer"
                  value={form.role}
                  onChange={(e) => set('role', e.target.value)}
                  invalid={!!errors.role}
                  leftIcon={<Briefcase className="h-4 w-4" />}
                />
              </Field>

              <Field label="Notice period" required error={errors.notice}>
                <Select
                  value={form.notice}
                  onChange={(e) => set('notice', e.target.value)}
                  invalid={!!errors.notice}
                >
                  <option value="" disabled>
                    Select notice period
                  </option>
                  {NOTICE_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Salary expectation" required error={errors.salary}>
                <Input
                  placeholder="12,00,000"
                  value={form.salary}
                  onChange={(e) => set('salary', e.target.value)}
                  invalid={!!errors.salary}
                  leftIcon={<IndianRupee className="h-4 w-4" />}
                />
              </Field>

              <Field label="LinkedIn URL" required error={errors.linkedin}>
                <Input
                  type="url"
                  placeholder="https://www.linkedin.com/in/username"
                  value={form.linkedin}
                  onChange={(e) => set('linkedin', e.target.value)}
                  invalid={!!errors.linkedin}
                  leftIcon={<Link2 className="h-4 w-4" />}
                />
              </Field>

              <p className="flex items-center gap-1.5 text-xs text-text-muted">
                <ShieldCheck className="h-3.5 w-3.5" />
                We&apos;ll only use this information for your application.
              </p>

              {submitError && (
                <p className="rounded-[8px] border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.1)] px-3 py-2 text-sm text-[#F58A8A]">
                  {submitError}
                </p>
              )}

              <Button type="submit" loading={submitting} className="mt-1 w-full">
                Submit application
              </Button>
            </form>

            <p className="mt-5 text-center text-xs text-text-muted">
              Having trouble with the form? Contact the{' '}
              <span className="font-medium text-brand-hover">ROVE team.</span>
            </p>
          </Shell>
        )}

        {phase === 'submitted' && (
          <Shell>
            <Centered
              circle={
                <StatusCircle tone="success">
                  <Check className="h-9 w-9" strokeWidth={2.5} />
                </StatusCircle>
              }
              title="Thanks — you're all set."
              body="The ROVE team has your details and will be in touch."
            />
          </Shell>
        )}

        {phase === 'expired' && (
          <Shell>
            <Centered
              circle={
                <StatusCircle tone="warning">
                  <Clock className="h-9 w-9" />
                </StatusCircle>
              }
              title="This link has expired."
              body="Application links are valid for 14 days. Contact the ROVE team for a new one."
              action={<ContactButton />}
            />
          </Shell>
        )}

        {phase === 'invalid' && (
          <Shell>
            <Centered
              circle={
                <StatusCircle tone="error">
                  <X className="h-9 w-9" strokeWidth={2.5} />
                </StatusCircle>
              }
              title="This link is no longer valid."
              body={
                alreadyUsed
                  ? 'This application was already submitted. If you believe this is a mistake, please contact the ROVE team.'
                  : 'If you believe this is a mistake, please contact the ROVE team.'
              }
              action={<ContactButton />}
            />
          </Shell>
        )}
      </div>
    </main>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[12px] border border-border bg-surface1 p-7 shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
      <div className="mb-6 flex justify-center">
        <Logo />
      </div>
      {children}
    </div>
  );
}

function Centered({
  circle,
  title,
  body,
  action,
}: {
  circle: React.ReactNode;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center py-6 text-center">
      {circle}
      <h1 className="mt-6 text-xl font-semibold text-text-primary">{title}</h1>
      <p className="mt-2 max-w-xs text-sm text-text-secondary">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

function ContactButton() {
  return (
    <a href="mailto:team@rove.com">
      <Button variant="secondary" icon={<Mail className="h-4 w-4" />}>
        Contact the ROVE team
      </Button>
    </a>
  );
}

function classifyError(err: unknown): { code: string } {
  const e = err as { status?: number; code?: string; message?: string };
  if (e?.code === 'TOKEN_EXPIRED' || e?.status === 410) return { code: 'EXPIRED' };
  if (e?.code === 'TOKEN_USED' || e?.status === 409) return { code: 'ALREADY_USED' };
  if (e?.status === 404) return { code: 'INVALID' };
  const msg = (e?.message ?? '').toUpperCase();
  if (msg.includes('EXPIRED')) return { code: 'EXPIRED' };
  if (msg.includes('ALREADY') || msg.includes('USED')) return { code: 'ALREADY_USED' };
  return { code: 'INVALID' };
}
