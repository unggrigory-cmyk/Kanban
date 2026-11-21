import { arrayMove } from '@dnd-kit/sortable';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Column, CreateColumnInput } from '@/src/entities/column';
import type { CreateTaskInput, Task, UpdateTaskInput } from '@/src/entities/task';
import { BOARD_BROADCAST_CHANNEL, BOARD_STORAGE_KEY } from '@/src/shared/config';
import { createId } from '@/src/shared/lib';
import { INITIAL_COLUMNS, INITIAL_TASKS } from './seed';
import type { BoardSnapshot } from './types';

interface BoardStoreState extends BoardSnapshot {
  addTask: (input: CreateTaskInput) => Task;
  updateTask: (input: UpdateTaskInput) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, targetColumnId: string, targetIndex?: number) => void;
  reorderTasks: (activeTaskId: string, overTaskId: string) => void;
  addColumn: (input: CreateColumnInput) => Column;
  renameColumn: (columnId: string, title: string) => void;
  updateColumnWip: (columnId: string, wipLimit: number | null) => void;
  deleteColumn: (columnId: string, moveTasksToColumnId?: string | null) => void;
  reorderColumns: (activeColumnId: string, overColumnId: string) => void;
  resetBoard: () => void;
  hydrateSnapshot: (snapshot: BoardSnapshot) => void;
}

const channel =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel(BOARD_BROADCAST_CHANNEL)
    : null;

function broadcastSnapshot(snapshot: BoardSnapshot) {
  if (!channel) return;
  try {
    channel.postMessage({ type: 'SYNC_BOARD', payload: snapshot });
  } catch {
    // Ignore broadcast errors in restricted contexts
  }
}

function normalizeColumnOrders(columns: Column[]): Column[] {
  return columns.map((col, idx) => ({ ...col, order: idx }));
}

