/**
 * Display Model for the Xibo CMS SDK
 * Location: src\models\Display.ts
 */
import { Display as GeneratedDisplay, DisplaySearchParams as GeneratedDisplaySearchParams } from '../generated/types/swagger-types';
import { z } from 'zod';

/**
 * Zod schema for Display with runtime validation and transformations
 */
export const DisplaySchema = z.object({
  displayId: z.number().optional(),
  display: z.string().optional(),
  auditingUntil: z.string().transform(str => str ? new Date(str) : undefined).optional(),
  licensed: z.boolean().optional(),
  loggedIn: z.boolean().optional(),
  lastAccessed: z.string().transform(str => str ? new Date(str) : undefined).optional(),
  incSchedule: z.boolean().optional(),
  emailAlert: z.boolean().optional(),
  wakeOnLanEnabled: z.boolean().optional(),
  retired: z.boolean().optional(),
  createdDt: z.string().transform(str => str ? new Date(str) : undefined).optional(),
  modifiedDt: z.string().transform(str => str ? new Date(str) : undefined).optional(),
  // Add other fields as needed with appropriate transformations
}).passthrough(); // Allow additional properties from the generated interface

/**
 * Enhanced Display model with business logic and utility methods
 * 
 * This class wraps the generated Display interface and provides:
 * - Type-safe property access
 * - Business logic methods
 * - Date/boolean transformations
 * - Utility functions for common operations
 */
export class Display {
  constructor(private data: GeneratedDisplay) {}

  // Enhanced getter methods with proper type transformations
  
  /**
   * Check if the display is currently licensed
   */
  get isLicensed(): boolean {
    return Boolean(this.data.licensed);
  }

  /**
   * Check if the display is currently logged in
   */
  get isLoggedIn(): boolean {
    return Boolean(this.data.loggedIn);
  }

  /**
   * Get the auditing until date as a proper Date object
   */
  get auditingUntilDate(): Date | undefined {
    return this.data.auditingUntil ? new Date(this.data.auditingUntil) : undefined;
  }

