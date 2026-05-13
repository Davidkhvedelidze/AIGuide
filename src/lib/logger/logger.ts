type LogContext = Record<string, string | number | boolean | null | undefined>;

interface Logger {
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
}

const formatContext = (context?: LogContext): string => {
  if (!context) {
    return '';
  }

  return ` ${JSON.stringify(context)}`;
};

export const logger: Logger = {
  info(message, context) {
    console.info(`[info] ${message}${formatContext(context)}`);
  },
  warn(message, context) {
    console.warn(`[warn] ${message}${formatContext(context)}`);
  },
  error(message, context) {
    console.error(`[error] ${message}${formatContext(context)}`);
  },
};
