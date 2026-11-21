import { useEffect, useRef, useState } from 'react';
import { Check, Pencil } from 'lucide-react';
import { useBoardMutations } from '@/src/entities/board';
import { columnTitleSchema } from '@/src/entities/column';

interface ColumnTitleEditorProps {
  columnId: string;
  title: string;
}

export function ColumnTitleEditor({ columnId, title }: ColumnTitleEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(title);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { renameColumnMutation } = useBoardMutations();

  useEffect(() => {
    setDraft(title);
  }, [title]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const commit = async () => {
    const result = columnTitleSchema.safeParse(draft);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Некорректное название');
      return;
    }
    setError(null);
    if (result.data !== title) {
      await renameColumnMutation.mutateAsync({
        columnId,
        title: result.data,
      });
    }
    setIsEditing(false);
  };

  const cancel = () => {
    setDraft(title);
    setError(null);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void commit();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                cancel();
              }
            }}
            onBlur={() => void commit()}
            aria-label="Редактировать название этапа"
            className="w-full rounded bg-[#0B0E14] border border-indigo-500 px-2 py-0.5 text-sm font-semibold text-slate-100 focus:outline-none"
          />
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              void commit();
            }}
            aria-label="Сохранить название"
            className="p-1 rounded text-emerald-400 hover:bg-slate-800 cursor-pointer shrink-0"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        </div>
        {error ? <p className="mt-1 text-[11px] text-rose-400">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 min-w-0 flex-1 group/title">
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        title="Нажмите, чтобы переименовать этап"
        className="text-left text-sm font-semibold text-slate-100 truncate hover:text-indigo-300 transition-colors cursor-pointer"
      >
        {title}
      </button>
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        aria-label={`Переименовать этап ${title}`}
        className="p-1 rounded text-slate-500 opacity-0 group-hover/title:opacity-100 focus:opacity-100 hover:text-slate-200 hover:bg-slate-800 transition-all cursor-pointer shrink-0"
      >
        <Pencil className="w-3 h-3" />
      </button>
    </div>
  );
}
