import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '../lib';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label ? (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-slate-300"
          >
            {label}
          </label>
        ) : null}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-lg bg-[#0F131C] border px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/70 resize-none',
            error
              ? 'border-red-500/70 focus:border-red-400'
              : 'border-slate-800 hover:border-slate-700 focus:border-indigo-500',
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-xs text-red-400" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
