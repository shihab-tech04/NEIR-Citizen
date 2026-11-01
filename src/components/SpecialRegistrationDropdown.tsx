import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';

export type NeirDropdownOption = { value: string; label: string };

type Props = {
  id: string;
  label: string;
  value: string;
  options: NeirDropdownOption[];
  onChange: (value: string) => void;
  error?: string;
  portalRoot: React.RefObject<HTMLDivElement | null>;
};

type PopupRect = { left: number; top: number; width: number; maxHeight: number };

export const SpecialRegistrationDropdown: React.FC<Props> = ({
  id, label, value, options, onChange, error, portalRoot,
}) => {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [popupRect, setPopupRect] = useState<PopupRect | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const selected = options.findIndex(option => option.value === value);
  const display = selected >= 0 ? options[selected].label : options[0]?.label || 'Select an option';
  const labelId = id + '-label';
  const listId = id + '-options';

  const positionMenu = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const verticalMargin = 12;
    const desiredHeight = Math.min(296, options.length * 52 + 12);
    const below = window.innerHeight - rect.bottom - verticalMargin;
    const above = rect.top - verticalMargin;
    const abovePreferred = below < Math.min(desiredHeight, 175) && above > below;
    const available = Math.max(96, (abovePreferred ? above : below) - 8);
    const maxHeight = Math.min(desiredHeight, available);
    const top = abovePreferred ? Math.max(8, rect.top - maxHeight - 6) : rect.bottom + 6;
    setPopupRect({
      left: Math.max(8, rect.left),
      top,
      width: Math.min(rect.width, window.innerWidth - Math.max(8, rect.left) - 8),
      maxHeight,
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    positionMenu();
    window.addEventListener('resize', positionMenu);
    document.addEventListener('scroll', positionMenu, true);
    return () => {
      window.removeEventListener('resize', positionMenu);
      document.removeEventListener('scroll', positionMenu, true);
    };
  }, [open, options.length]);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', closeOnOutsidePointer, true);
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer, true);
  }, [open]);

  useEffect(() => {
    if (open) menuRef.current?.querySelector('[data-neir-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, open]);

  const openMenu = () => {
    setActiveIndex(Math.max(0, selected));
    setOpen(true);
  };
  const choose = (index: number) => {
    const choice = options[index];
    if (!choice) return;
    onChange(choice.value);
    setOpen(false);
    triggerRef.current?.focus();
  };
  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault();
        if (!open) { openMenu(); return; }
        setActiveIndex(current => (current + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length);
        return;
      }
      case 'Home':
      case 'End':
        event.preventDefault();
        if (!open) openMenu();
        setActiveIndex(event.key === 'Home' ? 0 : options.length - 1);
        return;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (open) choose(activeIndex);
        else openMenu();
        return;
      case 'Escape':
        if (open) {
          event.preventDefault();
          event.stopPropagation();
          setOpen(false);
        }
        return;
      case 'Tab':
        setOpen(false);
        return;
    }
  };

  return (
    <div className={'neir-sr-field neir-sr-dropdown' + (open ? ' neir-sr-dropdown-open' : '')} ref={rootRef}>
      <span id={labelId} className="neir-sr-label">{label}</span>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-labelledby={labelId}
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? id + '-option-' + activeIndex : undefined}
        aria-invalid={!!error}
        aria-describedby={error ? id + '-error' : undefined}
        className="neir-sr-control neir-sr-dropdown-trigger"
        title={display}
        onClick={() => open ? setOpen(false) : openMenu()}
        onKeyDown={onKeyDown}
      >
        <span className={'neir-sr-dropdown-value' + (!value ? ' neir-sr-dropdown-placeholder' : '')}>{display}</span>
        <ChevronDown className={'neir-sr-dropdown-chevron' + (open ? ' neir-sr-dropdown-chevron-open' : '')} size={18} aria-hidden="true" />
      </button>
      {error && <span className="neir-sr-error" id={id + '-error'} role="alert">{error}</span>}
      {open && portalRoot.current && createPortal(
        <div
          ref={menuRef}
          id={listId}
          role="listbox"
          aria-labelledby={labelId}
          className="neir-sr-dropdown-popup"
          style={popupRect || { visibility: 'hidden' }}
        >
          {options.map((option, index) => (
            <button
              key={option.value}
              id={id + '-option-' + index}
              type="button"
              role="option"
              tabIndex={-1}
              aria-selected={option.value === value}
              data-neir-active={activeIndex === index}
              className={'neir-sr-dropdown-option' + (activeIndex === index ? ' neir-sr-dropdown-option-active' : '')}
              onPointerEnter={() => setActiveIndex(index)}
              onClick={() => choose(index)}
            >
              <span>{option.label}</span>
              {option.value === value && <Check size={19} strokeWidth={2.5} aria-hidden="true" />}
            </button>
          ))}
        </div>,
        portalRoot.current,
      )}
    </div>
  );
};
