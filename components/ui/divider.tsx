import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DividerProps {
  children?: ReactNode;
  className?: string;
  variant?: "dark" | "brand";
}

const dividerVariants = {
  dark: {
    line: "border-white/20",
    label: "bg-slate-800 text-slate-300",
  },
  brand: {
    line: "border-[#e8dcff]/60",
    label:
      "bg-[#fdfbf1]/80 text-[#5b2f86] border border-[#e1d3ff]/60 rounded-full px-3 py-0.5 text-xs font-medium shadow-sm",
  },
};

/**
 * Divider component for "Or" separators in auth pages
 * 
 * Provides consistent styling for dividers between form sections.
 */
export default function Divider({
  children,
  className,
  variant = "dark",
}: DividerProps) {
  const styles = dividerVariants[variant];

  return (
    <div className={cn("relative py-2", className)}>
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className={cn("w-full border-t", styles.line)} />
      </div>
      {children && (
        <div className="relative flex justify-center">
          <span className={cn("px-2 text-xs", styles.label)}>{children}</span>
        </div>
      )}
    </div>
  );
}
