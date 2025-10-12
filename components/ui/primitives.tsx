"use client";

import {
  forwardRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

import styles from "./ui.module.css";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClass: Record<ButtonVariant, string> = {
  primary: styles.buttonPrimary,
  secondary: styles.buttonSecondary,
  ghost: styles.buttonGhost,
  danger: styles.buttonDanger,
};

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(styles.buttonBase, variantClass[variant], className)}
      {...props}
    />
  );
});

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props },
  ref
) {
  return (
    <input ref={ref} className={cn(styles.inputControl, className)} {...props} />
  );
});

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(styles.inputControl, styles.textarea, className)}
        {...props}
      />
    );
  }
);

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, children, ...props },
  ref
) {
  return (
    <select
      ref={ref}
      className={cn(styles.inputControl, styles.select, className)}
      {...props}
    >
      {children}
    </select>
  );
});

interface LabelProps extends HTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function FieldLabel({
  children,
  className,
  required,
  ...props
}: LabelProps) {
  return (
    <label
      className={cn(styles.label, required && styles.labelRequired, className)}
      {...props}
    >
      {children}
    </label>
  );
}

type FieldTextProps = HTMLAttributes<HTMLParagraphElement>;

export function HelpText({ className, ...props }: FieldTextProps) {
  return <p className={cn(styles.helpText, className)} {...props} />;
}

export function ErrorText({ className, ...props }: FieldTextProps) {
  return <p className={cn(styles.errorText, className)} {...props} />;
}

type BadgeProps = HTMLAttributes<HTMLSpanElement>;

export function Badge({ className, ...props }: BadgeProps) {
  return <span className={cn(styles.badge, className)} {...props} />;
}

type SurfaceCardProps = HTMLAttributes<HTMLDivElement>;

export function SurfaceCard({ className, ...props }: SurfaceCardProps) {
  return <div className={cn(styles.surfaceCard, className)} {...props} />;
}

interface NavButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  icon?: ReactNode;
}

export function NavButton({
  className,
  active,
  icon,
  children,
  ...props
}: NavButtonProps) {
  return (
    <button
      type="button"
      data-active={active ? "true" : "false"}
      className={cn(styles.navButton, className)}
      {...props}
    >
      <span>{children}</span>
      {icon ? <span className={styles.navButtonIcon}>{icon}</span> : null}
    </button>
  );
}

type NavListProps = HTMLAttributes<HTMLUListElement>;

export function NavList({ className, ...props }: NavListProps) {
  return <ul className={cn(styles.navList, className)} {...props} />;
}

type NavListItemProps = HTMLAttributes<HTMLLIElement>;

export function NavListItem({ className, ...props }: NavListItemProps) {
  return <li className={className} {...props} />;
}

export interface ToastData {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  tone?: "default" | "success" | "error";
}

export type ToastPayload = Omit<ToastData, "id"> & { id?: string };

interface ToastStackProps {
  toasts: ToastData[];
  onDismiss?: (id: string) => void;
}

export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  if (toasts.length === 0) return null;

  return (
    <div className={styles.toastStack} role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={styles.toast}
          data-tone={toast.tone ?? "default"}
        >
          <div className={styles.toastHeader}>
            <div className={styles.toastTitle}>{toast.title}</div>
            {onDismiss ? (
              <span className={styles.toastActions}>
                <Button
                  type="button"
                  variant="ghost"
                  aria-label="Dismiss notification"
                  onClick={() => onDismiss(toast.id)}
                >
                  ×
                </Button>
              </span>
            ) : null}
          </div>
          {toast.description ? (
            <div className={styles.toastDescription}>{toast.description}</div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

type VisuallyHiddenProps = HTMLAttributes<HTMLSpanElement>;

export function VisuallyHidden({ className, ...props }: VisuallyHiddenProps) {
  return <span className={cn(styles.visuallyHidden, className)} {...props} />;
}
