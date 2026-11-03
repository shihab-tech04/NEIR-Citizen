import React from 'react';
import { X } from 'lucide-react';
import { useNeirDialogFocus } from '../ui/useNeirDialogFocus.ts';

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

/** Canonical NEIR modal shell: approved geometry, consistent header and footer,
 * single reusable focus/keyboard/scroll hook; content remains screen-owned. */
export const NeirModalFrame: React.FC<NeirModalFrameProps> = ({
  title, ariaLabel, onClose, children, footer, size = 'medium',
  role = 'dialog', closeLabel = 'Close dialog',
}) => {
  const dialogRef = useNeirDialogFocus<HTMLDivElement>({
    onClose, initialFocusSelector: '.neir-shared-close',
  });
  const sizeClass = size === 'compact' ? ' neir-shared-dialog--compact' :
    size === 'medium' ? ' neir-shared-dialog--medium' : '';
  return (
    <div className="neir-shared-backdrop neir-modal-backdrop" onMouseDown={event => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <div className={'neir-shared-dialog neir-modal-surface' + sizeClass} role={role}
        aria-modal="true" aria-label={ariaLabel} ref={dialogRef} tabIndex={-1}>
        <header className="neir-shared-header">
          <h2>{title}</h2>
          <button type="button" className="neir-shared-close"
            aria-label={closeLabel} onClick={onClose}>
            <X size={24} strokeWidth={1.7} aria-hidden="true" />
          </button>
        </header>
        <div className="neir-shared-body">{children}</div>
        {footer && <footer className="neir-shared-footer">{footer}</footer>}
      </div>
    </div>
  );
};
