import { Search, X } from 'lucide-react';
import { cn } from '@/src/shared/lib';
import { type PriorityFilterValue, useTaskFilterStore } from '../model/useFilterStore';

const FILTER_TABS: Array<{ value: PriorityFilterValue; label: string }> = [
  { value: 'all', label: 'Все' },
  { value: 'critical', label: 'Критичные' },
  { value: 'high', label: 'Высокие' },
  { value: 'medium', label: 'Средние' },
  { value: 'low', label: 'Низкие' },
];

export function TaskFilterToolbar() {
  const searchQuery = useTaskFilterStore((s) => s.searchQuery);
  const priorityFilter = useTaskFilterStore((s) => s.priorityFilter);
  const setSearchQuery = useTaskFilterStore((s) => s.setSearchQuery);
  const setPriorityFilter = useTaskFilterStore((s) => s.setPriorityFilter);
  const resetFilters = useTaskFilterStore((s) => s.resetFilters);

  const hasActiveFilter = searchQuery.trim().length > 0 || priorityFilter !== 'all';

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="relative flex-1 min-w-[220px] max-w-sm">
        <Search
          className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Поиск по названию, описанию, исполнителю..."
          aria-label="Поиск задач"
          className="w-full rounded-lg bg-[#121620] border border-slate-800 pl-9 pr-8 py-1.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/60 transition-colors"
        />
        {searchQuery ? (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            aria-label="Очистить поиск"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div
          className="flex items-center gap-1 p-1 rounded-lg bg-[#121620] border border-slate-800/90"
          role="tablist"
          aria-label="Фильтр по приоритету"
        >
          {FILTER_TABS.map((tab) => {
            const active = priorityFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setPriorityFilter(tab.value)}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer',
                  active
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {hasActiveFilter ? (
          <button
            type="button"
            onClick={resetFilters}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-100 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            Сбросить
          </button>
        ) : null}
      </div>
    </div>
  );
}
