import { AlertTriangle, ArrowDown, ArrowUp, GripVertical, Minus, Pencil } from 'lucide-react';
import { cn, formatShortDate, isDateOverdue } from '@/src/shared/lib';
import { PRIORITY_META } from '../lib/priority';
import type { Task, TaskPriority } from '../model/types';

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  isOverlay?: boolean;
  onEdit?: (task: Task) => void;
  dragHandleProps?: Record<string, unknown>;
}

function PriorityIcon({ priority, className }: { priority: TaskPriority; className?: string }) {
  switch (priority) {
    case 'critical':
      return <AlertTriangle className={cn('w-3.5 h-3.5 shrink-0', className)} aria-hidden="true" />;
    case 'high':
      return <ArrowUp className={cn('w-3.5 h-3.5 shrink-0', className)} aria-hidden="true" />;
    case 'medium':
      return <Minus className={cn('w-3.5 h-3.5 shrink-0', className)} aria-hidden="true" />;
    case 'low':
      return <ArrowDown className={cn('w-3.5 h-3.5 shrink-0', className)} aria-hidden="true" />;
  }
}

export function TaskCard({
  task,
  isDragging = false,
  isOverlay = false,
  onEdit,
  dragHandleProps,
}: TaskCardProps) {
  const priorityMeta = PRIORITY_META[task.priority];
  const overdue = isDateOverdue(task.dueDate);

  return (
    <article
      className={cn(
        'group relative rounded-lg bg-[#161B26] border border-slate-800/90 p-3.5 transition-colors duration-150 select-none',
        !isDragging && !isOverlay && 'hover:border-slate-700 hover:bg-[#19202D]',
        isDragging && 'opacity-35 border-dashed border-indigo-500/60',
        isOverlay && 'border-indigo-500/80 shadow-xl shadow-black/50 ring-1 ring-indigo-500/30 cursor-grabbing'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h4
          onClick={() => onEdit?.(task)}
          className="text-sm font-medium text-slate-100 leading-snug line-clamp-2 cursor-pointer hover:text-indigo-300 transition-colors"
        >
          {task.title}
        </h4>

        <div className="flex items-center gap-1 shrink-0">
          {onEdit ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
              aria-label={`Редактировать задачу ${task.title}`}
              className="p-1 rounded text-slate-500 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-slate-200 hover:bg-slate-800 transition-all cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          ) : null}
          {dragHandleProps ? (
            <button
              type="button"
              {...dragHandleProps}
              aria-label={`Переместить задачу ${task.title}`}
              className="p-1 rounded text-slate-500 hover:text-slate-200 hover:bg-slate-800 cursor-grab active:cursor-grabbing transition-colors"
            >
              <GripVertical className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {task.description ? (
        <p className="mt-1.5 text-xs text-slate-400 leading-relaxed line-clamp-2">
          {task.description}
        </p>
      ) : null}

      <div className="mt-3 pt-2.5 border-t border-slate-800/70 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs text-slate-400">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={cn('inline-flex items-center gap-1 font-medium', priorityMeta.textClass)}>
            <PriorityIcon priority={task.priority} className={priorityMeta.textClass} />
            <span>{priorityMeta.label}</span>
          </span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="font-mono tabular-nums text-slate-300">{task.estimate} SP</span>
          {task.dueDate ? (
            <>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className={cn('tabular-nums', overdue ? 'text-rose-400 font-medium' : 'text-slate-400')}>
                {formatShortDate(task.dueDate)}
              </span>
            </>
          ) : null}
        </div>

        {task.assignee ? (
          <span className="text-slate-400 truncate max-w-[110px]" title={task.assignee}>
            {task.assignee}
          </span>
        ) : null}
      </div>
    </article>
  );
}
