export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id: string;
  columnId: string;
  title: string;
  description: string;
  priority: TaskPriority;
  estimate: number;
  assignee: string;
  dueDate: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreateTaskInput {
  columnId: string;
  title: string;
  description: string;
  priority: TaskPriority;
  estimate: number;
  assignee: string;
  dueDate: string;
}

export interface UpdateTaskInput {
  id: string;
  columnId: string;
  title: string;
  description: string;
  priority: TaskPriority;
  estimate: number;
  assignee: string;
  dueDate: string;
}
