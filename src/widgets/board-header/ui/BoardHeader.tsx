import { Plus, RotateCcw } from 'lucide-react';
import { cn } from '@/src/shared/lib';
import { Button } from '@/src/shared/ui';

export type BoardViewMode = 'board' | 'analytics';

interface BoardHeaderProps {
  activeView: BoardViewMode;
  onChangeView: (view: BoardViewMode) => void;
  onOpenCreateTask: () => void;
  onResetBoard: () => void;
}

export function BoardHeader({
  activeView,
  onChangeView,
  onOpenCreateTask,
  onResetBoard,
}: BoardHeaderProps) {
  return (
    <header className="h-14 shrink-0 px-4 sm:px-6 border-b border-slate-800/80 bg-[#0D1119] flex items-center justify-between gap-8">
      <div className="flex items-center gap-8 min-w-0">
        <a
          href="#board"
          onClick={(e) => {
            e.preventDefault();
            onChangeView('board');
          }}
          className="text-base font-bold tracking-tight text-slate-100 whitespace-nowrap shrink-0"
        >
          Поток
        </a>

        <nav className="flex items-center gap-6" aria-label="Разделы рабочей области">
          <button
            type="button"
            onClick={() => onChangeView('board')}
            className={cn(
              'py-4 text-sm font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors duration-150 cursor-pointer',
              activeView === 'board'
                ? 'border-indigo-500 text-slate-100'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            )}
          >
            Канбан-доска
          </button>
          <button
            type="button"
            onClick={() => onChangeView('analytics')}
            className={cn(
              'py-4 text-sm font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors duration-150 cursor-pointer',
              activeView === 'analytics'
                ? 'border-indigo-500 text-slate-100'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            )}
          >
            Аналитика воронки
          </button>
        </nav>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onResetBoard}
          title="Восстановить демонстрационные данные доски"
          className="hidden sm:inline-flex text-slate-400"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Сбросить демо</span>
        </Button>
        <Button size="sm" onClick={onOpenCreateTask}>
          <Plus className="w-4 h-4" />
          <span>Новая задача</span>
        </Button>
      </div>
    </header>
  );
}
