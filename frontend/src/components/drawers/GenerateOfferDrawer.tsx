'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Check, Info, Lock, Download, CalendarDays, FileText } from 'lucide-react';
import Drawer from '@/components/ui/Drawer';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Field from '@/components/ui/Field';
import Spinner from '@/components/ui/Spinner';
import StatusCircle from '@/components/ui/StatusCircle';
import { generateOffer, type GeneratedOffer } from '@/lib/api/offers';
import { currencySymbol } from '@/lib/utils/format';
import { formatDate } from '@/lib/utils/date';
import { formatFileSize } from '@/lib/utils/format';

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'];

export default function GenerateOfferDrawer({
  open,
  onClose,
  candidateId,
  defaultRole,
  blocked,
  onViewProfile,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  candidateId: string;
  defaultRole?: string;
  blocked?: boolean;
  onViewProfile?: () => void;
  onDone?: () => void;
}) {
  const [role, setRole] = useState(defaultRole ?? '');
  const [currency, setCurrency] = useState('INR');
  const [amount, setAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [manager, setManager] = useState('');
  const [location, setLocation] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<'form' | 'generating' | 'done'>('form');
  const [offer, setOffer] = useState<GeneratedOffer | null>(null);

  async function handleSubmit() {
    const next: Record<string, string> = {};
    if (!role.trim()) next.role = 'Role title is required.';
    if (!amount.trim()) next.amount = 'Salary is required.';
    if (!startDate) next.startDate = 'Start date is required.';
    if (!manager.trim()) next.manager = 'Reporting manager is required.';
    if (!location.trim()) next.location = 'Location is required.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setPhase('generating');
    try {
      const result = await generateOffer(candidateId, {
        role_title: role,
        salary_currency: currency,
        salary_amount: Number(amount.replace(/[^0-9.]/g, '')),
        start_date: startDate,
        manager_name: manager,
        location,
      });
      setOffer(result);
      setPhase('done');
      onDone?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't generate documents");
      setPhase('form');
    }
  }

  let footer: React.ReactNode = null;
  if (blocked) {
    footer = (
      <Button variant="secondary" className="w-full" onClick={onClose}>
        Close
      </Button>
    );
  } else if (phase === 'form') {
    footer = (
      <div>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSubmit}>
            Generate documents
          </Button>
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-text-muted">
          <Lock className="h-3 w-3" />
          Documents will be saved to this candidate&apos;s profile.
        </p>
      </div>
    );
  } else if (phase === 'done') {
    footer = (
      <div>
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
            View profile
          </Button>
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-text-muted">
          <Info className="h-3 w-3" />
          Multiple offers are allowed. Each set is saved on the profile.
        </p>
      </div>
    );
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Generate offer documents"
      description={
        blocked || phase !== 'form'
          ? undefined
          : 'Create the offer letter and NDA for this candidate.'
      }
      width={520}
      footer={footer}
    >
      {blocked ? (
        <div className="flex flex-col items-center py-8 text-center">
          <StatusCircle tone="neutral" size={72}>
            <Lock className="h-8 w-8" />
          </StatusCircle>
          <h3 className="mt-5 text-lg font-semibold text-text-primary">
            Action not available
          </h3>
          <p className="mt-1.5 max-w-xs text-sm text-text-secondary">
            This candidate has already been marked as hired. Offer documents
            cannot be generated.
          </p>
        </div>
      ) : phase === 'generating' ? (
        <div className="flex flex-col items-center py-12 text-center">
          <Spinner size={40} />
          <h3 className="mt-6 text-lg font-semibold text-text-primary">
            Generating documents…
          </h3>
          <p className="mt-1.5 max-w-xs text-sm text-text-secondary">
            Please wait while we create the offer letter and NDA.
          </p>
          <div className="mt-8 flex w-full items-start gap-2.5 rounded-[8px] border border-border bg-surface2/50 p-3 text-left text-sm text-text-secondary">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#7BB6F6]" />
            <p>
              This may take a few moments. You can close this drawer — we&apos;ll
              notify you when the documents are ready.
            </p>
          </div>
        </div>
      ) : phase === 'done' && offer ? (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col items-center pt-2 text-center">
            <StatusCircle tone="success" size={64}>
              <Check className="h-8 w-8" strokeWidth={2.5} />
            </StatusCircle>
            <h3 className="mt-4 text-lg font-semibold text-text-primary">
              Documents generated
            </h3>
            <p className="mt-1 max-w-xs text-sm text-text-secondary">
              Your offer letter and NDA are ready to download. They&apos;re also
              saved on the candidate&apos;s profile.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <DocRow
              name="Offer letter"
              meta={`Generated on ${formatDate(offer.created_at)} · ${formatFileSize(offer.offer_size_bytes)}`}
              href={offer.offer_download_url}
            />
            <DocRow
              name="NDA"
              meta={`Generated on ${formatDate(offer.created_at)} · ${formatFileSize(offer.nda_size_bytes)}`}
              href={offer.nda_download_url}
            />
          </div>

          <div className="flex items-start gap-2.5 rounded-[8px] border border-[rgba(16,185,129,0.25)] bg-[rgba(16,185,129,0.08)] p-3 text-sm">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#4ADE9B]" />
            <div>
              <p className="font-medium text-[#4ADE9B]">Candidate status updated</p>
              <p className="mt-0.5 text-text-secondary">
                This candidate has been moved to Offer Sent.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <Field
            label="Role title"
            required
            error={errors.role}
            helper="This will appear in the offer letter."
            htmlFor="off-role"
          >
            <Input
              id="off-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              invalid={!!errors.role}
            />
          </Field>

          <Field
            label="Salary"
            required
            error={errors.amount}
            helper="Annual CTC in the candidate's currency."
          >
            <div className="flex gap-2">
              <div className="relative w-28 shrink-0">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="h-9 w-full appearance-none rounded-[8px] border border-border bg-surface2 pl-3 pr-8 text-sm text-text-primary focus:border-brand focus:outline-none"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c} ({currencySymbol(c)})
                    </option>
                  ))}
                </select>
              </div>
              <Input
                className="flex-1 font-mono"
                inputMode="numeric"
                placeholder="12,00,000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                invalid={!!errors.amount}
              />
            </div>
          </Field>

          <Field
            label="Start date"
            required
            error={errors.startDate}
            helper="Candidate's expected start date."
            htmlFor="off-start"
          >
            <Input
              id="off-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              invalid={!!errors.startDate}
              leftIcon={<CalendarDays className="h-4 w-4" />}
            />
          </Field>

          <Field
            label="Reporting manager name"
            required
            error={errors.manager}
            helper="The manager to be mentioned in the offer letter."
            htmlFor="off-manager"
          >
            <Input
              id="off-manager"
              value={manager}
              onChange={(e) => setManager(e.target.value)}
              invalid={!!errors.manager}
            />
          </Field>

          <Field
            label="Location"
            required
            error={errors.location}
            helper="Work location for the role."
            htmlFor="off-location"
          >
            <Input
              id="off-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              invalid={!!errors.location}
            />
          </Field>
        </div>
      )}
    </Drawer>
  );
}

function DocRow({
  name,
  meta,
  href,
}: {
  name: string;
  meta: string;
  href: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[8px] border border-border bg-surface2/50 p-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] bg-[rgba(239,68,68,0.12)] text-[#F58A8A]">
        <FileText className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-text-primary">{name}</p>
        <p className="truncate text-xs text-text-muted">{meta}</p>
      </div>
      <a href={href} download>
        <Button variant="secondary" size="sm" icon={<Download className="h-3.5 w-3.5" />}>
          Download
        </Button>
      </a>
    </div>
  );
}
