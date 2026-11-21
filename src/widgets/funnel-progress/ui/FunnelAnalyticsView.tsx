import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { FunnelProgressSummary } from '@/src/entities/board';
import type { Task } from '@/src/entities/task';
import { cn } from '@/src/shared/lib';

interface FunnelAnalyticsViewProps {
  summary: FunnelProgressSummary;
  tasks: Task[];
}

export function FunnelAnalyticsView({ summary, tasks }: FunnelAnalyticsViewProps) {
  const priorityCounts = tasks.reduce(
    (acc, task) => {
      acc[task.priority] += 1;
      return acc;
    },
    { critical: 0, high: 0, medium: 0, low: 0 }
  );

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div>
        <h1 className="text-xl font-semibold text-slate-100 tracking-tight">
          Аналитика воронки задач
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Распределение нагрузки по этапам, загрузка WIP-лимитов и взвешенная готовность спринта.
        </p>
      </div>

      {/* 4-column flat KPI strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl bg-[#11151F] border border-slate-800/90 p-4">
          <div className="text-xs text-slate-400">Взвешенный прогресс</div>
          <div className="mt-1.5 text-2xl font-semibold text-slate-100 font-mono tabular-nums">
            {summary.weightedFunnelPercent}%
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Учитывает продвижение задач по этапам
          </div>
        </div>

        <div className="rounded-xl bg-[#11151F] border border-slate-800/90 p-4">
          <div className="text-xs text-slate-400">Доведено до финала</div>
          <div className="mt-1.5 text-2xl font-semibold text-emerald-400 font-mono tabular-nums">
            {summary.completedTasks} из {summary.totalTasks}
          </div>
          <div className="mt-1 text-xs text-slate-500 font-mono tabular-nums">
            {summary.completedPercent}% от общего числа задач
          </div>
        </div>

        <div className="rounded-xl bg-[#11151F] border border-slate-800/90 p-4">
          <div className="text-xs text-slate-400">Объём в работе</div>
          <div className="mt-1.5 text-2xl font-semibold text-slate-100 font-mono tabular-nums">
            {summary.totalStoryPoints - summary.completedStoryPoints} SP
          </div>
          <div className="mt-1 text-xs text-slate-500 font-mono tabular-nums">
            Всего запланировано: {summary.totalStoryPoints} SP
          </div>
        </div>

        <div className="rounded-xl bg-[#11151F] border border-slate-800/90 p-4">
          <div className="text-xs text-slate-400">Критичные и высокие</div>
          <div className="mt-1.5 text-2xl font-semibold text-amber-400 font-mono tabular-nums">
            {priorityCounts.critical + priorityCounts.high}
          </div>
          <div className="mt-1 text-xs text-slate-500 font-mono tabular-nums">
            Критичных: {priorityCounts.critical} · Высоких: {priorityCounts.high}
          </div>
        </div>
      </div>

      {/* High-density stage breakdown table */}
      <div className="rounded-xl bg-[#11151F] border border-slate-800/90 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-800/80 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-100">
            Проходимость по этапам воронки
          </h2>
          <span className="text-xs text-slate-400 font-mono tabular-nums">
            Этапов: {summary.stages.length}
          </span>
        </div>

        {summary.stages.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">
            На доске пока нет этапов воронки. Создайте первый этап на вкладке «Канбан-доска».
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 text-xs text-slate-400">
                  <th className="py-3 px-5 font-medium">Этап</th>
                  <th className="py-3 px-4 font-medium text-right">Вес этапа</th>
                  <th className="py-3 px-4 font-medium text-right">Задач</th>
                  <th className="py-3 px-4 font-medium text-right">Оценка (SP)</th>
                  <th className="py-3 px-4 font-medium text-right">Доля</th>
                  <th className="py-3 px-4 font-medium">WIP-контроль</th>
                  <th className="py-3 px-5 font-medium w-48">Наполнение</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {summary.stages.map((stage) => (
                  <tr
                    key={stage.columnId}
                    className="hover:bg-slate-800/25 transition-colors"
                  >
                    <td className="py-3 px-5 font-medium text-slate-100">
                      {stage.order + 1}. {stage.title}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-400">
                      {stage.stageWeightPercent}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-200">
                      {stage.taskCount}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-200">
                      {stage.storyPoints} SP
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-300">
                      {stage.sharePercent}%
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {stage.wipLimit === null ? (
                        <span className="text-slate-500">Без лимита</span>
                      ) : stage.isOverWip ? (
                        <span className="inline-flex items-center gap-1.5 text-rose-400 font-medium">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>
                            Превышен ({stage.taskCount}/{stage.wipLimit})
                          </span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span className="font-mono tabular-nums">
                            {stage.taskCount}/{stage.wipLimit}
                          </span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-5">
                      <div className="h-1.5 w-full rounded-full bg-slate-900 overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-200',
                            stage.order === summary.stages.length - 1
                              ? 'bg-emerald-500'
                              : 'bg-indigo-500'
                          )}
                          style={{ width: `${stage.sharePercent}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
