import { cn } from '@/lib/utils/cn';

type Tone = 'success' | 'error' | 'warning' | 'neutral';

const TONES: Record<Tone, { ring: string; color: string }> = {
  success: { ring: 'border-[#10B981]', color: 'text-[#4ADE9B]' },
  error: { ring: 'border-[#EF4444]', color: 'text-[#F58A8A]' },
  warning: { ring: 'border-[#EAB308]', color: 'text-[#F3CC5C]' },
  neutral: { ring: 'border-border-strong', color: 'text-text-secondary' },
};

// The large ringed icon used in success / expired / invalid / confirm screens.
export default function StatusCircle({
  tone = 'success',
  size = 72,
  children,
  className,
}: {
  tone?: Tone;
  size?: number;
  children: React.ReactNode;
  className?: string;
}) {
  const t = TONES[tone];
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full border-2',
        t.ring,
        t.color,
        className,
      )}
      style={{ width: size, height: size }}
    >
      {children}
    </span>
  );
}
