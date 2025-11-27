/**
 * Layout Model for the Xibo CMS SDK
 * Location: src\models\Layout.ts
 */
import { Layout as GeneratedLayout, LayoutSearchParams as GeneratedLayoutSearchParams, Region } from '../generated/types/swagger-types';
import { z } from 'zod';

/**
 * Layout status enumeration
 */
export enum LayoutStatus {
  INVALID = 0,
  VALID = 1,
  BUILDING = 2,
  PUBLISHED = 3
}

/**
 * Published status enumeration
 */
export enum PublishedStatus {
  DRAFT = 'Draft',
  PUBLISHED = 'Published',
  PENDING_APPROVAL = 'Pending Approval'
}

/**
 * Layout orientation enumeration
 */
export enum LayoutOrientation {
  LANDSCAPE = 'landscape',
  PORTRAIT = 'portrait'
}

/**
 * Zod schema for Layout with runtime validation and transformations
 */
export const LayoutSchema = z.object({
  layoutId: z.number().optional(),
  ownerId: z.number().optional(),
  campaignId: z.number().optional(),
  parentId: z.number().optional(),
  publishedStatusId: z.number().optional(),
  publishedStatus: z.string().optional(),
  publishedDate: z.string().transform(str => str ? new Date(str) : undefined).optional(),
  backgroundImageId: z.number().optional(),
  schemaVersion: z.number().optional(),
  layout: z.string().optional(),
  description: z.string().optional(),
  backgroundColor: z.string().optional(),
  createdDt: z.string().transform(str => str ? new Date(str) : undefined).optional(),
  modifiedDt: z.string().transform(str => str ? new Date(str) : undefined).optional(),
  status: z.number().optional(),
  retired: z.boolean().optional(),
  backgroundzIndex: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  orientation: z.string().optional(),
  displayOrder: z.number().optional(),
  duration: z.number().optional(),
  statusMessage: z.string().optional(),
  enableStat: z.number().optional(),
  autoApplyTransitions: z.number().optional(),
  code: z.string().optional(),
  isLocked: z.boolean().optional(),
  regions: z.array(z.any()).optional(),
  tags: z.array(z.any()).optional(),
  folderId: z.number().optional(),
  permissionsFolderId: z.number().optional(),
}).passthrough(); // Allow additional properties from the generated interface

/**
 * Enhanced Layout model with business logic and utility methods
 * 
 * This class wraps the generated Layout interface and provides:
 * - Status enum handling (Published/Draft)
 * - Duration calculations and validation
 * - Region management utilities
 * - Background and styling utilities
 * - Layout lifecycle management
 */
export class Layout {
  constructor(private data: GeneratedLayout) {}

  // Enhanced getter methods with proper type transformations

  /**
   * Get the published date as a proper Date object
   */
  get publishedDate(): Date | undefined {
    return this.data.publishedDate ? new Date(this.data.publishedDate) : undefined;
  }

  /**
   * Get the created date as a proper Date object
   */
  get createdDate(): Date | undefined {
    return this.data.createdDt ? new Date(this.data.createdDt) : undefined;
  }

  /**
   * Get the modified date as a proper Date object
   */
  get modifiedDate(): Date | undefined {
    return this.data.modifiedDt ? new Date(this.data.modifiedDt) : undefined;
  }

  /**
   * Get the layout status as an enum
   */
  get layoutStatus(): LayoutStatus {
    return (this.data.status as LayoutStatus) || LayoutStatus.INVALID;
  }

  /**
   * Get the published status as an enum
   */
  get publishedStatusEnum(): PublishedStatus | undefined {
    if (!this.data.publishedStatus) return undefined;
    return this.data.publishedStatus as PublishedStatus;
  }

  /**
   * Get the orientation as an enum
   */
  get orientationEnum(): LayoutOrientation | undefined {
    if (!this.data.orientation) return undefined;
    return this.data.orientation as LayoutOrientation;
  }

  // Status checking methods

