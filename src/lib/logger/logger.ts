type LogContext = Record<string, string | number | boolean | null | undefined>;

const sanitizeContext = (context?: LogContext): LogContext | undefined => context;

export const logger = {
  info(message: string, context?: LogContext): void {
    console.info(message, sanitizeContext(context));
  },
  warn(message: string, context?: LogContext): void {
    console.warn(message, sanitizeContext(context));
  },
  error(message: string, context?: LogContext): void {
    console.error(message, sanitizeContext(context));
  },
};
