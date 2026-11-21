import { useMemo, useState } from 'react';
import {
  calculateFunnelProgress,
  useBoardQuery,
  useBoardStore,
} from '@/src/entities/board';
import type { Task } from '@/src/entities/task';
import { CreateTaskModal } from '@/src/features/create-task';
import { EditTaskModal } from '@/src/features/edit-task';
import { TaskFilterToolbar } from '@/src/features/filter-tasks';
import { BoardHeader, type BoardViewMode } from '@/src/widgets/board-header';
import {
  FunnelAnalyticsView,
  FunnelProgressBar,
} from '@/src/widgets/funnel-progress';
import { KanbanBoard } from '@/src/widgets/kanban-board';

export function BoardPage() {
  const { data: boardSnapshot } = useBoardQuery();
  const resetBoard = useBoardStore((s) => s.resetBoard);

  const columns = boardSnapshot?.columns ?? [];
  const tasks = boardSnapshot?.tasks ?? [];
  const lastUpdatedAt = boardSnapshot?.lastUpdatedAt ?? Date.now();

  const [activeView, setActiveView] = useState<BoardViewMode>('board');
  const [createModalState, setCreateModalState] = useState<{
    open: boolean;
    defaultColumnId?: string;
  }>({ open: false });
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [dragPreview, setDragPreview] = useState<{
    taskId: string;
    targetColumnId: string;
  } | null>(null);

  const summary = useMemo(
    () => calculateFunnelProgress(columns, tasks),
    [columns, tasks]
  );

  const projectedSummary = useMemo(() => {
    if (!dragPreview) return null;
    const targetTask = tasks.find((t) => t.id === dragPreview.taskId);
    if (!targetTask || targetTask.columnId === dragPreview.targetColumnId) {
      return null;
    }
    const simulatedTasks = tasks.map((t) =>
      t.id === dragPreview.taskId
        ? { ...t, columnId: dragPreview.targetColumnId }
        : t
    );
    return calculateFunnelProgress(columns, simulatedTasks);
  }, [columns, tasks, dragPreview]);

  return (
    <div className="h-screen flex flex-col bg-[#0B0E14] text-slate-100 overflow-hidden">
      <BoardHeader
        activeView={activeView}
        onChangeView={setActiveView}
        onOpenCreateTask={() =>
          setCreateModalState({ open: true, defaultColumnId: columns[0]?.id })
        }
        onResetBoard={resetBoard}
      />

      <main className="flex-1 min-h-0 flex flex-col gap-4 px-4 sm:px-6 py-4 overflow-hidden">
        <FunnelProgressBar
          summary={summary}
          projectedSummary={projectedSummary}
          lastUpdatedAt={lastUpdatedAt}
        />

        {activeView === 'board' ? (
          <>
            <TaskFilterToolbar />
            <KanbanBoard
              onAddTask={(columnId) =>
                setCreateModalState({ open: true, defaultColumnId: columnId })
              }
              onEditTask={(task) => setEditingTask(task)}
              onDragPreviewChange={setDragPreview}
            />
          </>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto py-2">
            <FunnelAnalyticsView summary={summary} tasks={tasks} />
          </div>
        )}
      </main>

      <CreateTaskModal
        open={createModalState.open}
        defaultColumnId={createModalState.defaultColumnId}
        onClose={() => setCreateModalState({ open: false })}
      />

      <EditTaskModal
        task={editingTask}
        onClose={() => setEditingTask(null)}
      />
    </div>
  );
}
