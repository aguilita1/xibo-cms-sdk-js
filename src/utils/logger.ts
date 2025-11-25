import winston from 'winston';
import { Logger, LogLevel } from '../types';

/**
 * Default logger configuration
 */
const defaultFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

/**
 * Console format for development
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }: any) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level}]: ${message}${metaStr}`;
  })
);

/**
 * Create a Winston logger instance
 */
export function createLogger(level: LogLevel = 'info', silent: boolean = false): Logger {
  const winstonLogger = winston.createLogger({
    level,
    format: defaultFormat,
    silent,
    transports: [
      new winston.transports.Console({
        format: consoleFormat,
      }),
    ],
  });

  return {
    debug: (message: string, meta?: unknown): void => {
      winstonLogger.debug(message, meta);
    },
    info: (message: string, meta?: unknown): void => {
      winstonLogger.info(message, meta);
    },
    warn: (message: string, meta?: unknown): void => {
      winstonLogger.warn(message, meta);
    },
    error: (message: string, meta?: unknown): void => {
      winstonLogger.error(message, meta);
    },
  };
}

/**
 * Default logger instance
 */
export const defaultLogger = createLogger();

/**
 * Create a child logger with additional context
 */
export function createChildLogger(
  parentLogger: Logger,
  context: Record<string, unknown>
): Logger {
  return {
    debug: (message: string, meta?: unknown): void => {
      const combinedMeta = meta && typeof meta === 'object' && meta !== null
        ? { ...context, ...(meta as Record<string, unknown>) }
        : { ...context, meta };
      parentLogger.debug(message, combinedMeta);
    },
    info: (message: string, meta?: unknown): void => {
      const combinedMeta = meta && typeof meta === 'object' && meta !== null
        ? { ...context, ...(meta as Record<string, unknown>) }
        : { ...context, meta };
      parentLogger.info(message, combinedMeta);
    },
    warn: (message: string, meta?: unknown): void => {
      const combinedMeta = meta && typeof meta === 'object' && meta !== null
        ? { ...context, ...(meta as Record<string, unknown>) }
        : { ...context, meta };
      parentLogger.warn(message, combinedMeta);
    },
    error: (message: string, meta?: unknown): void => {
      const combinedMeta = meta && typeof meta === 'object' && meta !== null
        ? { ...context, ...(meta as Record<string, unknown>) }
        : { ...context, meta };
      parentLogger.error(message, combinedMeta);
    },
  };
}
