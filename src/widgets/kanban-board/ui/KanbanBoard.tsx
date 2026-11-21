import { useMemo, useState } from 'react';
import { DndContext } from '@dnd-kit/core';
import { horizontalListSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import { useBoardStore } from '@/src/entities/board';
import type { Column } from '@/src/entities/column';
import type { Task } from '@/src/entities/task';
import {
  KanbanDragOverlay,
  SortableColumnWrapper,
  useKanbanDnd,
} from '@/src/features/drag-and-drop';
import { filterTasks, useTaskFilterStore } from '@/src/features/filter-tasks';
import { AddColumnForm, DeleteColumnModal } from '@/src/features/manage-column';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  onAddTask: (columnId?: string) => void;
  onEditTask: (task: Task) => void;
  onDragPreviewChange?: (
    preview: { taskId: string; targetColumnId: string } | null
  ) => void;
}

export function KanbanBoard({
  onAddTask,
  onEditTask,
  onDragPreviewChange,
}: KanbanBoardProps) {
  const columns = useBoardStore((s) => s.columns);
  const tasks = useBoardStore((s) => s.tasks);
  const searchQuery = useTaskFilterStore((s) => s.searchQuery);
  const priorityFilter = useTaskFilterStore((s) => s.priorityFilter);

  const [columnToDelete, setColumnToDelete] = useState<Column | null>(null);

  const {
    sensors,
    collisionDetection,
    activeItem,
    hoveredColumnId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  } = useKanbanDnd();

  const orderedColumns = useMemo(
    () => [...columns].sort((a, b) => a.order - b.order),
    [columns]
  );

  const filteredTasks = useMemo(
    () => filterTasks(tasks, searchQuery, priorityFilter),
    [tasks, searchQuery, priorityFilter]
  );

  const tasksByColumn = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const col of orderedColumns) {
      map.set(col.id, []);
    }
    for (const task of filteredTasks) {
      const bucket = map.get(task.columnId);
      if (bucket) bucket.push(task);
    }
    return map;
  }, [orderedColumns, filteredTasks]);

  const totalCountsByColumn = useMemo(() => {
    const map = new Map<string, number>();
    for (const task of tasks) {
      map.set(task.columnId, (map.get(task.columnId) ?? 0) + 1);
    }
    return map;
  }, [tasks]);

  const notifyPreview = (
    item: typeof activeItem,
    targetColumnId: string | null
  ) => {
    if (!onDragPreviewChange) return;
    if (item?.type === 'task' && targetColumnId) {
      onDragPreviewChange({ taskId: item.task.id, targetColumnId });
    } else {
      onDragPreviewChange(null);
    }
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={(event) => {
          handleDragStart(event);
          const data = event.active.data.current as
            | { type?: string; task?: Task }
            | undefined;
          if (data?.type === 'task' && data.task) {
            onDragPreviewChange?.({
              taskId: data.task.id,
              targetColumnId: data.task.columnId,
            });
          }
        }}
        onDragOver={(event) => {
          handleDragOver(event);
          if (activeItem?.type === 'task' && event.over) {
            const overData = event.over.data.current as
              | { type?: string }
              | undefined;
            const overId = String(event.over.id);
            const resolvedCol =
              overData?.type === 'column'
                ? overId
                : tasks.find((t) => t.id === overId)?.columnId ?? null;
            if (resolvedCol) {
              notifyPreview(activeItem, resolvedCol);
            }
          }
        }}
        onDragEnd={(event) => {
          handleDragEnd(event);
          onDragPreviewChange?.(null);
        }}
        onDragCancel={() => {
          handleDragCancel();
          onDragPreviewChange?.(null);
        }}
      >
        <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden pb-2">
          <div className="h-full inline-flex items-start gap-4 min-w-full">
            <SortableContext
              items={orderedColumns.map((c) => c.id)}
              strategy={horizontalListSortingStrategy}
            >
              {orderedColumns.map((column, index) => (
                <SortableColumnWrapper key={column.id} column={column}>
                  {(dragHandleProps) => (
                    <KanbanColumn
                      column={column}
                      tasks={tasksByColumn.get(column.id) ?? []}
                      totalStageTasksCount={totalCountsByColumn.get(column.id) ?? 0}
                      isFinalStage={index === orderedColumns.length - 1}
                      isDropTarget={
                        activeItem?.type === 'task' && hoveredColumnId === column.id
                      }
                      columnDragHandleProps={dragHandleProps}
                      onAddTask={(colId) => onAddTask(colId)}
                      onEditTask={onEditTask}
                      onRequestDeleteColumn={(col) => setColumnToDelete(col)}
                    />
                  )}
                </SortableColumnWrapper>
              ))}
            </SortableContext>

            {orderedColumns.length === 0 ? (
              <div className="w-[320px] shrink-0 rounded-xl border border-dashed border-slate-800 bg-[#11151F]/60 p-6 text-sm text-slate-400">
                На доске нет ни одного этапа воронки. Создайте первый этап, чтобы начать добавлять задачи.
              </div>
            ) : null}

            <AddColumnForm />
          </div>
        </div>

        <KanbanDragOverlay activeItem={activeItem} />
      </DndContext>

      <DeleteColumnModal
        column={columnToDelete}
        taskCount={columnToDelete ? totalCountsByColumn.get(columnToDelete.id) ?? 0 : 0}
        onClose={() => setColumnToDelete(null)}
      />
    </>
  );
}
