import type { ReactNode } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Column } from '@/src/entities/column';
import { cn } from '@/src/shared/lib';

interface SortableColumnWrapperProps {
  column: Column;
  children: (dragHandleProps: Record<string, unknown>, isDragging: boolean) => ReactNode;
}

export function SortableColumnWrapper({
  column,
  children,
}: SortableColumnWrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: 'column',
      column,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        'h-full shrink-0',
        isDragging && 'opacity-40'
      )}
    >
      {children(listeners ?? {}, isDragging)}
    </div>
  );
}
