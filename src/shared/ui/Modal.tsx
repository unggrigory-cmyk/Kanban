import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  maxWidthClass?: string;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  maxWidthClass = 'max-w-lg',
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
    >
      <div
        className={cn(
          'w-full rounded-xl bg-[#131823] border border-slate-800 shadow-2xl shadow-black/60 overflow-hidden',
          maxWidthClass
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-slate-800/80">
          <div className="min-w-0">
            <h2
              id="modal-title"
              className="text-base font-semibold text-slate-100 tracking-tight"
            >
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-xs text-slate-400">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть окно"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
