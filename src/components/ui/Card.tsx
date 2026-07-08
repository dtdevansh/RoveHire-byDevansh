import { cn } from '@/lib/utils/cn';

export default function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-[12px] border border-border bg-surface1 shadow-[0_1px_2px_rgba(0,0,0,0.4)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
