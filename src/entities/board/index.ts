export type {
  BoardSnapshot,
  FunnelProgressSummary,
  FunnelStageMetrics,
} from './model/types';
export { useBoardStore } from './model/store';
export { useBoardQuery, useBoardMutations, BOARD_QUERY_KEY } from './model/queries';
export { calculateFunnelProgress } from './lib/funnelProgress';
