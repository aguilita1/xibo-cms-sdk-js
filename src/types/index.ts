/**
 * Core types and interfaces for the Xibo CMS SDK
 * Location: src\types\index.ts
 */

/// <reference lib="dom" />

/**
 * SDK Configuration interface
 */
export interface XiboConfig {
  /** Base URL of the Xibo CMS instance */
  baseUrl: string;
  /** OAuth2 client ID */
  clientId: string;
  /** OAuth2 client secret */
  clientSecret: string;
  /** OAuth2 grant type */
  grantType: 'client_credentials' | 'authorization_code';
  /** Custom token endpoint URL (optional) */
  tokenEndpoint?: string;
  /** Custom authorization endpoint URL (optional) */
  authorizeEndpoint?: string;
  /** Maximum number of retry attempts for failed requests */
  maxRetries?: number;
  /** Collection interval in milliseconds for rate limiting */
  collectionInterval?: number;
  /** Logging level */
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  /** Request timeout in milliseconds */
  timeout?: number;
}

/**
 * Context interface for request cancellation and timeouts
 */
export interface Context {
  /** AbortSignal for request cancellation */
  signal?: AbortSignal;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Number of retry attempts for this specific request */
  retryAttempts?: number;
}

/**
 * Paginated response interface
 */
export interface PaginatedResponse<T> {
  /** Array of data items */
  data: T[];
  /** Total number of items available */
  total: number;
  /** Current page number */
  page: number;
  /** Number of items per page */
  pageSize: number;
  /** Whether there is a next page */
  hasNext: boolean;
  /** Whether there is a previous page */
  hasPrevious: boolean;
}

/**
 * Base pagination parameters
 */
export interface PaginationParams {
  /** Page number (1-based) */
  page?: number;
  /** Number of items per page */
  pageSize?: number;
  /** Sort field */
  sort?: string;
  /** Sort direction */
  order?: 'asc' | 'desc';
}

/**
 * Base search parameters
 */
export interface BaseSearchParams extends PaginationParams {
  /** Search term */
  search?: string;
  /** Filter by tags */
  tags?: string;
  /** Exact match for search */
  exactTags?: boolean;
}

/**
 * OAuth2 token response
 */
export interface TokenResponse {
  /** Access token */
  access_token: string;
  /** Token type (usually 'Bearer') */
  token_type: string;
  /** Token expiration time in seconds */
  expires_in: number;
  /** Refresh token (for authorization code flow) */
  refresh_token?: string | undefined;
  /** Token scope */
  scope?: string | undefined;
}

/**
 * Cached token information
 */
export interface CachedToken extends TokenResponse {
  /** Timestamp when token was obtained */
  obtained_at: number;
  /** Calculated expiration timestamp */
  expires_at: number;
}

/**
 * HTTP method types
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * HTTP request configuration
 */
export interface RequestConfig {
  /** HTTP method */
  method: HttpMethod;
  /** Request URL */
  url: string;
  /** Request headers */
  headers?: Record<string, string>;
  /** Request body data */
  data?: unknown;
  /** URL parameters */
  params?: Record<string, string | number | boolean>;
  /** Request timeout */
  timeout?: number;
  /** Retry configuration */
  retry?: {
    attempts: number;
    delay: number;
  };
}

/**
 * API response wrapper
 */
export interface ApiResponse<T = unknown> {
  /** Response data */
  data: T;
  /** HTTP status code */
  status: number;
  /** Response headers */
  headers: Record<string, string>;
  /** Request configuration that generated this response */
  config: RequestConfig;
}

/**
 * Error response from API
 */
export interface ApiErrorResponse {
  /** Error message */
  message: string;
  /** Error code */
  code?: string | number;
  /** Additional error details */
  details?: unknown;
  /** HTTP status code */
  status: number;
}

/**
 * Rate limit information
 */
export interface RateLimitInfo {
  /** Number of requests remaining */
  remaining: number;
  /** Rate limit reset time */
  reset: number;
  /** Retry after seconds (from 429 response) */
  retryAfter?: number;
}

/**
 * Log levels
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Logger interface
 */
export interface Logger {
  debug(message: string, meta?: unknown): void;
  info(message: string, meta?: unknown): void;
  warn(message: string, meta?: unknown): void;
  error(message: string, meta?: unknown): void;
}
