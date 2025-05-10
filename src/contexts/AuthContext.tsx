
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import type { User, AuthError } from 'firebase/auth';
import { 
  onAuthStateChanged, 
  signInWithEmail as firebaseSignInWithEmail, 
  signUpWithEmail as firebaseSignUpWithEmail, 
  signOut as firebaseSignOut,
  isAuthError
} from '@/lib/firebase/auth';
import type { AuthFormValues } from '@/lib/schemas';
import { useToast } from '@/hooks/use-toast';


interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (values: AuthFormValues) => Promise<User | AuthError>;
  signUp: (values: AuthFormValues) => Promise<User | AuthError>;
  signOut: () => Promise<void | AuthError>;
  isAuthError: (error: any) => error is AuthError;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((authUser) => {
      setUser(authUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async (values: AuthFormValues) => {
    const result = await firebaseSignInWithEmail(values);
    if (isAuthError(result)) {
      toast({ title: 'Sign In Error', description: result.message, variant: 'destructive' });
    } else {
      toast({ title: 'Signed In', description: 'Successfully signed in.', variant: 'default' });
    }
    return result;
  };

  const signUp = async (values: AuthFormValues) => {
    const result = await firebaseSignUpWithEmail(values);
     if (isAuthError(result)) {
      toast({ title: 'Sign Up Error', description: result.message, variant: 'destructive' });
    } else {
      toast({ title: 'Signed Up', description: 'Successfully signed up. Please sign in.', variant: 'default' });
    }
    return result;
  };

  const signOutUser = async () => {
    const result = await firebaseSignOut();
    if (isAuthError(result)) {
      toast({ title: 'Sign Out Error', description: result.message, variant: 'destructive' });
    } else {
      toast({ title: 'Signed Out', description: 'Successfully signed out.', variant: 'default' });
    }
    return result;
  };


  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut: signOutUser, isAuthError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
