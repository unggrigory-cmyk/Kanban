import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { Plus, X } from 'lucide-react';
import { useBoardMutations } from '@/src/entities/board';
import {
  createColumnFormSchema,
  type CreateColumnFormValues,
} from '@/src/entities/column';
import { getFirstErrorMessage } from '@/src/shared/lib';
import { Button, Input } from '@/src/shared/ui';

export function AddColumnForm() {
  const [isOpen, setIsOpen] = useState(false);
  const { createColumnMutation } = useBoardMutations();

  const form = useForm({
    defaultValues: {
      title: '',
      wipLimit: '',
    } satisfies CreateColumnFormValues,
    validators: {
      onSubmit: createColumnFormSchema,
    },
    onSubmit: async ({ value }) => {
      await createColumnMutation.mutateAsync({
        title: value.title,
        wipLimit: value.wipLimit.trim() === '' ? null : Number(value.wipLimit),
      });
      form.reset();
      setIsOpen(false);
    },
  });

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-[300px] shrink-0 h-[52px] rounded-xl border border-dashed border-slate-800 bg-[#10141D]/60 hover:bg-[#141925] hover:border-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center gap-2 text-sm font-medium transition-colors duration-150 cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        <span>Добавить этап</span>
      </button>
    );
  }

  return (
    <div className="w-[300px] shrink-0 rounded-xl bg-[#121620] border border-slate-800 p-4 self-start">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-100">Новый этап воронки</h3>
        <button
          type="button"
          onClick={() => {
            form.reset();
            setIsOpen(false);
          }}
          aria-label="Отменить создание этапа"
          className="p-1 rounded text-slate-500 hover:text-slate-200 hover:bg-slate-800 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
        className="flex flex-col gap-3"
        noValidate
      >
        <form.Field
          name="title"
          validators={{ onChange: createColumnFormSchema.shape.title }}
        >
          {(field) => (
            <Input
              label="Название этапа"
              placeholder="Например: Тестирование"
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
          name="wipLimit"
          validators={{ onChange: createColumnFormSchema.shape.wipLimit }}
        >
          {(field) => (
            <Input
              label="WIP-лимит (необязательно)"
              placeholder="Без ограничения"
              inputMode="numeric"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={getFirstErrorMessage(field.state.meta.errors)}
            />
          )}
        </form.Field>

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              form.reset();
              setIsOpen(false);
            }}
          >
            Отмена
          </Button>
          <Button type="submit" size="sm">
            Создать
          </Button>
        </div>
      </form>
    </div>
  );
}
