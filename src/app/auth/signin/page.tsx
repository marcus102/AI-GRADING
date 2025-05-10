
'use client';

import { AuthForm } from '@/components/auth/AuthForm';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import type { AuthFormValues } from '@/lib/schemas';
import { useEffect } from 'react';
import { Spinner } from '@/components/ui/spinner';

export default function SignInPage() {
  const { signIn, user, loading, isAuthError } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleSignIn = async (values: AuthFormValues) => {
    const result = await signIn(values);
    if (!isAuthError(result)) {
       router.push('/');
    }
    // Error handling is done within AuthContext/AuthForm and via toast
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }
  
  if (user) return null; // Or a redirect component, but useEffect handles it

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <AuthForm onSubmit={handleSignIn} />
    </div>
  );
}
