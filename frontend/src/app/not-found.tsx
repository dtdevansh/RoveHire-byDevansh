import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 text-center">
      <Logo size="lg" />
      <p className="mt-8 text-[64px] font-semibold leading-none text-text-primary">
        404
      </p>
      <h1 className="mt-4 text-xl font-semibold text-text-primary">
        Page not found
      </h1>
      <p className="mt-2 max-w-sm text-sm text-text-secondary">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <Link href="/" className="mt-6">
        <Button>Back to dashboard</Button>
      </Link>
    </main>
  );
}
