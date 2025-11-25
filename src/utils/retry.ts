import { Logger } from '../types';
import { RateLimitError } from '../errors';

/**
 * Retry configuration options
 */
export interface RetryOptions {
  /** Maximum number of retry attempts */
  maxAttempts: number;
  /** Initial delay in milliseconds */
  initialDelay: number;
  /** Maximum delay in milliseconds */
  maxDelay: number;
  /** Backoff multiplier */
  backoffMultiplier: number;
  /** Whether to add jitter to delays */
  jitter: boolean;
  /** Logger instance */
  logger?: Logger;
}

/**
 * Default retry options
 */
export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  jitter: true,
};

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof RateLimitError) {
    return true;
  }

  // Check for network errors or server errors (5xx)
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status: number }).status;
    return status >= 500 || status === 408 || status === 429;
  }

  // Check for common network error codes
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code;
    return ['ECONNRESET', 'ENOTFOUND', 'ECONNREFUSED', 'ETIMEDOUT'].includes(code);
  }

  return false;
}

/**
 * Calculate delay with exponential backoff and optional jitter
 */
export function calculateDelay(
  attempt: number,
  options: RetryOptions
): number {
  const { initialDelay, maxDelay, backoffMultiplier, jitter } = options;
  
  let delay = initialDelay * Math.pow(backoffMultiplier, attempt - 1);
  delay = Math.min(delay, maxDelay);

  if (jitter) {
    // Add random jitter (±25%)
    const jitterAmount = delay * 0.25;
    delay += (Math.random() - 0.5) * 2 * jitterAmount;
  }

  return Math.max(delay, 0);
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: unknown;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if error is not retryable
      if (!isRetryableError(error)) {
        config.logger?.debug('Error is not retryable, throwing immediately', { error });
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === config.maxAttempts) {
        config.logger?.error('Max retry attempts reached', { 
          attempt, 
          maxAttempts: config.maxAttempts, 
          error 
        });
        break;
      }

      // Calculate delay
      let delay: number;
      if (error instanceof RateLimitError) {
        delay = error.getRetryDelay();
        config.logger?.warn('Rate limit exceeded, waiting for retry-after delay', { 
          attempt, 
          delay,
          retryAfter: error.retryAfter 
        });
      } else {
        delay = calculateDelay(attempt, config);
        config.logger?.warn('Request failed, retrying with exponential backoff', { 
          attempt, 
          delay, 
          error 
        });
      }

      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Retry with custom retry condition
 */
export async function retryWithCondition<T>(
  fn: () => Promise<T>,
  shouldRetry: (error: unknown, attempt: number) => boolean,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: unknown;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check custom retry condition
      if (!shouldRetry(error, attempt)) {
        config.logger?.debug('Custom retry condition failed, throwing immediately', { 
          error, 
          attempt 
        });
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === config.maxAttempts) {
        config.logger?.error('Max retry attempts reached', { 
          attempt, 
          maxAttempts: config.maxAttempts, 
          error 
        });
        break;
      }

      const delay = calculateDelay(attempt, config);
      config.logger?.warn('Request failed, retrying', { attempt, delay, error });
      await sleep(delay);
    }
  }

  throw lastError;
}
