"use client";

import { useEffect } from "react";

import {
  Toast,
  ToastAction,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.style.setProperty(
      "color-scheme",
      document.documentElement.dataset.theme === "dark" ? "dark" : "light"
    );
  }, [toasts]);

  return (
    <ToastProvider swipeDirection="right">
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast
            key={id}
            onOpenChange={(open) => !open && dismiss(id)}
            {...props}
          >
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action && <ToastAction altText="Action">{action}</ToastAction>}
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
