'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
}

type ParsedOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

function parseOptions(children: React.ReactNode): ParsedOption[] {
  const result: ParsedOption[] = [];

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;

    // Support <option> and <optgroup>...
    if (child.type === 'option') {
      const value = String((child.props as any).value ?? '');
      const label = String((child.props as any).children ?? '');
      result.push({ value, label, disabled: Boolean((child.props as any).disabled) });
      return;
    }

    if (child.type === 'optgroup') {
      const groupChildren = (child.props as any).children;
      React.Children.forEach(groupChildren, (opt) => {
        if (!React.isValidElement(opt) || opt.type !== 'option') return;
        const value = String((opt.props as any).value ?? '');
        const label = String((opt.props as any).children ?? '');
        result.push({ value, label, disabled: Boolean((opt.props as any).disabled) });
      });
    }
  });

  return result;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    const { value, defaultValue, onChange, disabled, name, id } = props;
    const options = React.useMemo(() => parseOptions(children), [children]);

    const [open, setOpen] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState<string>(
      typeof defaultValue === 'string' ? defaultValue : ''
    );

    const currentValue = typeof value === 'string' ? value : internalValue;
    const selectedLabel =
      options.find((o) => o.value === currentValue)?.label ??
      options.find((o) => o.value === '')?.label ??
      options[0]?.label ??
      '';

    const rootRef = React.useRef<HTMLDivElement>(null);
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const listRef = React.useRef<HTMLDivElement>(null);
    const optionRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

    const [highlightedIndex, setHighlightedIndex] = React.useState(() => {
      const idx = options.findIndex((o) => o.value === currentValue);
      return idx >= 0 ? idx : 0;
    });

    React.useEffect(() => {
      if (!open) return;
      const idx = options.findIndex((o) => o.value === currentValue);
      setHighlightedIndex(idx >= 0 ? idx : 0);
    }, [open, currentValue, options]);

    React.useEffect(() => {
      if (!open) return;
      const handler = (e: MouseEvent | TouchEvent) => {
        const target = e.target as Node | null;
        if (!target) return;
        if (rootRef.current && !rootRef.current.contains(target)) setOpen(false);
      };
      document.addEventListener('mousedown', handler);
      document.addEventListener('touchstart', handler);
      return () => {
        document.removeEventListener('mousedown', handler);
        document.removeEventListener('touchstart', handler);
      };
    }, [open]);

    React.useEffect(() => {
      if (!open) return;
      const btn = optionRefs.current[highlightedIndex];
      btn?.focus();
    }, [open, highlightedIndex]);

    const commitValue = (nextValue: string) => {
      if (disabled) return;
      if (typeof value !== 'string') setInternalValue(nextValue);
      setOpen(false);

      // Keep consumer API compatible: onChange(e) with e.target.value
      onChange?.({
        target: { value: nextValue, name, id },
        currentTarget: { value: nextValue, name, id },
      } as any);
      triggerRef.current?.focus();
    };

    const onTriggerKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setOpen(true);
        setHighlightedIndex((i) => Math.min(i + 1, Math.max(0, options.length - 1)));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setOpen(true);
        setHighlightedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    return (
      <div ref={rootRef} className="relative">
        {/* Keep a real <select> in the DOM for forms/accessibility, but hide it. */}
        <select
          ref={ref}
          tabIndex={-1}
          aria-hidden
          className="hidden"
          name={name}
          id={id}
          disabled={disabled}
          value={currentValue}
          onChange={(e) => commitValue(e.target.value)}
        >
          {children}
        </select>

        <button
          ref={triggerRef}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => !disabled && setOpen((v) => !v)}
          onKeyDown={onTriggerKeyDown}
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
        >
          <span className="min-w-0 flex-1 truncate text-right">{selectedLabel}</span>
          <ChevronDown className="ml-2 h-4 w-4 opacity-60" />
        </button>

        {open ? (
          <div
            ref={listRef}
            role="listbox"
            className="absolute z-50 mt-1 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-sm max-h-64"
          >
            {options.map((opt, idx) => {
              const isSelected = opt.value === currentValue;
              const isDisabled = Boolean(opt.disabled);

              return (
                <button
                  key={`${opt.value}-${idx}`}
                  ref={(el) => {
                    optionRefs.current[idx] = el;
                  }}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={isDisabled}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  onClick={() => !isDisabled && commitValue(opt.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      setOpen(false);
                      triggerRef.current?.focus();
                      return;
                    }
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setHighlightedIndex((i) => Math.min(i + 1, options.length - 1));
                      return;
                    }
                    if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setHighlightedIndex((i) => Math.max(i - 1, 0));
                      return;
                    }
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (!isDisabled) commitValue(opt.value);
                    }
                  }}
                  className={cn(
                    'flex w-full items-center justify-between px-3 py-2 text-sm',
                    'text-right',
                    isSelected ? 'bg-accent' : 'hover:bg-accent',
                    idx === highlightedIndex ? 'bg-accent' : '',
                    isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                  )}
                >
                  <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    );
  }
);
Select.displayName = 'Select';

export { Select };
