
'use client';

import Link from 'next/link';
import { GraduationCap, LogIn, UserPlus, LogOut } from 'lucide-react';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export function Header() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/signin');
  };

  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <GraduationCap className="h-8 w-8 text-primary mr-3" />
          <Link href="/" legacyBehavior passHref>
            <a className="text-xl md:text-3xl font-bold text-foreground hover:text-primary transition-colors">
              Hybrid Human-AI Grading System
            </a>
          </Link>
        </div>
        <nav className="flex items-center gap-2 md:gap-4">
          <ThemeToggleButton />
          {loading ? (
            <Skeleton className="h-9 w-24 rounded-md" />
          ) : user ? (
            <>
              <span className="text-sm text-muted-foreground hidden md:inline">{user.email}</span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="mr-0 md:mr-2 h-4 w-4" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/signin">
                  <LogIn className="mr-0 md:mr-2 h-4 w-4" /> 
                  <span className="hidden md:inline">Sign In</span>
                </Link>
              </Button>
              <Button variant="default" size="sm" asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/auth/signup">
                  <UserPlus className="mr-0 md:mr-2 h-4 w-4" />
                  <span className="hidden md:inline">Sign Up</span>
                </Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
