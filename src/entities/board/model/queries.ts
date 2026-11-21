import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateColumnInput } from '@/src/entities/column';
import type { CreateTaskInput, UpdateTaskInput } from '@/src/entities/task';
import { useBoardStore } from './store';
import type { BoardSnapshot } from './types';

export const BOARD_QUERY_KEY = ['board', 'funnel'] as const;

export function useBoardQuery() {
  const queryClient = useQueryClient();
  const columns = useBoardStore((s) => s.columns);
  const tasks = useBoardStore((s) => s.tasks);
  const lastUpdatedAt = useBoardStore((s) => s.lastUpdatedAt);

  useEffect(() => {
    queryClient.setQueryData<BoardSnapshot>(BOARD_QUERY_KEY, {
      columns,
      tasks,
      lastUpdatedAt,
    });
  }, [columns, tasks, lastUpdatedAt, queryClient]);

  return useQuery<BoardSnapshot>({
    queryKey: BOARD_QUERY_KEY,
    queryFn: async () => {
      const state = useBoardStore.getState();
      return {
        columns: state.columns,
        tasks: state.tasks,
        lastUpdatedAt: state.lastUpdatedAt,
      };
    },
    initialData: () => ({
      columns: useBoardStore.getState().columns,
      tasks: useBoardStore.getState().tasks,
      lastUpdatedAt: useBoardStore.getState().lastUpdatedAt,
    }),
    staleTime: Infinity,
  });
}

export function useBoardMutations() {
  const queryClient = useQueryClient();
  const store = useBoardStore();

  const syncCache = () => {
    const state = useBoardStore.getState();
    queryClient.setQueryData<BoardSnapshot>(BOARD_QUERY_KEY, {
      columns: state.columns,
      tasks: state.tasks,
      lastUpdatedAt: state.lastUpdatedAt,
    });
  };

  const createTaskMutation = useMutation({
    mutationFn: async (input: CreateTaskInput) => store.addTask(input),
    onSuccess: syncCache,
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (input: UpdateTaskInput) => store.updateTask(input),
    onSuccess: syncCache,
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => store.deleteTask(taskId),
    onSuccess: syncCache,
  });

  const createColumnMutation = useMutation({
    mutationFn: async (input: CreateColumnInput) => store.addColumn(input),
    onSuccess: syncCache,
  });

  const renameColumnMutation = useMutation({
    mutationFn: async ({ columnId, title }: { columnId: string; title: string }) =>
      store.renameColumn(columnId, title),
    onSuccess: syncCache,
  });

  const deleteColumnMutation = useMutation({
    mutationFn: async ({
      columnId,
      moveTasksToColumnId,
    }: {
      columnId: string;
      moveTasksToColumnId?: string | null;
    }) => store.deleteColumn(columnId, moveTasksToColumnId),
    onSuccess: syncCache,
  });

  return {
    createTaskMutation,
    updateTaskMutation,
    deleteTaskMutation,
    createColumnMutation,
    renameColumnMutation,
    deleteColumnMutation,
  };
}
