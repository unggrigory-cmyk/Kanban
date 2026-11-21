import type { Column } from '@/src/entities/column';
import type { Task } from '@/src/entities/task';

export interface FunnelStageMetrics {
  columnId: string;
  title: string;
  order: number;
  taskCount: number;
  storyPoints: number;
  sharePercent: number;
  stageWeightPercent: number;
  wipLimit: number | null;
  isOverWip: boolean;
}

export interface FunnelProgressSummary {
  totalTasks: number;
  totalStoryPoints: number;
  completedTasks: number;
  completedStoryPoints: number;
  completedPercent: number;
  weightedFunnelPercent: number;
  inProgressTasks: number;
  finalColumnId: string | null;
  finalColumnTitle: string | null;
  stages: FunnelStageMetrics[];
}

export interface BoardSnapshot {
  columns: Column[];
  tasks: Task[];
  lastUpdatedAt: number;
}
