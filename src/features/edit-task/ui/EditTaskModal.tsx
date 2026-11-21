import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { Trash2 } from 'lucide-react';
import { useBoardMutations, useBoardStore } from '@/src/entities/board';
import {
  PRIORITY_OPTIONS,
  taskFormSchema,
  type Task,
  type TaskFormValues,
  type TaskPriority,
} from '@/src/entities/task';
import { STORY_POINT_OPTIONS } from '@/src/shared/config';
import { getFirstErrorMessage } from '@/src/shared/lib';
import { Button, Input, Modal, Select, Textarea } from '@/src/shared/ui';

interface EditTaskModalProps {
  task: Task | null;
  onClose: () => void;
}

function EditTaskFormInner({
  task,
  onClose,
}: {
  task: Task;
  onClose: () => void;
}) {
  const columns = useBoardStore((s) => s.columns);
  const { updateTaskMutation, deleteTaskMutation } = useBoardMutations();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const form = useForm({
    defaultValues: {
      title: task.title,
      description: task.description,
      columnId: task.columnId,
      priority: task.priority,
      estimate: task.estimate,
      assignee: task.assignee,
      dueDate: task.dueDate,
    } satisfies TaskFormValues,
    validators: {
      onSubmit: taskFormSchema,
    },
    onSubmit: async ({ value }) => {
      await updateTaskMutation.mutateAsync({
        id: task.id,
        ...value,
      });
      onClose();
    },
  });

  const handleDelete = async () => {
    await deleteTaskMutation.mutateAsync(task.id);
    onClose();
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
      className="flex flex-col gap-4"
      noValidate
    >
      <form.Field
        name="title"
        validators={{ onChange: taskFormSchema.shape.title }}
      >
        {(field) => (
          <Input
            label="Название задачи"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={getFirstErrorMessage(field.state.meta.errors)}
          />
        )}
      </form.Field>

      <form.Field
        name="description"
        validators={{ onChange: taskFormSchema.shape.description }}
      >
        {(field) => (
          <Textarea
            label="Описание"
            rows={3}
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={getFirstErrorMessage(field.state.meta.errors)}
          />
        )}
      </form.Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <form.Field
          name="columnId"
          validators={{ onChange: taskFormSchema.shape.columnId }}
        >
          {(field) => (
            <Select
              label="Этап воронки"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={getFirstErrorMessage(field.state.meta.errors)}
            >
              {columns.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.title}
                </option>
              ))}
            </Select>
          )}
        </form.Field>

        <form.Field name="priority">
          {(field) => (
            <Select
              label="Приоритет"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value as TaskPriority)}
            >
              {PRIORITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          )}
        </form.Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <form.Field
          name="estimate"
          validators={{ onChange: taskFormSchema.shape.estimate }}
        >
          {(field) => (
            <Select
              label="Оценка (SP)"
              value={String(field.state.value)}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(Number(e.target.value))}
              error={getFirstErrorMessage(field.state.meta.errors)}
            >
              {STORY_POINT_OPTIONS.map((sp) => (
                <option key={sp} value={sp}>
                  {sp} SP
                </option>
              ))}
            </Select>
          )}
        </form.Field>

        <form.Field
          name="assignee"
          validators={{ onChange: taskFormSchema.shape.assignee }}
        >
          {(field) => (
            <Input
              label="Исполнитель"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={getFirstErrorMessage(field.state.meta.errors)}
            />
          )}
        </form.Field>

        <form.Field name="dueDate">
          {(field) => (
            <Input
              type="date"
              label="Срок"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          )}
        </form.Field>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
        {!confirmDelete ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmDelete(true)}
            className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Удалить
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="danger" size="sm" onClick={() => void handleDelete()}>
              Подтвердить удаление
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmDelete(false)}
            >
              Отмена
            </Button>
          </div>
        )}

        <div className="flex items-center gap-3 ml-auto">
          <Button variant="ghost" onClick={onClose}>
            Закрыть
          </Button>
          <form.Subscribe selector={(state) => [state.isSubmitting]}>
            {([isSubmitting]) => (
              <Button type="submit" disabled={isSubmitting}>
                Сохранить
              </Button>
            )}
          </form.Subscribe>
        </div>
      </div>
    </form>
  );
}

export function EditTaskModal({ task, onClose }: EditTaskModalProps) {
  return (
    <Modal
      open={Boolean(task)}
      onClose={onClose}
      title="Редактирование задачи"
      description="Измените описание, этап воронки или оценку задачи."
    >
      {task ? <EditTaskFormInner key={task.id} task={task} onClose={onClose} /> : null}
    </Modal>
  );
}