export const useBoardStore = create<BoardStoreState>()(
  persist(
    (set, get) => ({
      columns: INITIAL_COLUMNS,
      tasks: INITIAL_TASKS,
      lastUpdatedAt: Date.now(),

      addTask: (input) => {
        const now = Date.now();
        const newTask: Task = {
          id: createId('task'),
          columnId: input.columnId,
          title: input.title.trim(),
          description: input.description.trim(),
          priority: input.priority,
          estimate: input.estimate,
          assignee: input.assignee.trim(),
          dueDate: input.dueDate,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => {
          const next = {
            columns: state.columns,
            tasks: [newTask, ...state.tasks],
            lastUpdatedAt: now,
          };
          broadcastSnapshot(next);
          return next;
        });
        return newTask;
      },

      updateTask: (input) => {
        const now = Date.now();
        set((state) => {
          const tasks = state.tasks.map((task) =>
            task.id === input.id
              ? {
                  ...task,
                  columnId: input.columnId,
                  title: input.title.trim(),
                  description: input.description.trim(),
                  priority: input.priority,
                  estimate: input.estimate,
                  assignee: input.assignee.trim(),
                  dueDate: input.dueDate,
                  updatedAt: now,
                }
              : task
          );
          const next = { columns: state.columns, tasks, lastUpdatedAt: now };
          broadcastSnapshot(next);
          return next;
        });
      },

      deleteTask: (taskId) => {
        const now = Date.now();
        set((state) => {
          const tasks = state.tasks.filter((t) => t.id !== taskId);
          const next = { columns: state.columns, tasks, lastUpdatedAt: now };
          broadcastSnapshot(next);
          return next;
        });
      },

      moveTask: (taskId, targetColumnId, targetIndex) => {
        const state = get();
        const taskIndex = state.tasks.findIndex((t) => t.id === taskId);
        if (taskIndex === -1) return;

        const currentTask = state.tasks[taskIndex];
        const updatedTask: Task = {
          ...currentTask,
          columnId: targetColumnId,
          updatedAt: Date.now(),
        };

        const withoutTask = state.tasks.filter((t) => t.id !== taskId);

        let insertAt = withoutTask.length;
        if (typeof targetIndex === 'number') {
          const targetColTasks = withoutTask.filter((t) => t.columnId === targetColumnId);
          if (targetIndex < targetColTasks.length) {
            const anchorTask = targetColTasks[targetIndex];
            const globalAnchorIdx = withoutTask.findIndex((t) => t.id === anchorTask.id);
            if (globalAnchorIdx !== -1) {
              insertAt = globalAnchorIdx;
            }
          }
        }

        const nextTasks = [
          ...withoutTask.slice(0, insertAt),
          updatedTask,
          ...withoutTask.slice(insertAt),
        ];

        const next = {
          columns: state.columns,
          tasks: nextTasks,
          lastUpdatedAt: updatedTask.updatedAt,
        };
        set(next);
        broadcastSnapshot(next);
      },

      reorderTasks: (activeTaskId, overTaskId) => {
        if (activeTaskId === overTaskId) return;
        const state = get();
        const oldIndex = state.tasks.findIndex((t) => t.id === activeTaskId);
        const newIndex = state.tasks.findIndex((t) => t.id === overTaskId);
        if (oldIndex === -1 || newIndex === -1) return;

        const activeTask = state.tasks[oldIndex];
        const overTask = state.tasks[newIndex];
        const now = Date.now();

        const updatedTasks = state.tasks.map((t) =>
          t.id === activeTaskId
            ? { ...t, columnId: overTask.columnId, updatedAt: now }
            : t
        );

        const reordered =
          activeTask.columnId === overTask.columnId
            ? arrayMove(updatedTasks, oldIndex, newIndex)
            : (() => {
                const moved = updatedTasks[oldIndex];
                const stripped = updatedTasks.filter((t) => t.id !== activeTaskId);
                const overIdxInStripped = stripped.findIndex((t) => t.id === overTaskId);
                const insertIdx =
                  oldIndex < newIndex ? overIdxInStripped + 1 : overIdxInStripped;
                return [
                  ...stripped.slice(0, Math.max(0, insertIdx)),
                  moved,
                  ...stripped.slice(Math.max(0, insertIdx)),
                ];
              })();

        const next = {
          columns: state.columns,
          tasks: reordered,
          lastUpdatedAt: now,
        };
        set(next);
        broadcastSnapshot(next);
      },

      addColumn: (input) => {
        const now = Date.now();
        const state = get();
        const newColumn: Column = {
          id: createId('col'),
          title: input.title.trim(),
          wipLimit: input.wipLimit,
          order: state.columns.length,
        };
        const next = {
          columns: normalizeColumnOrders([...state.columns, newColumn]),
          tasks: state.tasks,
          lastUpdatedAt: now,
        };
        set(next);
        broadcastSnapshot(next);
        return newColumn;
      },

      renameColumn: (columnId, title) => {
        const trimmed = title.trim();
        if (!trimmed) return;
        const now = Date.now();
        set((state) => {
          const columns = state.columns.map((col) =>
            col.id === columnId ? { ...col, title: trimmed } : col
          );
          const next = { columns, tasks: state.tasks, lastUpdatedAt: now };
          broadcastSnapshot(next);
          return next;
        });
      },

      updateColumnWip: (columnId, wipLimit) => {
        const now = Date.now();
        set((state) => {
          const columns = state.columns.map((col) =>
            col.id === columnId ? { ...col, wipLimit } : col
          );
          const next = { columns, tasks: state.tasks, lastUpdatedAt: now };
          broadcastSnapshot(next);
          return next;
        });
      },

      deleteColumn: (columnId, moveTasksToColumnId = null) => {
        const now = Date.now();
        set((state) => {
          const columns = normalizeColumnOrders(
            state.columns.filter((col) => col.id !== columnId)
          );
          const tasks = moveTasksToColumnId
            ? state.tasks.map((task) =>
                task.columnId === columnId
                  ? { ...task, columnId: moveTasksToColumnId, updatedAt: now }
                  : task
              )
            : state.tasks.filter((task) => task.columnId !== columnId);

          const next = { columns, tasks, lastUpdatedAt: now };
          broadcastSnapshot(next);
          return next;
        });
      },

      reorderColumns: (activeColumnId, overColumnId) => {
        if (activeColumnId === overColumnId) return;
        const state = get();
        const oldIndex = state.columns.findIndex((c) => c.id === activeColumnId);
        const newIndex = state.columns.findIndex((c) => c.id === overColumnId);
        if (oldIndex === -1 || newIndex === -1) return;

        const nextColumns = normalizeColumnOrders(
          arrayMove(state.columns, oldIndex, newIndex)
        );
        const next = {
          columns: nextColumns,
          tasks: state.tasks,
          lastUpdatedAt: Date.now(),
        };
        set(next);
        broadcastSnapshot(next);
      },

      resetBoard: () => {
        const next = {
          columns: INITIAL_COLUMNS,
          tasks: INITIAL_TASKS,
          lastUpdatedAt: Date.now(),
        };
        set(next);
        broadcastSnapshot(next);
      },

      hydrateSnapshot: (snapshot) => {
        set({
          columns: snapshot.columns,
          tasks: snapshot.tasks,
          lastUpdatedAt: snapshot.lastUpdatedAt,
        });
      },
    }),
    {
      name: BOARD_STORAGE_KEY,
      partialize: (state) => ({
        columns: state.columns,
        tasks: state.tasks,
        lastUpdatedAt: state.lastUpdatedAt,
      }),
    }
  )
);

if (channel) {
  channel.onmessage = (event: MessageEvent<{ type?: string; payload?: BoardSnapshot }>) => {
    if (event.data?.type === 'SYNC_BOARD' && event.data.payload) {
      const currentUpdated = useBoardStore.getState().lastUpdatedAt;
      if (event.data.payload.lastUpdatedAt > currentUpdated) {
        useBoardStore.getState().hydrateSnapshot(event.data.payload);
      }
    }
  };
}
