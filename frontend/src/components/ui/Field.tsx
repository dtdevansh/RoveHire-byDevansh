import { cn } from '@/lib/utils/cn';

export default function Field({
  label,
  required,
  htmlFor,
  helper,
  error,
  children,
  className,
}: {
  label?: string;
  required?: boolean;
  htmlFor?: string;
  helper?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-xs font-medium text-text-secondary"
        >
          {label}
          {required && <span className="ml-0.5 text-brand-hover">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-[#F58A8A]">{error}</p>
      ) : (
        helper && <p className="text-xs text-text-muted">{helper}</p>
      )}
    </div>
  );
}
