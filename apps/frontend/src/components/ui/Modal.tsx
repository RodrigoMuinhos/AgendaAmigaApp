import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './button';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  closeLabel?: string;
  showCloseButton?: boolean;
};

const MODAL_ROOT_ID = 'modal-root';

function ensureModalRoot() {
  if (typeof document === 'undefined') return null;
  let root = document.getElementById(MODAL_ROOT_ID);
  if (!root) {
    root = document.createElement('div');
    root.setAttribute('id', MODAL_ROOT_ID);
    document.body.appendChild(root);
  }
  return root;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  closeLabel = 'Fechar',
  showCloseButton = true,
}: ModalProps) {
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
      if (event.key === 'Tab' && contentRef.current) {
        const focusableElements = contentRef.current.querySelectorAll<HTMLElement>(
          'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])',
        );
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          last.focus();
          event.preventDefault();
        } else if (!event.shiftKey && document.activeElement === last) {
          first.focus();
          event.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const previouslyFocused = document.activeElement as HTMLElement | null;

    requestAnimationFrame(() => {
      const manualSelection =
        contentRef.current?.querySelector<HTMLElement>('[data-modal-initial-focus]');
      if (manualSelection) {
        manualSelection.focus();
        return;
      }
      const autoFocusTarget = contentRef.current?.querySelector<HTMLElement>(
        'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])',
      );
      autoFocusTarget?.focus();
    });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  const root = ensureModalRoot();
  if (!root) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={description ? 'modal-description' : undefined}
        className="w-full max-w-xl rounded-3xl bg-[rgb(var(--color-surface))] p-6 shadow-elevated focus:outline-none"
      >
        <header className="mb-4 space-y-2">
          <h2 id="modal-title" className="text-2xl font-semibold text-[rgb(var(--color-text))]">
            {title}
          </h2>
          {description ? (
            <p id="modal-description" className="text-sm text-[rgba(var(--color-text),0.7)]">
              {description}
            </p>
          ) : null}
        </header>
        <div className="space-y-4">{children}</div>
        {showCloseButton ? (
          <footer className="mt-6 flex justify-end">
            <Button variant="ghost" onClick={onClose} data-modal-initial-focus>
              {closeLabel}
            </Button>
          </footer>
        ) : null}
      </div>
    </div>,
    root,
  );
}
