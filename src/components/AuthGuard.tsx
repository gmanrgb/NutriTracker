'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { apiFetch, ApiError } from '@/api/client';

interface User {
  id: string;
  username: string;
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, setUser, clearUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    apiFetch<User>('/api/auth/me')
      .then((u) => setUser(u))
      .catch((e) => {
        clearUser();
        if (e instanceof ApiError && e.status === 401) {
          router.push('/');
        }
      });
  }, [setUser, clearUser, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
