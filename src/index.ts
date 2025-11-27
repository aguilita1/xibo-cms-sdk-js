/**
 * Xibo CMS SDK for Node.js
 * 
 * A comprehensive Node.js library for the Xibo CMS API with OAuth2 authentication,
 * automatic retry logic, rate limiting support, and extensive error handling.
 */

// Import types and classes for internal use
import { XiboClient } from './client';
import type { XiboConfig } from './types';
import type { TokenStorage } from './auth';

// Main client
export { XiboClient } from './client';

// Configuration and types
export type { 
  XiboConfig, 
  Context, 
  PaginatedResponse, 
  PaginationParams, 
  BaseSearchParams,
  TokenResponse,
  CachedToken,
  HttpMethod,
  RequestConfig,
  ApiResponse,
  ApiErrorResponse,
  RateLimitInfo,
  LogLevel,
  Logger
} from './types';

// Authentication
export { 
  OAuth2Manager, 
  TokenManager, 
  TokenStorage, 
  MemoryTokenStorage 
} from './auth';
export type { OAuth2Config } from './auth';

// HTTP client
export { HttpClient } from './client';
export type { HttpClientConfig } from './client';

// Error classes
export {
  XiboError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
  ServerError,
  RateLimitError,
  isXiboError,
  isRateLimitError,
  isAuthenticationError
} from './errors';

// Utilities
export {
  createLogger,
  defaultLogger,
  createChildLogger,
  retryWithBackoff,
  retryWithCondition,
  isRetryableError,
  calculateDelay,
  sleep,
  createPaginatedResponse,
  parsePaginationFromHeaders,
  buildPaginationParams,
  validatePaginationParams,
  calculateOffset,
  calculatePage,
  mergePaginationParams,
  PaginatedIterator,
  DEFAULT_PAGINATION
} from './utils';
export type { RetryOptions } from './utils';

// Models
export * from './models';

// API classes
export { DisplaysApi } from './api/displays';
export { BaseApi } from './api/base';

// Default export
export default XiboClient;

/**
 * Create a new Xibo CMS SDK client instance
 */
export function createXiboClient(config: XiboConfig, tokenStorage?: TokenStorage): XiboClient {
  return new XiboClient(config, tokenStorage);
}

/**
 * SDK version
 */
export const VERSION = '0.1.0';

/**
 * SDK information
 */
export const SDK_INFO = {
  name: 'xibo-cms-sdk-js',
  version: VERSION,
  description: 'A comprehensive Node.js library for the Xibo CMS API',
  author: 'Xibo CMS SDK Contributors',
  repository: 'https://github.com/aguilita1/xibo-cms-sdk-js',
  license: 'MIT',
};
