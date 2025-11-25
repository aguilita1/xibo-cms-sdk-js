import { PaginatedResponse, PaginationParams } from '../types';

/**
 * Create a paginated response from API data
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / pageSize);
  
  return {
    data,
    total,
    page,
    pageSize,
    hasNext: page < totalPages,
    hasPrevious: page > 1,
  };
}

/**
 * Parse pagination parameters from API response headers
 */
export function parsePaginationFromHeaders(
  headers: Record<string, string>,
  data: unknown[],
  params: PaginationParams
): PaginatedResponse<unknown> {
  // Try to get total from various header formats
  const total = parseInt(
    headers['x-total-count'] || 
    headers['x-total'] || 
    headers['total-count'] || 
    '0',
    10
  );

  const page = params.page || 1;
  const pageSize = params.pageSize || data.length;

  return createPaginatedResponse(data, total, page, pageSize);
}

/**
 * Build query parameters for pagination
 */
export function buildPaginationParams(params: PaginationParams): Record<string, string> {
  const queryParams: Record<string, string> = {};

  if (params.page !== undefined) {
    queryParams['page'] = params.page.toString();
  }

  if (params.pageSize !== undefined) {
    queryParams['pageSize'] = params.pageSize.toString();
  }

  if (params.sort) {
    queryParams['sort'] = params.sort;
  }

  if (params.order) {
    queryParams['order'] = params.order;
  }

  return queryParams;
}

/**
 * Validate pagination parameters
 */
export function validatePaginationParams(params: PaginationParams): void {
  if (params.page !== undefined && params.page < 1) {
    throw new Error('Page number must be greater than 0');
  }

  if (params.pageSize !== undefined && params.pageSize < 1) {
    throw new Error('Page size must be greater than 0');
  }

  if (params.pageSize !== undefined && params.pageSize > 1000) {
    throw new Error('Page size cannot exceed 1000');
  }

  if (params.order && !['asc', 'desc'].includes(params.order)) {
    throw new Error('Order must be either "asc" or "desc"');
  }
}

/**
 * Calculate offset from page and page size
 */
export function calculateOffset(page: number, pageSize: number): number {
  return (page - 1) * pageSize;
}

/**
 * Calculate page from offset and page size
 */
export function calculatePage(offset: number, pageSize: number): number {
  return Math.floor(offset / pageSize) + 1;
}

/**
 * Merge pagination parameters with defaults
 */
export function mergePaginationParams(
  params: PaginationParams,
  defaults: Required<PaginationParams>
): Required<PaginationParams> {
  return {
    page: params.page ?? defaults.page,
    pageSize: params.pageSize ?? defaults.pageSize,
    sort: params.sort ?? defaults.sort,
    order: params.order ?? defaults.order,
  };
}

/**
 * Default pagination parameters
 */
export const DEFAULT_PAGINATION: Required<PaginationParams> = {
  page: 1,
  pageSize: 25,
  sort: 'id',
  order: 'asc',
};

/**
 * Iterator for paginated results
 */
export class PaginatedIterator<T> {
  private currentPage = 1;
  private hasMorePages = true;

  constructor(
    private fetchPage: (page: number) => Promise<PaginatedResponse<T>>
  ) {}

  /**
   * Get the next page of results
   */
  async next(): Promise<{ value: T[]; done: boolean }> {
    if (!this.hasMorePages) {
      return { value: [], done: true };
    }

    const response = await this.fetchPage(this.currentPage);
    this.hasMorePages = response.hasNext;
    this.currentPage++;

    return { value: response.data, done: false };
  }

  /**
   * Iterate through all pages
   */
  async *[Symbol.asyncIterator](): AsyncIterableIterator<T[]> {
    while (this.hasMorePages) {
      const result = await this.next();
      if (result.done) {
        break;
      }
      yield result.value;
    }
  }

  /**
   * Get all results from all pages
   */
  async all(): Promise<T[]> {
    const allResults: T[] = [];
    
    for await (const pageResults of this) {
      allResults.push(...pageResults);
    }

    return allResults;
  }
}
