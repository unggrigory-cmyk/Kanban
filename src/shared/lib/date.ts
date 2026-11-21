const shortDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
});

const timeFormatter = new Intl.DateTimeFormat('ru-RU', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

export function formatShortDate(isoOrDate: string): string {
  if (!isoOrDate) return '';
  const parsed = new Date(isoOrDate);
  if (Number.isNaN(parsed.getTime())) return isoOrDate;
  return shortDateFormatter.format(parsed);
}

export function formatTime(timestamp: number): string {
  return timeFormatter.format(new Date(timestamp));
}

export function isDateOverdue(dueDate?: string): boolean {
  if (!dueDate) return false;
  const parsed = new Date(dueDate);
  if (Number.isNaN(parsed.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parsed < today;
}
