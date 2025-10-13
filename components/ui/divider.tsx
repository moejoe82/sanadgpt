import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DividerProps {
  children?: ReactNode;
  className?: string;
}

/**
 * Divider component for "Or" separators in auth pages
 * 
 * Provides consistent styling for dividers between form sections.
 */
export default function Divider({ children, className }: DividerProps) {
  return (
    <div className={cn("relative py-2", className)}>
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-white/20" />
      </div>
      {children && (
        <div className="relative flex justify-center">
          <span className="bg-slate-800 px-2 text-xs text-slate-300">
            {children}
          </span>
        </div>
      )}
    </div>
  );
}
