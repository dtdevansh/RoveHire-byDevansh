import { cn } from '@/lib/utils/cn';

export default function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton rounded-md', className)} />;
}
