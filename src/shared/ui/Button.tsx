import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700 border border-indigo-500/40',
  secondary:
    'bg-[#181E2A] text-slate-200 hover:bg-[#1F2737] hover:text-white border border-slate-700/80',
  ghost:
    'bg-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent',
  danger:
    'bg-red-950/60 text-red-300 hover:bg-red-900/70 hover:text-red-100 border border-red-800/70',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0E14] disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
