import { ArrowRight } from 'lucide-react';
import type { FunnelProgressSummary } from '@/src/entities/board';
import { cn, formatTime } from '@/src/shared/lib';

interface FunnelProgressBarProps {
  summary: FunnelProgressSummary;
  projectedSummary?: FunnelProgressSummary | null;
  lastUpdatedAt: number;
}

const STAGE_BAR_COLORS = [
  'bg-slate-600',
  'bg-sky-600',
  'bg-indigo-500',
  'bg-violet-500',
  'bg-emerald-500',
];

export function FunnelProgressBar({
  summary,
  projectedSummary,
  lastUpdatedAt,
}: FunnelProgressBarProps) {
  const isPreviewing =
    projectedSummary !== null &&
    projectedSummary !== undefined &&
    projectedSummary.weightedFunnelPercent !== summary.weightedFunnelPercent;

  const displayWeighted = projectedSummary
    ? projectedSummary.weightedFunnelPercent
    : summary.weightedFunnelPercent;

  const delta = projectedSummary
    ? projectedSummary.weightedFunnelPercent - summary.weightedFunnelPercent
    : 0;

  return (
    <section
      aria-label="Прогресс воронки в реальном времени"
      className="rounded-xl bg-[#11151F] border border-slate-800/90 px-4 py-3.5"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div>
            <div className="text-xs text-slate-400">Взвешенный прогресс воронки</div>
            <div className="mt-0.5 flex items-baseline gap-2">
              <span className="text-xl font-semibold text-slate-100 font-mono tabular-nums">
                {summary.weightedFunnelPercent}%
              </span>
              {isPreviewing ? (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 text-xs font-mono tabular-nums font-medium',
                    delta > 0 ? 'text-emerald-400' : 'text-amber-400'
                  )}
                >
                  <ArrowRight className="w-3 h-3" />
                  <span>{displayWeighted}%</span>
                  <span>
                    ({delta > 0 ? `+${delta}%` : `${delta}%`})
                  </span>
                </span>
              ) : null}
            </div>
          </div>

          <div className="h-8 w-px bg-slate-800 hidden sm:block" aria-hidden="true" />

          <div>
            <div className="text-xs text-slate-400">
              Завершено ({summary.finalColumnTitle ?? 'Финал'})
            </div>
            <div className="mt-0.5 text-sm font-medium text-slate-200 font-mono tabular-nums">
              {summary.completedTasks} / {summary.totalTasks} задач · {summary.completedPercent}%
            </div>
          </div>

          <div className="h-8 w-px bg-slate-800 hidden sm:block" aria-hidden="true" />

          <div>
            <div className="text-xs text-slate-400">Выполнено по оценке</div>
            <div className="mt-0.5 text-sm font-medium text-slate-200 font-mono tabular-nums">
              {summary.completedStoryPoints} / {summary.totalStoryPoints} SP
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-mono tabular-nums">
          Обновлено в {formatTime(lastUpdatedAt)}
        </div>
      </div>

      {/* Real-time funnel progress track */}
      <div className="mt-3">
        <div
          className="h-2 w-full rounded-full bg-slate-900 overflow-hidden flex gap-0.5"
          role="progressbar"
          aria-valuenow={displayWeighted}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Общий прогресс воронки"
        >
          {(projectedSummary ?? summary).stages.map((stage, index) => {
            if (stage.taskCount === 0 || (projectedSummary ?? summary).totalTasks === 0) {
              return null;
            }
            const widthPercent =
              (stage.taskCount / (projectedSummary ?? summary).totalTasks) * 100;
            const isLast = index === (projectedSummary ?? summary).stages.length - 1;
            const colorClass = isLast
              ? 'bg-emerald-500'
              : STAGE_BAR_COLORS[index % (STAGE_BAR_COLORS.length - 1)];

            return (
              <div
                key={stage.columnId}
                style={{ width: `${widthPercent}%` }}
                title={`${stage.title}: ${stage.taskCount} задач (${stage.storyPoints} SP)`}
                className={cn(
                  'h-full transition-all duration-200',
                  colorClass
                )}
              />
            );
          })}
        </div>

        {/* Clean unboxed stage legend with tabular numerals */}
        {summary.stages.length > 0 ? (
          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
            {(projectedSummary ?? summary).stages.map((stage, index) => {
              const isLast = index === (projectedSummary ?? summary).stages.length - 1;
              const swatchClass = isLast
                ? 'bg-emerald-500'
                : STAGE_BAR_COLORS[index % (STAGE_BAR_COLORS.length - 1)];
              return (
                <div key={stage.columnId} className="inline-flex items-center gap-1.5">
                  <span
                    className={cn('w-2 h-2 rounded-xs shrink-0', swatchClass)}
                    aria-hidden="true"
                  />
                  <span className="text-slate-300">{stage.title}</span>
                  <span className="font-mono tabular-nums text-slate-500">
                    {stage.taskCount}
                  </span>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
