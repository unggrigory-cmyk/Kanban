import { z } from 'zod';

export const columnTitleSchema = z
  .string()
  .trim()
  .min(1, 'Введите название этапа')
  .max(40, 'Название не должно превышать 40 символов');

export const createColumnFormSchema = z.object({
  title: columnTitleSchema,
  wipLimit: z
    .string()
    .trim()
    .refine(
      (val) => val === '' || (/^\d+$/.test(val) && Number(val) >= 1 && Number(val) <= 99),
      'Укажите число от 1 до 99 или оставьте пустым'
    ),
});

export type CreateColumnFormValues = z.infer<typeof createColumnFormSchema>;
