/** Dev-only structured logs for Recovery Room avatar/voice pipeline. */
const PREFIX = '[AmityRecovery]';

export function recoveryDebug(
  scope: string,
  message: string,
  data?: Record<string, unknown>
): void {
  if (process.env.NODE_ENV === 'production') return;
  if (data && Object.keys(data).length > 0) {
    console.info(`${PREFIX} [${scope}] ${message}`, data);
  } else {
    console.info(`${PREFIX} [${scope}] ${message}`);
  }
}

export function recoveryDebugWarn(
  scope: string,
  message: string,
  data?: Record<string, unknown>
): void {
  if (process.env.NODE_ENV === 'production') return;
  if (data && Object.keys(data).length > 0) {
    console.warn(`${PREFIX} [${scope}] ${message}`, data);
  } else {
    console.warn(`${PREFIX} [${scope}] ${message}`);
  }
}

export function recoveryDebugError(
  scope: string,
  message: string,
  err?: unknown,
  data?: Record<string, unknown>
): void {
  if (process.env.NODE_ENV === 'production') return;
  console.error(`${PREFIX} [${scope}] ${message}`, {
    ...data,
    error: err instanceof Error ? err.message : err,
    stack: err instanceof Error ? err.stack : undefined,
  });
}
