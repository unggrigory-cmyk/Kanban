import { BoardPage } from '@/src/pages/board';
import { QueryProvider } from './providers';

export function AppEntry() {
  return (
    <QueryProvider>
      <BoardPage />
    </QueryProvider>
  );
}
