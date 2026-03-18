type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

/**
 * Structured logger for Playwright tests.
 * Outputs timestamped, levelled lines to stdout — captured in the HTML
 * report's test output section and Playwright trace viewer.
 */
export class Logger {
  private readonly context: string;
  private static readonly enableDebug = process.env.LOG_LEVEL === 'debug';

  constructor(context: string) {
    this.context = context;
  }

  debug(message: string, data?: unknown): void {
    if (Logger.enableDebug) {
      this.log('DEBUG', message, data);
    }
  }

  info(message: string, data?: unknown): void {
    this.log('INFO', message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log('WARN', message, data);
  }

  error(message: string, data?: unknown): void {
    this.log('ERROR', message, data);
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    const timestamp = new Date().toISOString();
    const dataStr = data !== undefined ? ` | ${JSON.stringify(data)}` : '';
    const line = `[${timestamp}] [${level}] [${this.context}] ${message}${dataStr}`;

    if (level === 'ERROR') {
      console.error(line);
    } else if (level === 'WARN') {
      console.warn(line);
    } else {
      console.log(line);
    }
  }
}
