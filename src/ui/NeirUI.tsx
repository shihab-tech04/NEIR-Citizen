import React, { forwardRef, useId, useMemo, useState } from 'react';
import type { ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode, TableHTMLAttributes } from 'react';
import { NeirModalFrame } from '../components/NeirModalFrame.tsx';

/** NEIR Citizen's shared, accessible controls. Business logic belongs to screens. */
const classes = (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(' ');

export type UiButtonVariant = 'primary' | 'secondary' | 'quiet' | 'danger';
export type UiButtonSize = 'default' | 'compact';

export type UiButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: UiButtonVariant;
  size?: UiButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
};
export const UiButton = forwardRef<HTMLButtonElement, UiButtonProps>(function UiButton({
  variant = 'secondary', size = 'default', fullWidth = false, loading = false,
  className, children, disabled, type = 'button', ...rest
}, ref) {
  return <button {...rest} ref={ref} type={type} disabled={disabled || loading}
    aria-busy={loading || undefined}
    className={classes('neir-ui-button', 'neir-ui-button--' + variant,
      size === 'compact' && 'neir-ui-button--compact',
      fullWidth && 'neir-ui-button--full', className)}>
    {children}
  </button>;
});

export type UiInputProps = InputHTMLAttributes<HTMLInputElement> & { uiSize?: 'default' | 'compact' };
export const UiInput = forwardRef<HTMLInputElement, UiInputProps>(function UiInput({ className, uiSize = 'default', ...rest }, ref) {
  return <input {...rest} ref={ref} className={classes('neir-ui-control', uiSize === 'compact' && 'neir-ui-control--compact', className)} />;
});

export type UiSelectProps = SelectHTMLAttributes<HTMLSelectElement> & { uiSize?: 'default' | 'compact' };
export const UiSelect = forwardRef<HTMLSelectElement, UiSelectProps>(function UiSelect({ className, uiSize = 'default', children, ...rest }, ref) {
  return <select {...rest} ref={ref} className={classes('neir-ui-control', uiSize === 'compact' && 'neir-ui-control--compact', className)}>{children}</select>;
});

export type UiTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;
export const UiTextarea = forwardRef<HTMLTextAreaElement, UiTextareaProps>(function UiTextarea({ className, ...rest }, ref) {
  return <textarea {...rest} ref={ref} className={classes('neir-ui-control', 'neir-ui-textarea', className)} />;
});

export function UiField({ id, label, required = false, hint, error, children, className }: {
  id: string; label: ReactNode; required?: boolean; hint?: ReactNode; error?: ReactNode;
  children: ReactNode; className?: string;
}) {
  return <div className={classes('neir-ui-field', className)}>
    <label htmlFor={id} className="neir-ui-field-label">{label}{required && <span className="neir-ui-required" aria-hidden="true"> *</span>}</label>
    {children}
    {hint && <p className="neir-ui-field-hint">{hint}</p>}
    {error && <p role="alert" className="neir-ui-field-error">{error}</p>}
  </div>;
}

export const UiStatusBadge: React.FC<{ tone?: 'success' | 'warning' | 'danger' | 'neutral' | 'info'; children: ReactNode; className?: string }> = ({
  tone = 'neutral', children, className,
}) => <span className={classes('neir-ui-status', 'neir-ui-status--' + tone, className)}>{children}</span>;

export type UiColumn<Row> = {
  key: string;
  heading: ReactNode;
  render: (row: Row, index: number) => ReactNode;
  numeric?: boolean;
  sortValue?: (row: Row) => string | number;
};
export type UiDataTableProps<Row> = Omit<TableHTMLAttributes<HTMLTableElement>, 'children'> & {
  rows: readonly Row[];
  columns: readonly UiColumn<Row>[];
  rowKey: (row: Row) => string | number;
  onRowClick?: (row: Row) => void;
  rowLabel?: (row: Row) => string;
  scrollClassName?: string;
  searchable?: (row: Row, query: string) => boolean;
  searchPlaceholder?: string;
  emptyText?: string;
  /** Admin-parity mobile record-card view; desktop retains the existing table. */
  renderMobileCard?: (row: Row, index: number) => ReactNode;
};

