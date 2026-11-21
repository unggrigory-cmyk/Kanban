import { useForm } from '@tanstack/react-form';
import { useBoardMutations, useBoardStore } from '@/src/entities/board';
import {
  PRIORITY_OPTIONS,
  taskFormSchema,
  type TaskFormValues,
  type TaskPriority,
} from '@/src/entities/task';
import { STORY_POINT_OPTIONS } from '@/src/shared/config';
import { getFirstErrorMessage } from '@/src/shared/lib';
import { Button, Input, Modal, Select, Textarea } from '@/src/shared/ui';

interface CreateTaskModalProps {
  open: boolean;
  defaultColumnId?: string;
  onClose: () => void;
}

function CreateTaskFormInner({
  defaultColumnId,
  onClose,
}: {
  defaultColumnId?: string;
  onClose: () => void;
}) {
  const columns = useBoardStore((s) => s.columns);
  const { createTaskMutation } = useBoardMutations();

  const initialColumnId = defaultColumnId ?? columns[0]?.id ?? '';

  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      columnId: initialColumnId,
      priority: 'medium' as TaskPriority,
      estimate: 3,
      assignee: '',
      dueDate: '',
    } satisfies TaskFormValues,
    validators: {
      onSubmit: taskFormSchema,
    },
    onSubmit: async ({ value }) => {
      await createTaskMutation.mutateAsync(value);
      onClose();
    },
  });

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
            placeholder="Например: Настроить вебхуки оплаты"
            autoFocus
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={
              field.state.meta.isTouched
                ? getFirstErrorMessage(field.state.meta.errors)
                : undefined
            }
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
            placeholder="Краткий контекст и критерии приёмки..."
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={
              field.state.meta.isTouched
                ? getFirstErrorMessage(field.state.meta.errors)
                : undefined
            }
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
              {columns.length === 0 ? (
                <option value="">Сначала создайте этап воронки</option>
              ) : (
                columns.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.title}
                  </option>
                ))
              )}
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
              placeholder="Имя или инициалы"
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

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800/80">
        <Button variant="ghost" onClick={onClose}>
          Отмена
        </Button>
        <form.Subscribe selector={(state) => [state.isSubmitting]}>
          {([isSubmitting]) => (
            <Button
              type="submit"
              disabled={isSubmitting || columns.length === 0}
            >
              Создать задачу
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}

export function CreateTaskModal({
  open,
  defaultColumnId,
  onClose,
}: CreateTaskModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Новая задача"
      description="Заполните параметры карточки — прогресс воронки пересчитается автоматически."
    >
      {open ? (
        <CreateTaskFormInner
          key={defaultColumnId ?? 'default'}
          defaultColumnId={defaultColumnId}
          onClose={onClose}
        />
      ) : null}
    </Modal>
  );
}
