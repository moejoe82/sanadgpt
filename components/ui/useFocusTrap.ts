"use client";

import { useEffect } from "react";

const FOCUSABLE = [
  'a[href]:not([tabindex="-1"]):not([inert])',
  'button:not([disabled]):not([tabindex="-1"]):not([inert])',
  'input:not([disabled]):not([tabindex="-1"]):not([inert])',
  'select:not([disabled]):not([tabindex="-1"]):not([inert])',
  'textarea:not([disabled]):not([tabindex="-1"]):not([inert])',
  '[tabindex]:not([tabindex="-1"]):not([inert])',
].join(",");

interface Options {
  onEscape?: () => void;
}

export function useFocusTrap(
  active: boolean,
  container: React.RefObject<HTMLElement | null>,
  options?: Options
) {
  const onEscape = options?.onEscape;

  useEffect(() => {
    if (!active) return;
    const node = container.current;
    if (!node) return;
    const trapNode: HTMLElement = node;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusable = Array.from(
      node.querySelectorAll<HTMLElement>(FOCUSABLE)
    ).filter((el) => !el.hasAttribute("data-focus-guard"));

    if (focusable.length > 0) {
      focusable[0].focus({ preventScroll: true });
    } else if (node.tabIndex >= 0) {
      node.focus({ preventScroll: true });
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onEscape?.();
        return;
      }

      if (event.key !== "Tab") return;
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeElement = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (
          activeElement === first ||
          !activeElement ||
          !trapNode.contains(activeElement)
        ) {
          event.preventDefault();
          last.focus({ preventScroll: true });
        }
      } else {
        if (activeElement === last) {
          event.preventDefault();
          first.focus({ preventScroll: true });
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocused && previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [active, container, onEscape]);
}
