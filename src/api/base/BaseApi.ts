import { HttpClient } from '../../client/HttpClient';

/**
 * Base class for all API endpoints
 */
export abstract class BaseApi {
  protected httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  /**
   * Build query parameters from an object
   */
  protected buildQueryParams(params: Record<string, any>): URLSearchParams {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          // Handle array parameters
          value.forEach(item => {
            searchParams.append(key, String(item));
          });
        } else {
          searchParams.append(key, String(value));
        }
      }
    });

    return searchParams;
  }

  /**
   * Build URL with query parameters
   */
  protected buildUrl(endpoint: string, params?: Record<string, any>): string {
    if (!params || Object.keys(params).length === 0) {
      return endpoint;
    }

    const queryParams = this.buildQueryParams(params);
    const queryString = queryParams.toString();
    
    return queryString ? `${endpoint}?${queryString}` : endpoint;
  }
}
