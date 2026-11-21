import { DragOverlay } from '@dnd-kit/core';
import { TaskCard } from '@/src/entities/task';
import type { ActiveDragItem } from '../model/useKanbanDnd';

interface KanbanDragOverlayProps {
  activeItem: ActiveDragItem;
}

export function KanbanDragOverlay({ activeItem }: KanbanDragOverlayProps) {
  return (
    <DragOverlay dropAnimation={{ duration: 160, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }}>
      {activeItem?.type === 'task' ? (
        <div className="w-[300px]">
          <TaskCard task={activeItem.task} isOverlay />
        </div>
      ) : activeItem?.type === 'column' ? (
        <div className="w-[320px] rounded-xl bg-[#141925]/95 border border-indigo-500/70 px-4 py-3 shadow-2xl shadow-black/60">
          <p className="text-sm font-semibold text-slate-100">
            {activeItem.column.title}
          </p>
        </div>
      ) : null}
    </DragOverlay>
  );
}
