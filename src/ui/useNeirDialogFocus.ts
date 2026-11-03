import { useEffect, useRef } from 'react';

/** Single keyboard/scroll/focus contract for all active NEIR Citizen dialog shells.
 * Geometry and content stay in each approved dialog component.
 */
type DialogConfig = {
  isOpen?: boolean;
  onClose: () => void;
  onEscape?: () => void;
  initialFocusSelector?: string;
};

const FOCUSABLE = [
  'button:not([disabled])', 'input:not([disabled])',
  'select:not([disabled])', 'textarea:not([disabled])',
  'a[href]', '[tabindex="0"]',
].join(', ');

export function useNeirDialogFocus<T extends HTMLElement>({
  isOpen = true, onClose, onEscape, initialFocusSelector,
}: DialogConfig) {
  const dialogRef = useRef<T>(null);
  const handlers = useRef({ onClose, onEscape, initialFocusSelector });
  handlers.current = { onClose, onEscape, initialFocusSelector };

  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement : null;
    const previouslyScrolled = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const root = dialogRef.current;
    const visibleControls = () => Array.from(root?.querySelectorAll<HTMLElement>(FOCUSABLE) || [])
      .filter(el => el.getClientRects().length > 0 &&
        !el.closest('[hidden], [aria-hidden="true"], [inert]'));
    const preferred = handlers.current.initialFocusSelector
      ? root?.querySelector<HTMLElement>(handlers.current.initialFocusSelector)
      : null;
    (preferred || visibleControls()[0] || root)?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        (handlers.current.onEscape || handlers.current.onClose)();
        return;
      }
      if (event.key !== 'Tab') return;
      const controls = visibleControls();
      if (!controls.length) {
        event.preventDefault();
        root?.focus();
        return;
      }
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && (document.activeElement === first ||
          !root?.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last ||
          !root?.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previouslyScrolled;
      previouslyFocused?.focus();
    };
  }, [isOpen]);

  return dialogRef;
}
