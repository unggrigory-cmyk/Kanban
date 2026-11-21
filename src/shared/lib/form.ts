export function getFirstErrorMessage(errors: unknown[]): string | undefined {
  for (const err of errors) {
    if (!err) continue;
    if (typeof err === 'string') return err;
    if (typeof err === 'object' && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
      return (err as { message: string }).message;
    }
  }
  return undefined;
}