/** Shared table: inline search, optional quick sort, numeric alignment, row detail and keyboard support. */
export function UiDataTable<Row>({
  rows, columns, rowKey, onRowClick, rowLabel, scrollClassName, searchable,
  searchPlaceholder = 'Search table', emptyText = 'No records found', renderMobileCard,
  className, ...tableProps
}: UiDataTableProps<Row>) {
  const searchId = useId();
  const [query, setQuery] = useState('');
  const [sorting, setSorting] = useState<{ key: string; ascending: boolean } | null>(null);
  const visibleRows = useMemo(() => {
    const filtered = searchable && query.trim() ? rows.filter(row => searchable(row, query.trim().toLowerCase())) : [...rows];
    const column = columns.find(item => item.key === sorting?.key && item.sortValue);
    if (!column?.sortValue || !sorting) return filtered;
    const getter = column.sortValue;
    return [...filtered].sort((a, b) => {
      const av = getter(a), bv = getter(b);
      const result = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sorting.ascending ? result : -result;
    });
  }, [rows, columns, searchable, query, sorting]);
  return <div className="neir-ui-table-container">
    {searchable && <div className="neir-ui-table-tools">
      <label htmlFor={searchId} className="neir-ui-table-search-label">Search
        <UiInput id={searchId} uiSize="compact" type="search" value={query} placeholder={searchPlaceholder}
          onChange={event => setQuery(event.target.value)} />
      </label>
      <span className="neir-ui-table-count" role="status">{visibleRows.length} {visibleRows.length === 1 ? 'record' : 'records'}</span>
    </div>}
    {renderMobileCard && <div className="neir-ui-mobile-record-stack" aria-label="Application records">
      {visibleRows.length ? visibleRows.map((row, index) => <div key={rowKey(row)}
        className={classes('neir-ui-mobile-record', onRowClick && 'neir-ui-mobile-record--interactive')}
        role={onRowClick ? 'button' : undefined}
        tabIndex={onRowClick ? 0 : undefined}
        aria-label={onRowClick ? (rowLabel?.(row) ?? 'View record details') : undefined}
        onClick={onRowClick ? event => {
          const target=event.target as HTMLElement;
          if (target.closest('button, a, input, select, textarea, [role="button"], [role="checkbox"], [role="link"]')) return;
          onRowClick(row);
        } : undefined}
        onKeyDown={onRowClick ? event => {
          if (event.target !== event.currentTarget) return;
          if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onRowClick(row); }
        } : undefined}>
        {renderMobileCard(row, index)}
      </div>) : <p className="neir-ui-mobile-record-empty" role="status">{emptyText}</p>}
    </div>}
    <div className={classes('neir-ui-table-scroll', renderMobileCard && 'neir-ui-table-scroll--desktop', scrollClassName)}>
      <table {...tableProps} className={classes('neir-ui-table', className)}>
        <thead><tr>{columns.map(col => <th key={col.key} scope="col" className={col.numeric ? 'neir-ui-numeric' : undefined}
          aria-sort={sorting?.key === col.key ? (sorting.ascending ? 'ascending' : 'descending') : col.sortValue ? 'none' : undefined}>
          {col.sortValue ? <button type="button" className="neir-ui-table-sort" onClick={() => setSorting(current => ({
            key: col.key, ascending: current?.key === col.key ? !current.ascending : true,
          }))} aria-label={'Sort by ' + (typeof col.heading === 'string' ? col.heading : col.key)}>
            {col.heading}<span aria-hidden="true">{sorting?.key === col.key ? (sorting.ascending ? ' ↑' : ' ↓') : ' ↕'}</span>
          </button> : col.heading}
        </th>)}</tr></thead>
        <tbody>{visibleRows.length ? visibleRows.map((row, index) =>
          <tr key={rowKey(row)} className={onRowClick ? 'neir-ui-row-action' : undefined}
            tabIndex={onRowClick ? 0 : undefined}
            aria-label={onRowClick ? (rowLabel?.(row) ?? 'View record details') : undefined}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            onKeyDown={onRowClick ? event => {
              if (event.target !== event.currentTarget) return;
              if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onRowClick(row); }
            } : undefined}>
            {columns.map(col => <td key={col.key} className={col.numeric ? 'neir-ui-numeric' : undefined}>{col.render(row, index)}</td>)}
          </tr>) : <tr><td className="neir-ui-table-empty" colSpan={columns.length}>{emptyText}</td></tr>}</tbody>
      </table>
    </div>
  </div>;
}

/** Existing accessible shared modal shell is the library's canonical dialog. */
export const UiDialog = NeirModalFrame;
