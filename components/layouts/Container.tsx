import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { containerSizes } from "@/lib/theme";

interface ContainerProps {
  children: ReactNode;
  size?: keyof typeof containerSizes;
  className?: string;
}

/**
 * Content container component
 * 
 * Provides consistent max-width and responsive padding.
 * Replaces all hardcoded container widths and padding.
 */
export default function Container({ 
  children, 
  size = "lg", 
  className 
}: ContainerProps) {
  const maxWidth = containerSizes[size];
  
  return (
    <div 
      className={cn(
        "mx-auto w-full",
        size === "full" ? "max-w-none" : `max-w-[${maxWidth}]`,
        "px-4 sm:px-6 lg:px-8",
        className
      )}
    >
      {children}
    </div>
  );
}
