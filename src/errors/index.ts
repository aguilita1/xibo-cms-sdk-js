/**
 * Error classes for the Xibo CMS SDK
 */

import { XiboError } from './XiboError';
import { AuthenticationError } from './AuthenticationError';
import { RateLimitError } from './RateLimitError';

export { XiboError } from './XiboError';
export {
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
  ServerError,
} from './AuthenticationError';
export { RateLimitError } from './RateLimitError';

/**
 * Type guard to check if an error is a XiboError
 */
export function isXiboError(error: unknown): error is XiboError {
  return error instanceof XiboError;
}

/**
 * Type guard to check if an error is a RateLimitError
 */
export function isRateLimitError(error: unknown): error is RateLimitError {
  return error instanceof RateLimitError;
}

/**
 * Type guard to check if an error is an AuthenticationError
 */
export function isAuthenticationError(error: unknown): error is AuthenticationError {
  return error instanceof AuthenticationError;
}
