import { useRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useVirtualizer } from '@tanstack/react-virtual';
import { AlertTriangle, GripVertical, Plus, Trash2 } from 'lucide-react';
import type { Column } from '@/src/entities/column';
import type { Task } from '@/src/entities/task';
import { SortableTaskItem } from '@/src/features/drag-and-drop';
import { ColumnTitleEditor } from '@/src/features/manage-column';
import { cn } from '@/src/shared/lib';

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  totalStageTasksCount: number;
  isFinalStage: boolean;
  isDropTarget: boolean;
  columnDragHandleProps?: Record<string, unknown>;
  onAddTask: (columnId: string) => void;
  onEditTask: (task: Task) => void;
  onRequestDeleteColumn: (column: Column) => void;
}

export function KanbanColumn({
  column,
  tasks,
  totalStageTasksCount,
  isFinalStage,
  isDropTarget,
  columnDragHandleProps,
  onAddTask,
  onEditTask,
  onRequestDeleteColumn,
}: KanbanColumnProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      column,
    },
  });

  const virtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 130,
    overscan: 6,
    getItemKey: (index) => tasks[index]?.id ?? index,
  });

  const storyPointsSum = tasks.reduce((sum, t) => sum + t.estimate, 0);
  const isOverWip =
    column.wipLimit !== null && totalStageTasksCount > column.wipLimit;

  return (
    <section
      ref={setDroppableRef}
      aria-label={`Этап ${column.title}`}
      className={cn(
        'w-[320px] shrink-0 h-full flex flex-col rounded-xl bg-[#11151F] border transition-colors duration-150',
        isDropTarget
          ? 'border-indigo-500/80 bg-[#141A28]'
          : 'border-slate-800/90'
      )}
    >
      {/* Column Header */}
      <div className="px-3.5 py-3 border-b border-slate-800/80 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <button
            type="button"
            {...(columnDragHandleProps ?? {})}
            aria-label={`Переместить этап ${column.title}`}
            title="Перетащите для изменения порядка этапа"
            className="p-1 rounded text-slate-600 hover:text-slate-300 hover:bg-slate-800/80 cursor-grab active:cursor-grabbing shrink-0 transition-colors"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </button>

          <ColumnTitleEditor columnId={column.id} title={column.title} />
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span
            className={cn(
              'inline-flex items-center gap-1 text-xs font-mono tabular-nums px-1.5 py-0.5',
              isOverWip
                ? 'text-rose-400 font-semibold'
                : isFinalStage
                  ? 'text-emerald-400'
                  : 'text-slate-400'
            )}
            title={
              column.wipLimit !== null
                ? `Задач: ${totalStageTasksCount}, WIP-лимит: ${column.wipLimit}`
                : `Задач на этапе: ${totalStageTasksCount}`
            }
          >
            {isOverWip ? (
              <AlertTriangle className="w-3 h-3 shrink-0" aria-hidden="true" />
            ) : null}
            <span>
              {tasks.length}
              {column.wipLimit !== null ? `/${column.wipLimit}` : ''}
            </span>
          </span>

          <button
            type="button"
            onClick={() => onAddTask(column.id)}
            aria-label={`Добавить задачу в ${column.title}`}
            title="Добавить задачу в этот этап"
            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onRequestDeleteColumn(column)}
            aria-label={`Удалить этап ${column.title}`}
            title="Удалить этап"
            className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Subheader metadata strip: SP total & stage status */}
      <div className="px-3.5 py-1.5 border-b border-slate-800/50 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
        <span className="font-mono tabular-nums">{storyPointsSum} SP</span>
        <span>{isFinalStage ? 'Финальный этап' : `Этап ${column.order + 1}`}</span>
      </div>

      {/* Virtualized Task List */}
      <div
        ref={scrollContainerRef}
        className="flex-1 min-h-0 overflow-y-auto px-2.5 py-2.5"
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.length === 0 ? (
            <div className="h-32 rounded-lg border border-dashed border-slate-800/90 flex flex-col items-center justify-center p-4 text-center">
              <p className="text-xs text-slate-500">
                Нет задач на этом этапе
              </p>
              <button
                type="button"
                onClick={() => onAddTask(column.id)}
                className="mt-2 text-xs font-medium text-indigo-400 hover:text-indigo-300 cursor-pointer"
              >
                + Добавить задачу
              </button>
            </div>
          ) : (
            <div
              className="relative w-full"
              style={{ height: `${virtualizer.getTotalSize()}px` }}
            >
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const task = tasks[virtualRow.index];
                if (!task) return null;
                return (
                  <div
                    key={task.id}
                    data-index={virtualRow.index}
                    ref={virtualizer.measureElement}
                    className="absolute top-0 left-0 w-full pb-2.5"
                    style={{
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <SortableTaskItem task={task} onEdit={onEditTask} />
                  </div>
                );
              })}
            </div>
          )}
        </SortableContext>
      </div>
    </section>
  );
}
