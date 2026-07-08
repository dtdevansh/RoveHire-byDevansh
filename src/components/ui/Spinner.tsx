import { cn } from '@/lib/utils/cn';

export default function Spinner({
  className,
  size = 24,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn('inline-block animate-spin rounded-full', className)}
      style={{
        width: size,
        height: size,
        borderWidth: Math.max(2, Math.round(size / 10)),
        borderStyle: 'solid',
        borderColor: 'var(--color-brand)',
        borderTopColor: 'transparent',
      }}
    />
  );
}
