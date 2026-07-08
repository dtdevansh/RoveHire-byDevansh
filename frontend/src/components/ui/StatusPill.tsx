import { STATUS_MAP } from '@/lib/constants/statuses';
import type { CandidateStatus } from '@/types/models';
import { cn } from '@/lib/utils/cn';

export default function StatusPill({
  status,
  className,
}: {
  status: CandidateStatus;
  className?: string;
}) {
  const token = STATUS_MAP[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        className,
      )}
      style={{ backgroundColor: token.bg, color: token.text }}
    >
      <span
        className="h-[7px] w-[7px] shrink-0 rounded-full"
        style={{ backgroundColor: token.base }}
      />
      {token.label}
    </span>
  );
}
