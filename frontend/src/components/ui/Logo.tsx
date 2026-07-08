import { cn } from '@/lib/utils/cn';

// ROVE wordmark. The "E" is rendered as three stacked bars to match the brand mark.
export default function Logo({
  className,
  size = 'md',
}: {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const scale = { sm: 'text-xl', md: 'text-2xl', lg: 'text-4xl' }[size];
  const bar = { sm: 'w-3.5', md: 'w-4', lg: 'w-6' }[size];
  const barH = { sm: 'h-[3px]', md: 'h-[3.5px]', lg: 'h-[5px]' }[size];
  const gap = { sm: 'gap-[3px]', md: 'gap-[4px]', lg: 'gap-[6px]' }[size];

  return (
    <span
      className={cn(
        'inline-flex items-center font-extrabold tracking-tight text-brand select-none',
        scale,
        className,
      )}
    >
      <span>ROV</span>
      <span className={cn('ml-1 flex flex-col justify-center', gap)}>
        <span className={cn('rounded-full bg-brand', bar, barH)} />
        <span className={cn('rounded-full bg-brand', bar, barH)} />
        <span className={cn('rounded-full bg-brand', bar, barH)} />
      </span>
    </span>
  );
}