  /**
   * Check if the layout is published
   */
  isPublished(): boolean {
    return this.publishedStatusEnum === PublishedStatus.PUBLISHED;
  }

  /**
   * Check if the layout is a draft
   */
  isDraft(): boolean {
    return this.publishedStatusEnum === PublishedStatus.DRAFT;
  }

  /**
   * Check if the layout is pending approval
   */
  isPendingApproval(): boolean {
    return this.publishedStatusEnum === PublishedStatus.PENDING_APPROVAL;
  }

  /**
   * Check if the layout is valid (status = 1 or 2)
   */
  isValid(): boolean {
    return this.layoutStatus === LayoutStatus.VALID || this.layoutStatus === LayoutStatus.BUILDING;
  }

  /**
   * Check if the layout is currently building
   */
  isBuilding(): boolean {
    return this.layoutStatus === LayoutStatus.BUILDING;
  }

  /**
   * Check if the layout is retired
   */
  isRetired(): boolean {
    return Boolean(this.data.retired);
  }

  /**
   * Check if the layout is locked by another user
   */
  isLocked(): boolean {
    return Boolean(this.data.isLocked);
  }

  /**
   * Check if the layout has a parent (is a draft of another layout)
   */
  hasDraft(): boolean {
    return Boolean(this.data.parentId);
  }

  /**
   * Check if statistics are enabled for this layout
   */
  isStatEnabled(): boolean {
    return Boolean(this.data.enableStat);
  }

  /**
   * Check if auto-apply transitions is enabled
   */
  hasAutoApplyTransitions(): boolean {
    return Boolean(this.data.autoApplyTransitions);
  }

  // Duration and timing methods

  /**
   * Get the layout duration in seconds
   */
  getDuration(): number {
    return this.data.duration || 0;
  }

