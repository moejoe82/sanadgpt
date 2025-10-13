import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FormProps {
  children: ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
}

interface FormFieldProps {
  children: ReactNode;
  className?: string;
}

interface FormLabelProps {
  children: ReactNode;
  htmlFor?: string;
  className?: string;
}

interface FormErrorProps {
  children: ReactNode;
  className?: string;
}

/**
 * Form wrapper component
 * 
 * Handles consistent spacing between form fields,
 * error message styling, and label styling.
 */
export function Form({ children, onSubmit, className }: FormProps) {
  return (
    <form 
      onSubmit={onSubmit}
      className={cn("space-y-4", className)}
    >
      {children}
    </form>
  );
}

export function FormField({ children, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-1", className)}>
      {children}
    </div>
  );
}

export function FormLabel({ children, htmlFor, className }: FormLabelProps) {
  return (
    <label 
      htmlFor={htmlFor}
      className={cn(
        "block text-sm font-medium text-white",
        className
      )}
    >
      {children}
    </label>
  );
}

export function FormError({ children, className }: FormErrorProps) {
  return (
    <p 
      className={cn(
        "text-sm text-red-300",
        className
      )}
      role="alert"
    >
      {children}
    </p>
  );
}
