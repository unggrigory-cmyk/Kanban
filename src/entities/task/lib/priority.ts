import type { TaskPriority } from '../model/types';

export interface PriorityMeta {
  label: string;
  textClass: string;
}

export const PRIORITY_META: Record<TaskPriority, PriorityMeta> = {
  low: {
    label: 'Низкий',
    textClass: 'text-slate-400',
  },
  medium: {
    label: 'Средний',
    textClass: 'text-sky-400',
  },
  high: {
    label: 'Высокий',
    textClass: 'text-amber-400',
  },
  critical: {
    label: 'Критичный',
    textClass: 'text-rose-400',
  },
};

export const PRIORITY_OPTIONS: Array<{ value: TaskPriority; label: string }> = [
  { value: 'low', label: 'Низкий' },
  { value: 'medium', label: 'Средний' },
  { value: 'high', label: 'Высокий' },
  { value: 'critical', label: 'Критичный' },
];
