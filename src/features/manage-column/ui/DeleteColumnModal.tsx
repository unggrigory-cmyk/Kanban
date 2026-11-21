import { useEffect, useState } from 'react';
import { useBoardMutations, useBoardStore } from '@/src/entities/board';
import type { Column } from '@/src/entities/column';
import { Button, Modal, Select } from '@/src/shared/ui';

interface DeleteColumnModalProps {
  column: Column | null;
  taskCount: number;
  onClose: () => void;
}

export function DeleteColumnModal({
  column,
  taskCount,
  onClose,
}: DeleteColumnModalProps) {
  const columns = useBoardStore((s) => s.columns);
  const { deleteColumnMutation } = useBoardMutations();

  const otherColumns = columns.filter((c) => c.id !== column?.id);
  const [targetColumnId, setTargetColumnId] = useState<string>('');

  useEffect(() => {
    if (otherColumns.length > 0) {
      setTargetColumnId(otherColumns[0].id);
    } else {
      setTargetColumnId('');
    }
  }, [column?.id, columns.length]);

  if (!column) return null;

  const handleConfirm = async () => {
    await deleteColumnMutation.mutateAsync({
      columnId: column.id,
      moveTasksToColumnId: taskCount > 0 && targetColumnId ? targetColumnId : null,
    });
    onClose();
  };

  return (
    <Modal
      open={Boolean(column)}
      onClose={onClose}
      title={`Удалить этап «${column.title}»?`}
      description={
        taskCount > 0
          ? `На этом этапе сейчас находится задач: ${taskCount}. Выберите, что сделать с карточками перед удалением.`
          : 'Этап пуст и будет удалён из воронки без потери задач.'
      }
      maxWidthClass="max-w-md"
    >
      <div className="flex flex-col gap-5">
        {taskCount > 0 && otherColumns.length > 0 ? (
          <Select
            label="Действие с задачами этапа"
            value={targetColumnId}
            onChange={(e) => setTargetColumnId(e.target.value)}
          >
            {otherColumns.map((col) => (
              <option key={col.id} value={col.id}>
                Перенести в «{col.title}»
              </option>
            ))}
            <option value="">Удалить вместе с этапом ({taskCount})</option>
          </Select>
        ) : taskCount > 0 ? (
          <p className="text-sm text-rose-300 bg-rose-950/30 border border-rose-900/50 rounded-lg p-3">
            Других этапов на доске нет — {taskCount} задач будут удалены вместе с колонкой.
          </p>
        ) : null}

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800/80">
          <Button variant="ghost" onClick={onClose}>
            Отмена
          </Button>
          <Button variant="danger" onClick={() => void handleConfirm()}>
            Удалить этап
          </Button>
        </div>
      </div>
    </Modal>
  );
}
