import { XiboError } from './XiboError';

/**
 * Error thrown when authentication fails (HTTP 401)
 */
export class AuthenticationError extends XiboError {
  constructor(message: string = 'Authentication failed', details?: unknown) {
    super(message, 'AUTHENTICATION_ERROR', 401, details);
    this.name = 'AuthenticationError';
  }
}

/**
 * Error thrown when authorization fails (HTTP 403)
 */
export class AuthorizationError extends XiboError {
  constructor(message: string = 'Authorization failed', details?: unknown) {
    super(message, 'AUTHORIZATION_ERROR', 403, details);
    this.name = 'AuthorizationError';
  }
}

/**
 * Error thrown when a resource is not found (HTTP 404)
 */
export class NotFoundError extends XiboError {
  constructor(message: string = 'Resource not found', details?: unknown) {
    super(message, 'NOT_FOUND_ERROR', 404, details);
    this.name = 'NotFoundError';
  }
}

/**
 * Error thrown when request validation fails (HTTP 400)
 */
export class ValidationError extends XiboError {
  constructor(message: string = 'Validation failed', details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

/**
 * Error thrown when server returns 5xx errors
 */
export class ServerError extends XiboError {
  constructor(message: string = 'Server error', status: number = 500, details?: unknown) {
    super(message, 'SERVER_ERROR', status, details);
    this.name = 'ServerError';
  }
}
