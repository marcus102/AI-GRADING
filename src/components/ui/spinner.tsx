import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Spinner({ className, size = "md" }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", // Adjusted default size to be slightly smaller
    lg: "h-10 w-10",
  };
  return (
    <Loader2
      className={cn("animate-spin text-primary", sizeClasses[size], className)}
      aria-label="Loading..."
    />
  );
}
