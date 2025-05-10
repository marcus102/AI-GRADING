
'use client';

import { AuthForm } from '@/components/auth/AuthForm';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import type { AuthFormValues } from '@/lib/schemas';
import { useEffect } from 'react';
import { Spinner } from '@/components/ui/spinner';


export default function SignUpPage() {
  const { signUp, user, loading } = useAuth(); // Removed isAuthError
  const router = useRouter();

 useEffect(() => {
    if (!loading && user) {
      router.push('/'); // Redirect if already logged in
    }
  }, [user, loading, router]);

  const handleSignUp = async (values: AuthFormValues) => {
    const success = await signUp(values);
    if (success) {
      // Successfully signed up, redirect to sign-in or directly to app
      router.push('/auth/signin'); 
    }
    // Error toasts are now handled within the AuthContext's signUp method
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }
  
  if (user) return null; // Or a redirect component

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <AuthForm isSignUp onSubmit={handleSignUp} />
    </div>
  );
}
