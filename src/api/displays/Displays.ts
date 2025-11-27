/**
 * Xibo CMS API client for managing displays.
 * Location: src\api\displays\Displays.ts
 */
import { BaseApi } from '../base/BaseApi';
import { PaginatedResponse, createPaginatedResponse } from '../base/ApiResponse';
import { Display, DisplaySearchParams } from '../../models/Display';
import { Display as GeneratedDisplay } from '../../generated/types/swagger-types';
import { Context } from '../../types';
import { NotFoundError } from '../../errors';

/**
 * API class for managing Xibo Displays
 */
export class Displays extends BaseApi {
  /**
   * Search for displays
   */
  async search(params: DisplaySearchParams = {}, context?: Context): Promise<PaginatedResponse<Display>> {
    // Convert params to the format expected by HttpClient
    const queryParams = this.buildQueryParams(params);
    const searchParams: Record<string, string | number | boolean> = {};
    
    queryParams.forEach((value, key) => {
      searchParams[key] = value;
    });
    
    const response = await this.httpClient.get<GeneratedDisplay[]>('/display', searchParams, context);
    
    // Transform raw API response to enhanced models
    const displays = response.data.map(raw => Display.fromApiData(raw));
    
    // Extract total count from headers if available
    const totalHeader = response.headers['x-total-count'];
    const total = totalHeader ? parseInt(totalHeader, 10) : undefined;
    
    return createPaginatedResponse(displays, total);
  }

  /**
   * Get a specific display by ID
   */
  async get(displayId: number, context?: Context): Promise<Display> {
    // Use the display parameter instead of displayId for search
    const displays = await this.search({ display: displayId.toString() }, context);
    
    if (displays.data.length === 0) {
      throw new NotFoundError(`Display with ID ${displayId} not found`);
    }
    
    const display = displays.data[0];
    if (!display) {
      throw new NotFoundError(`Display with ID ${displayId} not found`);
    }
    
    return display;
  }

  /**
   * Update a display
   */
  async update(displayId: number, data: Partial<GeneratedDisplay>, context?: Context): Promise<Display> {
    const response = await this.httpClient.put<GeneratedDisplay>(`/display/${displayId}`, data, context);
    return Display.fromApiData(response.data);
  }

  /**
   * Delete a display
   */
  async delete(displayId: number, context?: Context): Promise<void> {
    await this.httpClient.delete(`/display/${displayId}`, context);
  }

  /**
   * Request a screenshot from a display
   */
  async requestScreenshot(displayId: number, context?: Context): Promise<Display> {
    const response = await this.httpClient.put<GeneratedDisplay>(`/display/requestscreenshot/${displayId}`, {}, context);
    return Display.fromApiData(response.data);
  }

  /**
   * Send Wake on LAN command to a display
   */
  async wakeOnLan(displayId: number, context?: Context): Promise<void> {
    await this.httpClient.post(`/display/wol/${displayId}`, {}, context);
  }

  /**
   * Toggle authorized status for a display
   */
  async toggleAuthorize(displayId: number, context?: Context): Promise<void> {
    await this.httpClient.put(`/display/authorise/${displayId}`, {}, context);
  }

  /**
   * Set default layout for a display
   */
  async setDefaultLayout(displayId: number, layoutId: number, context?: Context): Promise<void> {
    await this.httpClient.put(`/display/defaultlayout/${displayId}`, { layoutId }, context);
  }

  /**
   * Request license check for a display
   */
  async licenseCheck(displayId: number, context?: Context): Promise<void> {
    await this.httpClient.put(`/display/licenceCheck/${displayId}`, {}, context);
  }

  /**
   * Get display status information
   */
  async getStatus(displayId: number, context?: Context): Promise<string[]> {
    const response = await this.httpClient.get<string[]>(`/display/status/${displayId}`, undefined, context);
    return response.data;
  }

  /**
   * Purge all media from a display
   */
  async purgeAll(displayId: number, context?: Context): Promise<void> {
    await this.httpClient.put(`/display/purgeAll/${displayId}`, {}, context);
  }
}
