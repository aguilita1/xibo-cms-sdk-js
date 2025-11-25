import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { OAuth2Manager } from '../auth';
import { 
  RequestConfig, 
  ApiResponse, 
  Context, 
  Logger, 
  RateLimitInfo 
} from '../types';
import { 
  XiboError, 
  AuthenticationError, 
  AuthorizationError, 
  NotFoundError, 
  ValidationError, 
  ServerError, 
  RateLimitError 
} from '../errors';
import { retryWithBackoff, RetryOptions } from '../utils/retry';

/**
 * HTTP client configuration
 */
export interface HttpClientConfig {
  baseUrl: string;
  timeout?: number;
  maxRetries?: number;
  collectionInterval?: number;
  logger?: Logger;
}

/**
 * HTTP client for making requests to the Xibo CMS API
 */
export class HttpClient {
  private readonly axios: AxiosInstance;
  private readonly config: HttpClientConfig;
  private readonly oauth2Manager: OAuth2Manager;

  constructor(
    config: HttpClientConfig,
    oauth2Manager: OAuth2Manager,
    private readonly logger?: Logger
  ) {
    this.config = config;
    this.oauth2Manager = oauth2Manager;

    // Create axios instance
    this.axios = axios.create({
      baseURL: config.baseUrl.replace(/\/$/, ''),
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'xibo-cms-sdk-js/0.1.0',
      },
    });

    // Setup request interceptor for authentication
    this.axios.interceptors.request.use(
      async (config) => {
        try {
          const token = await this.oauth2Manager.refreshTokenIfNeeded();
          config.headers = config.headers || {};
          config.headers['Authorization'] = `Bearer ${token}`;
          
          this.logger?.debug('HTTP request', {
            method: config.method?.toUpperCase(),
            url: config.url,
            params: config.params,
          });
          
          return config;
        } catch (error) {
          this.logger?.error('Failed to get authentication token', { error });
          throw new AuthenticationError('Failed to authenticate request');
        }
      },
      (error) => {
        this.logger?.error('Request interceptor error', { error });
        return Promise.reject(error);
      }
    );

    // Setup response interceptor for error handling
    this.axios.interceptors.response.use(
      (response) => {
        this.logger?.debug('HTTP response', {
          status: response.status,
          url: response.config.url,
          headers: response.headers,
        });
        return response;
      },
      (error: AxiosError) => {
        const apiError = this.handleResponseError(error);
        this.logger?.error('HTTP response error', { 
          error: apiError,
          status: error.response?.status,
          url: error.config?.url,
        });
        return Promise.reject(apiError);
      }
    );
  }

  /**
   * Make an HTTP request with retry logic
   */
  async request<T = unknown>(
    config: RequestConfig,
    context?: Context
  ): Promise<ApiResponse<T>> {
    const retryOptions: Partial<RetryOptions> = {
      maxAttempts: context?.retryAttempts ?? this.config.maxRetries ?? 3,
      ...(this.logger && { logger: this.logger }),
    };

    return retryWithBackoff(async () => {
      const axiosConfig: AxiosRequestConfig = {
        method: config.method,
        url: config.url,
        ...(config.headers && { headers: config.headers }),
        data: config.data,
        ...(config.params && { params: config.params }),
        ...((context?.timeout ?? config.timeout) && { timeout: context?.timeout ?? config.timeout }),
        ...(context?.signal && { signal: context?.signal }),
      };

      const response = await this.axios.request<T>(axiosConfig);
      
      return {
        data: response.data,
        status: response.status,
        headers: this.normalizeHeaders(response.headers),
        config,
      };
    }, retryOptions);
  }

  /**
   * GET request
   */
  async get<T = unknown>(
    url: string,
    params?: Record<string, string | number | boolean>,
    context?: Context
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'GET',
      url,
      ...(params && { params }),
    }, context);
  }

  /**
   * POST request
   */
  async post<T = unknown>(
    url: string,
    data?: unknown,
    context?: Context
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'POST',
      url,
      data,
    }, context);
  }

  /**
   * PUT request
   */
  async put<T = unknown>(
    url: string,
    data?: unknown,
    context?: Context
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'PUT',
      url,
      data,
    }, context);
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(
    url: string,
    context?: Context
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'DELETE',
      url,
    }, context);
  }

  /**
   * PATCH request
   */
  async patch<T = unknown>(
    url: string,
    data?: unknown,
    context?: Context
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'PATCH',
      url,
      data,
    }, context);
  }

  /**
   * Handle response errors and convert to appropriate error types
   */
  private handleResponseError(error: AxiosError): XiboError {
    const response = error.response;
    const status = response?.status || 0;
    const data = response?.data as any;
    
    // Extract error message
    let message = 'Request failed';
    if (data?.message) {
      message = data.message;
    } else if (data?.error) {
      message = data.error;
    } else if (error.message) {
      message = error.message;
    }

    // Handle specific HTTP status codes
    switch (status) {
      case 401:
        return new AuthenticationError(message, data);
      
      case 403:
        return new AuthorizationError(message, data);
      
      case 404:
        return new NotFoundError(message, data);
      
      case 400:
      case 422:
        return new ValidationError(message, data);
      
      case 429:
        return RateLimitError.fromHeaders(
          this.normalizeHeaders(response?.headers || {}),
          message
        );
      
      default:
        if (status >= 500) {
          return new ServerError(message, status, data);
        }
        return new XiboError(message, status.toString(), status, data);
    }
  }

  /**
   * Normalize response headers to Record<string, string>
   */
  private normalizeHeaders(headers: any): Record<string, string> {
    const normalized: Record<string, string> = {};
    
    if (headers && typeof headers === 'object') {
      for (const [key, value] of Object.entries(headers)) {
        if (typeof value === 'string') {
          normalized[key.toLowerCase()] = value;
        } else if (value !== undefined && value !== null) {
          normalized[key.toLowerCase()] = String(value);
        }
      }
    }
    
    return normalized;
  }

  /**
   * Extract rate limit information from response headers
   */
  getRateLimitInfo(headers: Record<string, string>): RateLimitInfo | null {
    const remaining = headers['x-ratelimit-remaining'];
    const reset = headers['x-ratelimit-reset'];
    const retryAfter = headers['retry-after'];

    if (!remaining && !reset && !retryAfter) {
      return null;
    }

    const rateLimitInfo: RateLimitInfo = {
      remaining: remaining ? parseInt(remaining, 10) : 0,
      reset: reset ? parseInt(reset, 10) : 0,
    };

    if (retryAfter) {
      (rateLimitInfo as any).retryAfter = parseInt(retryAfter, 10);
    }

    return rateLimitInfo;
  }

  /**
   * Get the base URL
   */
  getBaseUrl(): string {
    return this.config.baseUrl;
  }

  /**
   * Update request timeout
   */
  setTimeout(timeout: number): void {
    this.axios.defaults.timeout = timeout;
  }
}
