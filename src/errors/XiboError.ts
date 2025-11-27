/**
 * Base error class for all Xibo SDK errors
 * Location: src\errors\XiboError.ts
 */
export class XiboError extends Error {
  public readonly code?: string | number | undefined;
  public readonly status?: number | undefined;
  public readonly details?: unknown;
  public readonly timestamp: number;

  constructor(
    message: string,
    code?: string | number,
    status?: number,
    details?: unknown
  ) {
    super(message);
    this.name = 'XiboError';
    this.code = code;
    this.status = status;
    this.details = details;
    this.timestamp = Date.now();

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if ('captureStackTrace' in Error && typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, XiboError);
    }
  }

  /**
   * Convert error to JSON representation
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      status: this.status,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }

  /**
   * Create error from API response
   */
  static fromApiResponse(
    message: string,
    status: number,
    code?: string | number,
    details?: unknown
  ): XiboError {
    return new XiboError(message, code, status, details);
  }
}