  /**
   * Get the last accessed date as a proper Date object
   */
  get lastAccessedDate(): Date | undefined {
    return this.data.lastAccessed ? new Date(this.data.lastAccessed) : undefined;
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

  // Business logic methods

  /**
   * Check if auditing is currently active for this display
   */
  isAuditingActive(): boolean {
    const until = this.auditingUntilDate;
    return until ? until > new Date() : false;
  }

  /**
   * Check if the display should send email alerts
   */
  shouldSendEmailAlerts(): boolean {
    return Boolean(this.data.emailAlert);
  }

  /**
   * Check if Wake on LAN is enabled
   */
  isWakeOnLanEnabled(): boolean {
    return Boolean(this.data.wakeOnLanEnabled);
  }

  /**
   * Check if the display includes the default layout in schedule
   */
  includesSchedule(): boolean {
    return Boolean(this.data.incSchedule);
  }

  /**
   * Check if the display is retired
   */
  isRetired(): boolean {
    return Boolean((this.data as any).retired);
  }

  /**
   * Check if the display is mobile
   */
  isMobileDisplay(): boolean {
    return Boolean(this.data.isMobile);
  }

  /**
   * Check if the display is outdoor
   */
  isOutdoorDisplay(): boolean {
    return Boolean(this.data.isOutdoor);
  }

  /**
   * Get a summary of the display's current status
   */
  getStatusSummary(): {
    isOnline: boolean;
    isLicensed: boolean;
    hasRecentActivity: boolean;
    auditingStatus: 'active' | 'inactive' | 'expired';
    lastSeen?: Date;
  } {
    const lastSeen = this.lastAccessedDate;
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    return {
      isOnline: this.isLoggedIn,
      isLicensed: this.isLicensed,
      hasRecentActivity: lastSeen ? lastSeen > oneHourAgo : false,
      auditingStatus: this.isAuditingActive() ? 'active' : 
                     this.auditingUntilDate ? 'expired' : 'inactive',
      ...(lastSeen && { lastSeen })
    };
  }

  /**
   * Get storage information with calculated percentages
   */
  getStorageInfo(): {
    availableBytes: number;
    totalBytes: number;
    usedBytes: number;
    usedPercentage: number;
    availablePercentage: number;
  } | null {
    const available = this.data.storageAvailableSpace;
    const total = this.data.storageTotalSpace;
    
    if (typeof available !== 'number' || typeof total !== 'number' || total === 0) {
      return null;
    }
    
    const used = total - available;
    const usedPercentage = (used / total) * 100;
    const availablePercentage = (available / total) * 100;
    
    return {
      availableBytes: available,
      totalBytes: total,
      usedBytes: used,
      usedPercentage: Math.round(usedPercentage * 100) / 100,
      availablePercentage: Math.round(availablePercentage * 100) / 100
    };
  }

  /**
   * Get display resolution as width x height
   */
  getResolutionString(): string | undefined {
    return this.data.resolution;
  }

  /**
   * Parse resolution string into width and height
   */
  getResolutionDimensions(): { width: number; height: number } | null {
    const resolution = this.data.resolution;
    if (!resolution) return null;
    
    const match = resolution.match(/^(\d+)x(\d+)$/);
    if (!match || !match[1] || !match[2]) return null;
    
    return {
      width: parseInt(match[1], 10),
      height: parseInt(match[2], 10)
    };
  }

  /**
   * Check if the display has any reported faults
   */
  hasFaults(): boolean {
    return (this.data.countFaults || 0) > 0;
  }

  /**
   * Get the number of reported faults
   */
  getFaultCount(): number {
    return this.data.countFaults || 0;
  }

  /**
   * Get display tags as a simple array of tag names
   */
  getTagNames(): string[] {
    return this.data.tags?.map(tag => tag.tag || '').filter(Boolean) || [];
  }

  /**
   * Check if display has a specific tag
   */
  hasTag(tagName: string): boolean {
    return this.getTagNames().includes(tagName);
  }

  // Proxy all original properties from the generated interface
  get displayId() { return this.data.displayId; }
  get displayTypeId() { return this.data.displayTypeId; }
  get venueId() { return this.data.venueId; }
  get address() { return this.data.address; }
  get isMobile() { return this.data.isMobile; }
  get languages() { return this.data.languages; }
  get displayType() { return this.data.displayType; }
  get screenSize() { return this.data.screenSize; }
  get isOutdoor() { return this.data.isOutdoor; }
  get customId() { return this.data.customId; }
  get costPerPlay() { return this.data.costPerPlay; }
  get impressionsPerPlay() { return this.data.impressionsPerPlay; }
  get ref1() { return this.data.ref1; }
  get ref2() { return this.data.ref2; }
  get ref3() { return this.data.ref3; }
  get ref4() { return this.data.ref4; }
  get ref5() { return this.data.ref5; }
  get auditingUntil() { return this.data.auditingUntil; }
  get display() { return this.data.display; }
  get description() { return this.data.description; }
  get defaultLayoutId() { return this.data.defaultLayoutId; }
  get license() { return this.data.license; }
  get licensed() { return this.data.licensed; }
  get loggedIn() { return this.data.loggedIn; }
  get lastAccessed() { return this.data.lastAccessed; }
  get incSchedule() { return this.data.incSchedule; }
  get emailAlert() { return this.data.emailAlert; }
  get alertTimeout() { return this.data.alertTimeout; }
  get clientAddress() { return this.data.clientAddress; }
  get mediaInventoryStatus() { return this.data.mediaInventoryStatus; }
  get macAddress() { return this.data.macAddress; }
  get lastChanged() { return this.data.lastChanged; }
  get numberOfMacAddressChanges() { return this.data.numberOfMacAddressChanges; }
  get lastWakeOnLanCommandSent() { return this.data.lastWakeOnLanCommandSent; }
  get wakeOnLanEnabled() { return this.data.wakeOnLanEnabled; }
  get wakeOnLanTime() { return this.data.wakeOnLanTime; }
  get broadCastAddress() { return this.data.broadCastAddress; }
  get secureOn() { return this.data.secureOn; }
  get cidr() { return this.data.cidr; }
  get latitude() { return this.data.latitude; }
  get longitude() { return this.data.longitude; }
  get clientType() { return this.data.clientType; }
  get clientVersion() { return this.data.clientVersion; }
  get clientCode() { return this.data.clientCode; }
  get displayProfileId() { return this.data.displayProfileId; }
  get currentLayoutId() { return this.data.currentLayoutId; }
  get screenShotRequested() { return this.data.screenShotRequested; }
  get storageAvailableSpace() { return this.data.storageAvailableSpace; }
  get storageTotalSpace() { return this.data.storageTotalSpace; }
  get displayGroupId() { return this.data.displayGroupId; }
  get currentLayout() { return this.data.currentLayout; }
  get defaultLayout() { return this.data.defaultLayout; }
  get displayGroups() { return this.data.displayGroups; }
  get xmrChannel() { return this.data.xmrChannel; }
  get xmrPubKey() { return this.data.xmrPubKey; }
  get lastCommandSuccess() { return this.data.lastCommandSuccess; }
  get deviceName() { return this.data.deviceName; }
  get timeZone() { return this.data.timeZone; }
  get tags() { return this.data.tags; }
  get overrideConfig() { return this.data.overrideConfig; }
  get bandwidthLimit() { return this.data.bandwidthLimit; }
  get newCmsAddress() { return this.data.newCmsAddress; }
  get newCmsKey() { return this.data.newCmsKey; }
  get orientation() { return this.data.orientation; }
  get resolution() { return this.data.resolution; }
  get commercialLicence() { return this.data.commercialLicence; }
  get teamViewerSerial() { return this.data.teamViewerSerial; }
  get webkeySerial() { return this.data.webkeySerial; }
  get groupsWithPermissions() { return this.data.groupsWithPermissions; }
  get createdDt() { return this.data.createdDt; }
  get modifiedDt() { return this.data.modifiedDt; }
  get folderId() { return this.data.folderId; }
  get permissionsFolderId() { return this.data.permissionsFolderId; }
  get countFaults() { return this.data.countFaults; }
  get lanIpAddress() { return this.data.lanIpAddress; }
  get syncGroupId() { return this.data.syncGroupId; }
  get osVersion() { return this.data.osVersion; }
  get osSdk() { return this.data.osSdk; }
  get manufacturer() { return this.data.manufacturer; }
  get brand() { return this.data.brand; }
  get model() { return this.data.model; }

  /**
   * Convert the enhanced model back to the raw data format
   */
  toJSON(): GeneratedDisplay {
    return this.data;
  }

  /**
   * Create a new Display instance from raw API data
   */
  static fromApiData(data: GeneratedDisplay): Display {
    return new Display(data);
  }

  /**
   * Validate and transform raw data using Zod schema
   */
  static validate(data: unknown): Display {
    // First validate with Zod (this transforms dates)
    const validatedData = DisplaySchema.parse(data);
    
    // Convert back to the expected format for the generated interface
    const displayData = {
      ...validatedData,
      // Convert Date objects back to ISO strings for the generated interface
      auditingUntil: validatedData.auditingUntil instanceof Date ? 
        validatedData.auditingUntil.toISOString() : validatedData.auditingUntil,
      lastAccessed: validatedData.lastAccessed instanceof Date ? 
        validatedData.lastAccessed.toISOString() : validatedData.lastAccessed,
      createdDt: validatedData.createdDt instanceof Date ? 
        validatedData.createdDt.toISOString() : validatedData.createdDt,
      modifiedDt: validatedData.modifiedDt instanceof Date ? 
        validatedData.modifiedDt.toISOString() : validatedData.modifiedDt,
    } as GeneratedDisplay;
    
    return new Display(displayData);
  }
}

// Re-export the generated search params interface for convenience
export type DisplaySearchParams = GeneratedDisplaySearchParams;

// Export the generated Display interface for type compatibility
export type { GeneratedDisplay as DisplayData };
