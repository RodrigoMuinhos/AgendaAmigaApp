import { createPortal } from "react-dom";
import { useEffect, useRef } from "react";
import { cadastroStrings } from "./strings";
import type { ChildProfile } from "./types";
import { FamilyForm } from "./FamilyForm";

type FamilyFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (profile: ChildProfile) => void;
  returnFocusRef?: React.RefObject<HTMLElement>;
};

export function FamilyFormModal({ open, onOpenChange, onSuccess, returnFocusRef }: FamilyFormModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusTarget = closeButtonRef.current ?? dialogRef.current;
    focusTarget?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onOpenChange(false);
      }
      if (event.key === "Tab" && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((element) => !element.hasAttribute("disabled"));
        if (focusable.length === 0) {
          event.preventDefault();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        } else if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (returnFocusRef?.current) {
        returnFocusRef.current.focus();
      } else {
        previouslyFocused?.focus();
      }
    };
  }, [open, onOpenChange, returnFocusRef]);

  useEffect(() => {
    if (open) {
      document.documentElement.style.overflow = "hidden";
      return () => {
        document.documentElement.style.overflow = "";
      };
    }
    return undefined;
  }, [open]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="family-form-title"
        aria-describedby="family-form-description"
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-border/40 bg-background shadow-elevated"
      >
        <div className="flex items-start justify-between gap-3 border-b border-border/60 bg-background/90 px-6 py-5">
          <div>
            <h2 id="family-form-title" className="text-xl font-semibold text-foreground">
              {cadastroStrings.modal.title}
            </h2>
            <p id="family-form-description" className="text-sm text-muted">
              {cadastroStrings.modal.description}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-full border border-border/70 bg-background/80 p-2 text-muted transition hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            aria-label={cadastroStrings.modal.closeLabel}
          >
            <span aria-hidden>×</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <FamilyForm onCancel={() => onOpenChange(false)} onSuccess={onSuccess} />
        </div>
      </div>
    </div>,
    document.body,
  );
}
