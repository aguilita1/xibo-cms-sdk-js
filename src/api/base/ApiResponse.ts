/**
 * API response types and helper functions
 * Location: src\api\base\ApiResponse.ts
 */

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

/**
 * Paginated response for list endpoints
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Create a paginated response from API data
 */
export function createPaginatedResponse<T>(
  data: T[],
  total?: number,
  page: number = 1,
  pageSize: number = 25
): PaginatedResponse<T> {
  const actualTotal = total ?? data.length;
  const actualPage = Math.max(1, page);
  const actualPageSize = Math.max(1, pageSize);
  
  return {
    data,
    total: actualTotal,
    page: actualPage,
    pageSize: actualPageSize,
    hasNext: actualPage * actualPageSize < actualTotal,
    hasPrevious: actualPage > 1
  };
}
