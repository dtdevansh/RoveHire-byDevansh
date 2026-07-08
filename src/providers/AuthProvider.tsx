'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { bootstrapSession, setSession } from '@/store/slices/authSlice';
import { supabase } from '@/lib/supabase/client';

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(bootstrapSession());

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      dispatch(setSession(session));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  return <>{children}</>;
}
