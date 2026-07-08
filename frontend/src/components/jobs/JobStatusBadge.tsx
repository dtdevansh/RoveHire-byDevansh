import { cn } from '@/lib/utils/cn';

export default function JobStatusBadge({ status }: { status: string }) {
  const open = status === 'Open';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        open
          ? 'bg-[rgba(16,185,129,0.15)] text-[#4ADE9B]'
          : 'bg-surface2 text-text-muted',
      )}
    >
      <span
        className={cn(
          'h-[7px] w-[7px] rounded-full',
          open ? 'bg-[#10B981]' : 'bg-text-muted',
        )}
      />
      {open ? 'Open' : 'Closed'}
    </span>
  );
}
