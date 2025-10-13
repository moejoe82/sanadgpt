import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { layoutVariants } from "@/lib/theme";

interface BackgroundProps {
  children: ReactNode;
  variant?: keyof typeof layoutVariants;
  className?: string;
}

/**
 * Background system component
 * 
 * Handles full-screen backgrounds consistently.
 * Eliminates all inline gradient definitions.
 */
export default function Background({ 
  children, 
  variant = "default", 
  className 
}: BackgroundProps) {
  return (
    <div 
      className={cn(
        "min-h-screen",
        layoutVariants[variant],
        className
      )}
    >
      {children}
    </div>
  );
}
