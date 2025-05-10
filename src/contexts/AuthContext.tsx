
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import type { AuthFormValues } from '@/lib/schemas';
import { useToast } from '@/hooks/use-toast';

// Simplified User interface for localStorage
interface LocalUser {
  email: string;
  // In a real app, NEVER store passwords like this. This is for demonstration purposes only.
  password?: string; 
}

// This is a simplified AuthError-like structure for localStorage operations
interface LocalAuthError {
  code: string;
  message: string;
}

interface AuthContextType {
  user: LocalUser | null;
  loading: boolean;
  signIn: (values: AuthFormValues) => Promise<boolean>; // Returns true on success, false on failure
  signUp: (values: AuthFormValues) => Promise<boolean>; // Returns true on success, false on failure
  signOut: () => Promise<void>;
  isAuthError: (error: any) => error is LocalAuthError; // Kept for compatibility, but less relevant
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'localStorageUsers';
const LOGGED_IN_USER_KEY = 'loggedInUserEmail';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    try {
      const loggedInUserEmail = localStorage.getItem(LOGGED_IN_USER_KEY);
      if (loggedInUserEmail) {
        const storedUsersRaw = localStorage.getItem(USERS_STORAGE_KEY);
        const storedUsers: LocalUser[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
        const foundUser = storedUsers.find(u => u.email === loggedInUserEmail);
        if (foundUser) {
          setUser({ email: foundUser.email }); // Don't set password in active user state
        } else {
          // User email in session but not in users list, clear session
          localStorage.removeItem(LOGGED_IN_USER_KEY);
        }
      }
    } catch (error) {
      console.error("Error reading auth state from localStorage:", error);
      // Clear potentially corrupted keys
      localStorage.removeItem(LOGGED_IN_USER_KEY);
    }
    setLoading(false);
  }, []);

  const isAuthError = (error: any): error is LocalAuthError => {
    return error && typeof error.code === 'string' && typeof error.message === 'string';
  };

  const signIn = async (values: AuthFormValues): Promise<boolean> => {
    setLoading(true);
    try {
      const storedUsersRaw = localStorage.getItem(USERS_STORAGE_KEY);
      const storedUsers: LocalUser[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
      const foundUser = storedUsers.find(u => u.email === values.email);

      if (foundUser && foundUser.password === values.password) {
        setUser({ email: foundUser.email });
        localStorage.setItem(LOGGED_IN_USER_KEY, foundUser.email);
        toast({ title: 'Signed In', description: 'Successfully signed in.', variant: 'default' });
        setLoading(false);
        return true;
      } else {
        toast({ title: 'Sign In Error', description: 'Invalid email or password.', variant: 'destructive' });
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast({ title: 'Sign In Error', description: 'An unexpected error occurred.', variant: 'destructive' });
      setLoading(false);
      return false;
    }
  };

  const signUp = async (values: AuthFormValues): Promise<boolean> => {
    setLoading(true);
    try {
      const storedUsersRaw = localStorage.getItem(USERS_STORAGE_KEY);
      let storedUsers: LocalUser[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
      
      if (storedUsers.some(u => u.email === values.email)) {
        toast({ title: 'Sign Up Error', description: 'User with this email already exists.', variant: 'destructive' });
        setLoading(false);
        return false;
      }

      // WARNING: Storing password in localStorage is highly insecure.
      storedUsers.push({ email: values.email, password: values.password });
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(storedUsers));
      
      toast({ title: 'Signed Up', description: 'Successfully signed up. Please sign in.', variant: 'default' });
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Sign up error:", error);
      toast({ title: 'Sign Up Error', description: 'An unexpected error occurred.', variant: 'destructive' });
      setLoading(false);
      return false;
    }
  };

  const signOutUser = async (): Promise<void> => {
    setLoading(true);
    try {
      setUser(null);
      localStorage.removeItem(LOGGED_IN_USER_KEY);
      toast({ title: 'Signed Out', description: 'Successfully signed out.', variant: 'default' });
    } catch (error) {
       console.error("Sign out error:", error);
       toast({ title: 'Sign Out Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    }
    setLoading(false);
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

// Helper function to represent Firebase User object with a simpler LocalUser for localStorage.
// Not directly used in this implementation, but good for reference if more User fields were needed.
// export const toLocalUser = (firebaseUser: FirebaseUser | null): LocalUser | null => {
//   if (!firebaseUser) return null;
//   return { email: firebaseUser.email || "" }; // Only storing email
// };