  /**
   * Get the layout duration formatted as HH:MM:SS
   */
  getFormattedDuration(): string {
    const duration = this.getDuration();
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Validate if the duration is reasonable (not too short or too long)
   */
  isDurationValid(): { valid: boolean; reason?: string } {
    const duration = this.getDuration();
    
    if (duration <= 0) {
      return { valid: false, reason: 'Duration must be greater than 0' };
    }
    
    if (duration < 1) {
      return { valid: false, reason: 'Duration too short (minimum 1 second)' };
    }
    
    if (duration > 86400) { // 24 hours
      return { valid: false, reason: 'Duration too long (maximum 24 hours)' };
    }
    
    return { valid: true };
  }

  // Region management utilities

  /**
   * Get all regions for this layout
   */
  getRegions(): Region[] {
    return this.data.regions || [];
  }

  /**
   * Get the number of regions in this layout
   */
  getRegionCount(): number {
    return this.getRegions().length;
  }

  /**
   * Find a region by ID
   */
  getRegionById(regionId: number): Region | undefined {
    return this.getRegions().find(region => region.regionId === regionId);
  }

  /**
   * Find regions by name
   */
  getRegionsByName(name: string): Region[] {
    return this.getRegions().filter(region => region.name === name);
  }

  /**
   * Get regions sorted by z-index (layering order)
   */
  getRegionsByZIndex(): Region[] {
    return [...this.getRegions()].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
  }

  /**
   * Check if the layout has any regions
   */
  hasRegions(): boolean {
    return this.getRegionCount() > 0;
  }

  /**
   * Get the total duration of all regions (longest region duration)
   */
  calculateTotalDuration(): number {
    const regions = this.getRegions();
    if (regions.length === 0) return 0;
    
    return Math.max(...regions.map(region => region.duration || 0));
  }

  /**
   * Validate region positioning (no overlaps, within bounds)
   */
  validateRegionPositioning(): { valid: boolean; issues: string[] } {
    const regions = this.getRegions();
    const issues: string[] = [];
    const layoutWidth = this.data.width || 1920;
    const layoutHeight = this.data.height || 1080;
    
    for (const region of regions) {
      // Check if region is within layout bounds
      const right = (region.left || 0) + (region.width || 0);
      const bottom = (region.top || 0) + (region.height || 0);
      
      if (right > layoutWidth) {
        issues.push(`Region ${region.name || region.regionId} extends beyond layout width`);
      }
      
      if (bottom > layoutHeight) {
        issues.push(`Region ${region.name || region.regionId} extends beyond layout height`);
      }
      
      // Check for negative positions
      if ((region.left || 0) < 0 || (region.top || 0) < 0) {
        issues.push(`Region ${region.name || region.regionId} has negative position`);
      }
      
      // Check for zero dimensions
      if ((region.width || 0) <= 0 || (region.height || 0) <= 0) {
        issues.push(`Region ${region.name || region.regionId} has invalid dimensions`);
      }
    }
    
    return {
      valid: issues.length === 0,
      issues
    };
  }

  // Background and styling utilities

  /**
   * Check if the layout has a background image
   */
  hasBackgroundImage(): boolean {
    return Boolean(this.data.backgroundImageId);
  }

  /**
   * Get the background color as a hex string
   */
  getBackgroundColor(): string | undefined {
    return this.data.backgroundColor;
  }

  /**
   * Check if the background color is valid hex
   */
  isBackgroundColorValid(): boolean {
    const color = this.getBackgroundColor();
    if (!color) return true; // No color is valid
    
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }

  /**
   * Get the background z-index
   */
  getBackgroundZIndex(): number {
    return this.data.backgroundzIndex || 0;
  }

  // Dimension and orientation utilities

  /**
   * Get layout dimensions
   */
  getDimensions(): { width: number; height: number } {
    return {
      width: this.data.width || 1920,
      height: this.data.height || 1080
    };
  }

  /**
   * Get the aspect ratio of the layout
   */
  getAspectRatio(): number {
    const { width, height } = this.getDimensions();
    return width / height;
  }

  /**
   * Check if the layout is landscape orientation
   */
  isLandscape(): boolean {
    return this.orientationEnum === LayoutOrientation.LANDSCAPE || this.getAspectRatio() > 1;
  }

  /**
   * Check if the layout is portrait orientation
   */
  isPortrait(): boolean {
    return this.orientationEnum === LayoutOrientation.PORTRAIT || this.getAspectRatio() < 1;
  }

  /**
   * Check if the layout is square
   */
  isSquare(): boolean {
    return this.getAspectRatio() === 1;
  }

  // Tag and metadata utilities

  /**
   * Get layout tags as a simple array of tag names
   */
  getTagNames(): string[] {
    return this.data.tags?.map(tag => tag.tag || '').filter(Boolean) || [];
  }

  /**
   * Check if layout has a specific tag
   */
  hasTag(tagName: string): boolean {
    return this.getTagNames().includes(tagName);
  }

  /**
   * Get the layout code identifier
   */
  getCode(): string | undefined {
    return this.data.code;
  }

  /**
   * Get the schema version
   */
  getSchemaVersion(): number {
    return this.data.schemaVersion || 1;
  }

  // Status and validation summary

  /**
   * Get a comprehensive status summary of the layout
   */
  getStatusSummary(): {
    isValid: boolean;
    isPublished: boolean;
    isDraft: boolean;
    isLocked: boolean;
    isRetired: boolean;
    hasRegions: boolean;
    regionCount: number;
    duration: number;
    durationValid: boolean;
    positioningValid: boolean;
    backgroundValid: boolean;
    lastModified?: Date;
  } {
    const durationValidation = this.isDurationValid();
    const positioningValidation = this.validateRegionPositioning();
    
    return {
      isValid: this.isValid(),
      isPublished: this.isPublished(),
      isDraft: this.isDraft(),
      isLocked: this.isLocked(),
      isRetired: this.isRetired(),
      hasRegions: this.hasRegions(),
      regionCount: this.getRegionCount(),
      duration: this.getDuration(),
      durationValid: durationValidation.valid,
      positioningValid: positioningValidation.valid,
      backgroundValid: this.isBackgroundColorValid(),
      ...(this.modifiedDate && { lastModified: this.modifiedDate })
    };
  }

  /**
   * Get detailed validation results
   */
  validate(): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check basic properties
    if (!this.data.layout) {
      errors.push('Layout name is required');
    }
    
    if (!this.data.width || !this.data.height) {
      errors.push('Layout dimensions are required');
    }
    
    // Check duration
    const durationValidation = this.isDurationValid();
    if (!durationValidation.valid && durationValidation.reason) {
      errors.push(durationValidation.reason);
    }
    
    // Check background color
    if (!this.isBackgroundColorValid()) {
      errors.push('Invalid background color format');
    }
    
    // Check region positioning
    const positioningValidation = this.validateRegionPositioning();
    if (!positioningValidation.valid) {
      errors.push(...positioningValidation.issues);
    }
    
    // Warnings
    if (!this.hasRegions()) {
      warnings.push('Layout has no regions');
    }
    
    if (this.getDuration() === 0) {
      warnings.push('Layout duration is 0 seconds');
    }
    
    if (this.isRetired()) {
      warnings.push('Layout is retired');
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Proxy all original properties from the generated interface
  get layoutId() { return this.data.layoutId; }
  get ownerId() { return this.data.ownerId; }
  get campaignId() { return this.data.campaignId; }
  get parentId() { return this.data.parentId; }
  get publishedStatusId() { return this.data.publishedStatusId; }
  get publishedStatus() { return this.data.publishedStatus; }
  get backgroundImageId() { return this.data.backgroundImageId; }
  get schemaVersion() { return this.data.schemaVersion; }
  get layout() { return this.data.layout; }
  get description() { return this.data.description; }
  get backgroundColor() { return this.data.backgroundColor; }
  get createdDt() { return this.data.createdDt; }
  get modifiedDt() { return this.data.modifiedDt; }
  get status() { return this.data.status; }
  get retired() { return this.data.retired; }
  get backgroundzIndex() { return this.data.backgroundzIndex; }
  get width() { return this.data.width; }
  get height() { return this.data.height; }
  get orientation() { return this.data.orientation; }
  get displayOrder() { return this.data.displayOrder; }
  get duration() { return this.data.duration; }
  get statusMessage() { return this.data.statusMessage; }
  get enableStat() { return this.data.enableStat; }
  get autoApplyTransitions() { return this.data.autoApplyTransitions; }
  get code() { return this.data.code; }
  get regions() { return this.data.regions; }
  get tags() { return this.data.tags; }
  get folderId() { return this.data.folderId; }
  get permissionsFolderId() { return this.data.permissionsFolderId; }

  /**
   * Convert the enhanced model back to the raw data format
   */
  toJSON(): GeneratedLayout {
    return this.data;
  }

  /**
   * Create a new Layout instance from raw API data
   */
  static fromApiData(data: GeneratedLayout): Layout {
    return new Layout(data);
  }

  /**
   * Validate and transform raw data using Zod schema
   */
  static validate(data: unknown): Layout {
    // First validate with Zod (this transforms dates)
    const validatedData = LayoutSchema.parse(data);
    
    // Convert back to the expected format for the generated interface
    const layoutData = {
      ...validatedData,
      // Convert Date objects back to ISO strings for the generated interface
      publishedDate: validatedData.publishedDate instanceof Date ? 
        validatedData.publishedDate.toISOString() : validatedData.publishedDate,
      createdDt: validatedData.createdDt instanceof Date ? 
        validatedData.createdDt.toISOString() : validatedData.createdDt,
      modifiedDt: validatedData.modifiedDt instanceof Date ? 
        validatedData.modifiedDt.toISOString() : validatedData.modifiedDt,
    } as GeneratedLayout;
    
    return new Layout(layoutData);
  }
}

// Re-export the generated search params interface for convenience
export type LayoutSearchParams = GeneratedLayoutSearchParams;

// Export the generated Layout interface for type compatibility
export type { GeneratedLayout as LayoutData };
