import { AlertCircle } from 'lucide-react';
import Button from './Button';

export default function ErrorState({
  title = "Couldn't load this",
  onRetry,
}: {
  title?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.1)] text-[#F58A8A]">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-base font-medium text-text-primary">{title}</h3>
      <p className="mt-1.5 text-sm text-text-secondary">
        Something went wrong. Please try again.
      </p>
      {onRetry && (
        <Button variant="secondary" className="mt-5" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
