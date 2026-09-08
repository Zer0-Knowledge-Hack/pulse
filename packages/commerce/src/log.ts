/** Browser/server console tracer for the hire rail. Never log secrets. */

type ConsoleLike = {
  info?: (...args: unknown[]) => void;
  error?: (...args: unknown[]) => void;
};

function logger(): ConsoleLike | undefined {
  return (globalThis as { console?: ConsoleLike }).console;
}

export function commerceLog(message: string): void {
  logger()?.info?.(`[commerce] ${message}`);
}

export function commerceError(message: string, detail?: unknown): void {
  const log = logger();
  log?.error?.(`[commerce] hire:error ${message}`);
  if (detail === undefined) return;
  const text = detail instanceof Error ? detail.message : String(detail);
  if (!text) return;
  log?.error?.(`[commerce] hire:error detail=${text}`);
}
