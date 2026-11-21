import { useState } from 'react';
import {
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  pointerWithin,
  rectIntersection,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useBoardStore } from '@/src/entities/board';
import type { Column } from '@/src/entities/column';
import type { Task } from '@/src/entities/task';

export type ActiveDragItem =
  | { type: 'task'; task: Task }
  | { type: 'column'; column: Column }
  | null;

const customCollisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) {
    return pointerCollisions;
  }
  const rectCollisions = rectIntersection(args);
  if (rectCollisions.length > 0) {
    return rectCollisions;
  }
  return closestCorners(args);
};

export function useKanbanDnd() {
  const columns = useBoardStore((s) => s.columns);
  const tasks = useBoardStore((s) => s.tasks);
  const moveTask = useBoardStore((s) => s.moveTask);
  const reorderTasks = useBoardStore((s) => s.reorderTasks);
  const reorderColumns = useBoardStore((s) => s.reorderColumns);

  const [activeItem, setActiveItem] = useState<ActiveDragItem>(null);
  const [hoveredColumnId, setHoveredColumnId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const resolveColumnIdFromOver = (overId: string, overType?: string): string | null => {
    if (overType === 'column') {
      return overId;
    }
    const overTask = tasks.find((t) => t.id === overId);
    if (overTask) return overTask.columnId;
    const overCol = columns.find((c) => c.id === overId);
    return overCol ? overCol.id : null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as
      | { type?: 'task' | 'column'; task?: Task; column?: Column }
      | undefined;

    if (data?.type === 'task' && data.task) {
      setActiveItem({ type: 'task', task: data.task });
      setHoveredColumnId(data.task.columnId);
    } else if (data?.type === 'column' && data.column) {
      setActiveItem({ type: 'column', column: data.column });
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current as { type?: string } | undefined;
    if (activeData?.type !== 'task') return;

    const overData = over.data.current as { type?: string } | undefined;
    const targetColId = resolveColumnIdFromOver(String(over.id), overData?.type);
    if (targetColId && targetColId !== hoveredColumnId) {
      setHoveredColumnId(targetColId);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);
    setHoveredColumnId(null);

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeData = active.data.current as { type?: 'task' | 'column' } | undefined;
    const overData = over.data.current as { type?: 'task' | 'column' } | undefined;

    if (activeData?.type === 'column') {
      const targetColumnId =
        overData?.type === 'column'
          ? overId
          : tasks.find((t) => t.id === overId)?.columnId;
      if (targetColumnId && targetColumnId !== activeId) {
        reorderColumns(activeId, targetColumnId);
      }
      return;
    }

    if (activeData?.type === 'task') {
      if (activeId === overId) return;

      const activeTask = tasks.find((t) => t.id === activeId);
      if (!activeTask) return;

      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        reorderTasks(activeId, overId);
        return;
      }

      const targetCol = columns.find((c) => c.id === overId);
      if (targetCol && activeTask.columnId !== targetCol.id) {
        moveTask(activeId, targetCol.id);
      }
    }
  };

  const handleDragCancel = () => {
    setActiveItem(null);
    setHoveredColumnId(null);
  };

  return {
    sensors,
    collisionDetection: customCollisionDetection,
    activeItem,
    hoveredColumnId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  };
}
