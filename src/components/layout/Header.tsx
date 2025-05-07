
import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import { ThemeToggleButton } from '@/components/theme-toggle-button';

export function Header() {
  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <GraduationCap className="h-8 w-8 text-primary mr-3" />
          <Link href="/" legacyBehavior passHref>
            <a className="text-3xl font-bold text-foreground hover:text-primary transition-colors">
              Hybrid Human-AI Grading System
            </a>
          </Link>
        </div>
        <nav className="flex items-center gap-4">
          <ThemeToggleButton />
        </nav>
      </div>
    </header>
  );
}

