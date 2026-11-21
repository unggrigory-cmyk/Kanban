import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskCard, type Task } from '@/src/entities/task';

interface SortableTaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export function SortableTaskItem({ task, onEdit }: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <TaskCard
        task={task}
        isDragging={isDragging}
        onEdit={onEdit}
        dragHandleProps={listeners}
      />
    </div>
  );
}
