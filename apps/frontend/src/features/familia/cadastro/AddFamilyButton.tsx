import { useCallback, useRef, useState } from "react";
import { cadastroStrings } from "./strings";
import type { ChildProfile } from "./types";
import { FamilyFormModal } from "./FamilyFormModal";

type AddFamilyButtonProps = {
  className?: string;
  onCreated?: (profile: ChildProfile) => void;
};

export function AddFamilyButton({ className, onCreated }: AddFamilyButtonProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
  }, []);

  const handleSuccess = useCallback(
    (profile: ChildProfile) => {
      onCreated?.(profile);
      setOpen(false);
    },
    [onCreated],
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        className={
          className ??
          "inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        }
        aria-label={cadastroStrings.addButton.ariaLabel}
      >
        <span aria-hidden>＋</span>
        <span>{cadastroStrings.addButton.label}</span>
      </button>
      <FamilyFormModal open={open} onOpenChange={handleOpenChange} onSuccess={handleSuccess} returnFocusRef={triggerRef} />
    </>
  );
}
