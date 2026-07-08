import { cn } from '@/lib/utils/cn';

interface Token {
  label: string;
  base: string;
  text: string;
  bg: string;
}

/** Small tinted chip used for interview types and recommendations. */
export function TokenChip({
  token,
  dot = false,
  className,
}: {
  token: Token;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        className,
      )}
      style={{ backgroundColor: token.bg, color: token.text }}
    >
      {dot && (
        <span
          className="h-[6px] w-[6px] rounded-full"
          style={{ backgroundColor: token.base }}
        />
      )}
      {token.label}
    </span>
  );
}

/** Neutral skill chip (job cards, skill lists). */
export function SkillChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md border border-border bg-surface2 px-2.5 py-1 text-xs text-text-secondary">
      {children}
    </span>
  );
}
