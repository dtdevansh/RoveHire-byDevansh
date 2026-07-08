import { cn } from '@/lib/utils/cn';

export default function EmptyState({
  icon,
  title,
  body,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  body?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-6 py-16 text-center',
        className,
      )}
    >
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface2 text-text-secondary">
          {icon}
        </div>
      )}
      <h3 className="text-base font-medium text-text-primary">{title}</h3>
      {body && (
        <p className="mt-1.5 max-w-sm text-sm text-text-secondary">{body}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
