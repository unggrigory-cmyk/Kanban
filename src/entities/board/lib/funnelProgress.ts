import type { Column } from '@/src/entities/column';
import type { Task } from '@/src/entities/task';
import type { FunnelProgressSummary, FunnelStageMetrics } from '../model/types';

export function calculateFunnelProgress(
  columns: Column[],
  tasks: Task[]
): FunnelProgressSummary {
  const orderedColumns = [...columns].sort((a, b) => a.order - b.order);
  const totalTasks = tasks.length;
  const totalStoryPoints = tasks.reduce((sum, task) => sum + task.estimate, 0);

  const tasksByColumn = new Map<string, Task[]>();
  for (const column of orderedColumns) {
    tasksByColumn.set(column.id, []);
  }
  for (const task of tasks) {
    const bucket = tasksByColumn.get(task.columnId);
    if (bucket) {
      bucket.push(task);
    }
  }

  const columnCount = orderedColumns.length;
  let weightedPointsSum = 0;

  const stages: FunnelStageMetrics[] = orderedColumns.map((column, index) => {
    const columnTasks = tasksByColumn.get(column.id) ?? [];
    const taskCount = columnTasks.length;
    const storyPoints = columnTasks.reduce((sum, t) => sum + t.estimate, 0);

    const stageWeight = columnCount <= 1 ? (columnCount === 1 ? 1 : 0) : index / (columnCount - 1);
    weightedPointsSum += storyPoints * stageWeight;

    const sharePercent = totalTasks > 0 ? Math.round((taskCount / totalTasks) * 100) : 0;
    const isOverWip = column.wipLimit !== null && taskCount > column.wipLimit;

    return {
      columnId: column.id,
      title: column.title,
      order: index,
      taskCount,
      storyPoints,
      sharePercent,
      stageWeightPercent: Math.round(stageWeight * 100),
      wipLimit: column.wipLimit,
      isOverWip,
    };
  });

  const finalStage = stages.length > 0 ? stages[stages.length - 1] : null;
  const completedTasks = finalStage ? finalStage.taskCount : 0;
  const completedStoryPoints = finalStage ? finalStage.storyPoints : 0;

  const completedPercent =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const weightedFunnelPercent =
    totalStoryPoints > 0
      ? Math.round((weightedPointsSum / totalStoryPoints) * 100)
      : 0;

  const inProgressTasks = Math.max(0, totalTasks - completedTasks);

  return {
    totalTasks,
    totalStoryPoints,
    completedTasks,
    completedStoryPoints,
    completedPercent,
    weightedFunnelPercent,
    inProgressTasks,
    finalColumnId: finalStage?.columnId ?? null,
    finalColumnTitle: finalStage?.title ?? null,
    stages,
  };
}
