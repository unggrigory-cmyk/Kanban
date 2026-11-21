import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '../lib';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, id, children, ...props }, ref) => {
    const selectId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label ? (
          <label
            htmlFor={selectId}
            className="text-xs font-medium text-slate-300"
          >
            {label}
          </label>
        ) : null}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full rounded-lg bg-[#0F131C] border px-3 py-2 text-sm text-slate-100 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/70',
            error
              ? 'border-red-500/70 focus:border-red-400'
              : 'border-slate-800 hover:border-slate-700 focus:border-indigo-500',
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error ? (
          <p className="text-xs text-red-400" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
