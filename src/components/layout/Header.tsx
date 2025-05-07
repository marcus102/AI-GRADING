import { GraduationCap } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center">
        <GraduationCap className="h-8 w-8 text-primary mr-3" />
        <h1 className="text-3xl font-bold text-foreground">
          Grade<span className="text-primary">Wise</span>
        </h1>
      </div>
    </header>
  );
}
