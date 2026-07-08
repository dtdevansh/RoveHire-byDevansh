import { initials } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

// Deterministic warm-neutral gradient per name so avatars are stable but varied.
const PALETTES = [
  ['#5B6472', '#3A4150'],
  ['#4B93F7', '#2C5FA8'],
  ['#8B5CF6', '#5B3AA8'],
  ['#EAB308', '#A87C0E'],
  ['#10B981', '#0B7A57'],
  ['#EF4444', '#A82F2F'],
  ['#E05020', '#A83B18'],
];

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export default function Avatar({
  name,
  size = 'md',
  className,
}: {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const [from, to] = PALETTES[hash(name) % PALETTES.length];
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-16 w-16 text-xl',
  };
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white/90',
        sizes[size],
        className,
      )}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      {initials(name)}
    </span>
  );
}
