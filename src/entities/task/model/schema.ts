import { z } from 'zod';

export const taskPrioritySchema = z.enum(['low', 'medium', 'high', 'critical']);

export const taskFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'Название должно содержать минимум 2 символа')
    .max(120, 'Максимум 120 символов'),
  description: z
    .string()
    .trim()
    .max(500, 'Описание не должно превышать 500 символов'),
  columnId: z.string().min(1, 'Выберите этап воронки'),
  priority: taskPrioritySchema,
  estimate: z
    .number({ error: 'Укажите оценку в SP' })
    .int('Только целое число')
    .min(1, 'Минимум 1 SP')
    .max(40, 'Максимум 40 SP'),
  assignee: z
    .string()
    .trim()
    .max(60, 'Максимум 60 символов'),
  dueDate: z.string(),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;
