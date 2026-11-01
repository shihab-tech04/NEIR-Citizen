import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

type NeirModalFrameProps = {
  title: string;
  ariaLabel: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'compact' | 'medium' | 'regular';
  role?: 'dialog' | 'alertdialog';
  closeLabel?: string;
};

/** Shared frame for NEIR Citizen dialogs. Mirrors approved Special Registration
 * shell without changing the form, navigation or business logic of each dialog.
 * Traps keyboard focus, restores focus on close and locks background scroll. */
export const NeirModalFrame: React.FC<NeirModalFrameProps> = ({
  title, ariaLabel, onClose, children, footer, size = 'medium',
  role = 'dialog', closeLabel = 'Close dialog',
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const latestOnClose = useRef(onClose);
  latestOnClose.current = onClose;

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        latestOnClose.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const elements = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]'
      );
      if (!elements?.length) return;
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      previousFocus?.focus();
    };
  }, []);

  const sizeClass = size === 'compact' ? ' neir-shared-dialog--compact' :
    size === 'medium' ? ' neir-shared-dialog--medium' : '';
  return (
    <div className="neir-shared-backdrop" onMouseDown={event => {
      if (event.target === event.currentTarget) latestOnClose.current();
    }}>
      <div className={'neir-shared-dialog' + sizeClass} role={role}
        aria-modal="true" aria-label={ariaLabel} ref={dialogRef}>
        <header className="neir-shared-header">
          <h2>{title}</h2>
          <button ref={closeRef} type="button" className="neir-shared-close"
            aria-label={closeLabel} onClick={() => latestOnClose.current()}>
            <X size={24} strokeWidth={1.7} aria-hidden="true" />
          </button>
        </header>
        <div className="neir-shared-body">{children}</div>
        {footer && <footer className="neir-shared-footer">{footer}</footer>}
      </div>
    </div>
  );
};
