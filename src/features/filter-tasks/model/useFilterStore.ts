import { create } from 'zustand';
import type { Task, TaskPriority } from '@/src/entities/task';

export type PriorityFilterValue = 'all' | TaskPriority;

interface TaskFilterState {
  searchQuery: string;
  priorityFilter: PriorityFilterValue;
  setSearchQuery: (query: string) => void;
  setPriorityFilter: (priority: PriorityFilterValue) => void;
  resetFilters: () => void;
}

export const useTaskFilterStore = create<TaskFilterState>((set) => ({
  searchQuery: '',
  priorityFilter: 'all',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setPriorityFilter: (priorityFilter) => set({ priorityFilter }),
  resetFilters: () => set({ searchQuery: '', priorityFilter: 'all' }),
}));

export function filterTasks(
  tasks: Task[],
  searchQuery: string,
  priorityFilter: PriorityFilterValue
): Task[] {
  const q = searchQuery.trim().toLowerCase();
  return tasks.filter((task) => {
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
      return false;
    }
    if (!q) return true;
    return (
      task.title.toLowerCase().includes(q) ||
      task.description.toLowerCase().includes(q) ||
      task.assignee.toLowerCase().includes(q)
    );
  });
}
