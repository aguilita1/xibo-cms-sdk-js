/**
 * Rate Limit Error - Error thrown when rate limit is exceeded (HTTP 429)
 * Location: src\errors\RateLimitError.ts
 */
import { XiboError } from './XiboError';

/**
 * Error thrown when rate limit is exceeded (HTTP 429)
 */
export class RateLimitError extends XiboError {
  public readonly retryAfter?: number | undefined;
  public readonly remaining?: number | undefined;
  public readonly reset?: number | undefined;

  constructor(
    message: string = 'Rate limit exceeded',
    retryAfter?: number,
    remaining?: number,
    reset?: number,
    details?: unknown
  ) {
    super(message, 'RATE_LIMIT_ERROR', 429, details);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
    this.remaining = remaining;
    this.reset = reset;
  }

  /**
   * Create RateLimitError from response headers
   */
  static fromHeaders(
    headers: Record<string, string>,
    message: string = 'Rate limit exceeded'
  ): RateLimitError {
    const retryAfter = headers['retry-after'] ? parseInt(headers['retry-after'], 10) : undefined;
    const remaining = headers['x-ratelimit-remaining']
      ? parseInt(headers['x-ratelimit-remaining'], 10)
      : undefined;
    const reset = headers['x-ratelimit-reset']
      ? parseInt(headers['x-ratelimit-reset'], 10)
      : undefined;

    return new RateLimitError(message, retryAfter, remaining, reset, { headers });
  }

  /**
   * Get the delay in milliseconds before retrying
   */
  getRetryDelay(): number {
    if (this.retryAfter) {
      return this.retryAfter * 1000; // Convert seconds to milliseconds
    }
    // Default collection interval if no retry-after header
    return 60000; // 60 seconds
  }

  /**
   * Convert error to JSON representation with rate limit info
   */
  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      retryAfter: this.retryAfter,
      remaining: this.remaining,
      reset: this.reset,
    };
  }
}
