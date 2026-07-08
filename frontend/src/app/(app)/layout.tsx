'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Spinner from '@/components/ui/Spinner';
import { useAppSelector } from '@/store/hooks';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { session, status } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (status === 'succeeded' && !session) {
      router.replace('/login');
    }
  }, [status, session, router]);

  // While bootstrapping session, show a loading spinner
  if (status === 'idle' || status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <Spinner size={32} />
      </div>
    );
  }

  // If no session after bootstrap, don't render app (redirect is in progress)
  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-[1200px] px-6 py-8 lg:px-10">
          {children}
        </div>
      </main>
    </div>
  );
}
