/**
 * Unit tests for Display Model
 * Location: tests/models/Display.test.ts
 */

import { Display, DisplaySchema } from '../../src/models/Display';
import { Display as GeneratedDisplay } from '../../src/generated/types/swagger-types';

describe('Display Model', () => {
  // Sample display data for testing
  const sampleDisplayData: GeneratedDisplay = {
    displayId: 1,
    display: 'Test Display',
    description: 'A test display for unit testing',
    auditingUntil: '2024-12-31T23:59:59.000Z',
    licensed: true,
    loggedIn: true,
    lastAccessed: '2024-11-27T18:00:00.000Z',
    incSchedule: true,
    emailAlert: true,
    wakeOnLanEnabled: true,
    createdDt: '2024-01-01T00:00:00.000Z',
    modifiedDt: '2024-11-27T12:00:00.000Z',
    storageAvailableSpace: 1000000000, // 1GB
    storageTotalSpace: 2000000000, // 2GB
    resolution: '1920x1080',
    countFaults: 2,
    tags: [
      { tag: 'lobby', tagId: 1 },
      { tag: 'main-floor', tagId: 2 }
    ],
    isMobile: false,
    isOutdoor: true,
    clientType: 'android',
    clientVersion: '3.0.0',
    defaultLayoutId: 10,
    displayProfileId: 5
  };

  describe('Constructor and Basic Properties', () => {
    it('should create a Display instance with valid data', () => {
      const display = new Display(sampleDisplayData);
      
      expect(display.displayId).toBe(1);
      expect(display.display).toBe('Test Display');
      expect(display.description).toBe('A test display for unit testing');
    });

    it('should handle undefined/null values gracefully', () => {
      const minimalData: GeneratedDisplay = {
        displayId: 1,
        display: 'Minimal Display'
      };
      
      const display = new Display(minimalData);
      
      expect(display.displayId).toBe(1);
      expect(display.display).toBe('Minimal Display');
      expect(display.auditingUntilDate).toBeUndefined();
      expect(display.lastAccessedDate).toBeUndefined();
    });
  });

  describe('Boolean Property Transformations', () => {
    it('should correctly transform licensed property', () => {
      const licensedDisplay = new Display({ ...sampleDisplayData, licensed: true });
      const unlicensedDisplay = new Display({ ...sampleDisplayData, licensed: false });
      
      expect(licensedDisplay.isLicensed).toBe(true);
      expect(unlicensedDisplay.isLicensed).toBe(false);
    });

    it('should correctly transform loggedIn property', () => {
      const loggedInDisplay = new Display({ ...sampleDisplayData, loggedIn: true });
      const loggedOutDisplay = new Display({ ...sampleDisplayData, loggedIn: false });
      
      expect(loggedInDisplay.isLoggedIn).toBe(true);
      expect(loggedOutDisplay.isLoggedIn).toBe(false);
    });

    it('should handle boolean transformations for other properties', () => {
      const display = new Display(sampleDisplayData);
      
      expect(display.shouldSendEmailAlerts()).toBe(true);
      expect(display.isWakeOnLanEnabled()).toBe(true);
      expect(display.includesSchedule()).toBe(true);
      expect(display.isMobileDisplay()).toBe(false);
      expect(display.isOutdoorDisplay()).toBe(true);
    });
  });

  describe('Date Property Transformations', () => {
    it('should correctly transform auditingUntil to Date', () => {
      const display = new Display(sampleDisplayData);
      const auditingDate = display.auditingUntilDate;
      
      expect(auditingDate).toBeInstanceOf(Date);
      expect(auditingDate?.getFullYear()).toBe(2024);
      expect(auditingDate?.getMonth()).toBe(11); // December (0-indexed)
      expect(auditingDate?.getDate()).toBe(31);
    });

    it('should correctly transform lastAccessed to Date', () => {
      const display = new Display(sampleDisplayData);
      const lastAccessedDate = display.lastAccessedDate;
      
      expect(lastAccessedDate).toBeInstanceOf(Date);
      expect(lastAccessedDate?.getFullYear()).toBe(2024);
      expect(lastAccessedDate?.getMonth()).toBe(10); // November (0-indexed)
      expect(lastAccessedDate?.getDate()).toBe(27);
    });

    it('should correctly transform created and modified dates', () => {
      const display = new Display(sampleDisplayData);
      
      const createdDate = display.createdDate;
      const modifiedDate = display.modifiedDate;
      
      expect(createdDate).toBeInstanceOf(Date);
      expect(modifiedDate).toBeInstanceOf(Date);
      expect(createdDate?.getUTCFullYear()).toBe(2024);
      expect(modifiedDate?.getUTCFullYear()).toBe(2024);
    });

    it('should handle invalid date strings gracefully', () => {
      const invalidDateData: GeneratedDisplay = {
        ...sampleDisplayData,
        auditingUntil: 'invalid-date',
        lastAccessed: ''
      };
      
      const display = new Display(invalidDateData);
      
      // Invalid dates should still create Date objects, but they will be Invalid Date
      expect(display.auditingUntilDate).toBeInstanceOf(Date);
      expect(isNaN(display.auditingUntilDate!.getTime())).toBe(true);
      
      // Empty strings should return undefined
      expect(display.lastAccessedDate).toBeUndefined();
    });
  });

  describe('Business Logic Methods', () => {
    describe('isAuditingActive', () => {
      it('should return true when auditing is active', () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1); // Tomorrow
        
        const activeAuditingData: GeneratedDisplay = {
          ...sampleDisplayData,
          auditingUntil: futureDate.toISOString()
        };
        
        const display = new Display(activeAuditingData);
        expect(display.isAuditingActive()).toBe(true);
      });

      it('should return false when auditing has expired', () => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 1); // Yesterday
        
        const expiredAuditingData: GeneratedDisplay = {
          ...sampleDisplayData,
          auditingUntil: pastDate.toISOString()
        };
        
        const display = new Display(expiredAuditingData);
        expect(display.isAuditingActive()).toBe(false);
      });

      it('should return false when auditingUntil is not set', () => {
        const { auditingUntil, ...noAuditingData } = sampleDisplayData;
        
        const display = new Display(noAuditingData);
        expect(display.isAuditingActive()).toBe(false);
      });
    });

    describe('getStatusSummary', () => {
      it('should return correct status summary for active display', () => {
        const recentDate = new Date();
        recentDate.setMinutes(recentDate.getMinutes() - 30); // 30 minutes ago
        
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1); // Tomorrow
        
        const activeDisplayData: GeneratedDisplay = {
          ...sampleDisplayData,
          loggedIn: true,
          licensed: true,
          lastAccessed: recentDate.toISOString(),
          auditingUntil: futureDate.toISOString()
        };
        
        const display = new Display(activeDisplayData);
        const status = display.getStatusSummary();
        
        expect(status.isOnline).toBe(true);
        expect(status.isLicensed).toBe(true);
        expect(status.hasRecentActivity).toBe(true);
        expect(status.auditingStatus).toBe('active');
        expect(status.lastSeen).toBeInstanceOf(Date);
      });

      it('should return correct status summary for inactive display', () => {
        const oldDate = new Date();
        oldDate.setHours(oldDate.getHours() - 2); // 2 hours ago
        
        const { auditingUntil, ...baseData } = sampleDisplayData;
        const inactiveDisplayData: GeneratedDisplay = {
          ...baseData,
          loggedIn: false,
          licensed: false,
          lastAccessed: oldDate.toISOString()
        };
        
        const display = new Display(inactiveDisplayData);
        const status = display.getStatusSummary();
        
        expect(status.isOnline).toBe(false);
        expect(status.isLicensed).toBe(false);
        expect(status.hasRecentActivity).toBe(false);
        expect(status.auditingStatus).toBe('inactive');
      });

      it('should handle expired auditing status', () => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 1); // Yesterday
        
        const expiredAuditingData: GeneratedDisplay = {
          ...sampleDisplayData,
          auditingUntil: pastDate.toISOString()
        };
        
        const display = new Display(expiredAuditingData);
        const status = display.getStatusSummary();
        
        expect(status.auditingStatus).toBe('expired');
      });
    });

    describe('getStorageInfo', () => {
      it('should calculate storage percentages correctly', () => {
        const display = new Display(sampleDisplayData);
        const storageInfo = display.getStorageInfo();
        
        expect(storageInfo).not.toBeNull();
        expect(storageInfo!.availableBytes).toBe(1000000000);
        expect(storageInfo!.totalBytes).toBe(2000000000);
        expect(storageInfo!.usedBytes).toBe(1000000000);
        expect(storageInfo!.usedPercentage).toBe(50);
        expect(storageInfo!.availablePercentage).toBe(50);
      });

      it('should return null when storage data is missing', () => {
        const { storageAvailableSpace, storageTotalSpace, ...baseData } = sampleDisplayData;
        const noStorageData: GeneratedDisplay = baseData;
        
        const display = new Display(noStorageData);
        const storageInfo = display.getStorageInfo();
        
        expect(storageInfo).toBeNull();
      });

      it('should return null when total space is zero', () => {
        const zeroStorageData: GeneratedDisplay = {
          ...sampleDisplayData,
          storageAvailableSpace: 0,
          storageTotalSpace: 0
        };
        
        const display = new Display(zeroStorageData);
        const storageInfo = display.getStorageInfo();
        
        expect(storageInfo).toBeNull();
      });

      it('should handle edge case with full storage', () => {
        const fullStorageData: GeneratedDisplay = {
          ...sampleDisplayData,
          storageAvailableSpace: 0,
          storageTotalSpace: 1000000000
        };
        
        const display = new Display(fullStorageData);
        const storageInfo = display.getStorageInfo();
        
        expect(storageInfo!.usedPercentage).toBe(100);
        expect(storageInfo!.availablePercentage).toBe(0);
      });
    });

    describe('getResolutionDimensions', () => {
      it('should parse resolution string correctly', () => {
        const display = new Display(sampleDisplayData);
        const dimensions = display.getResolutionDimensions();
        
        expect(dimensions).not.toBeNull();
        expect(dimensions!.width).toBe(1920);
        expect(dimensions!.height).toBe(1080);
      });

      it('should return null for invalid resolution format', () => {
        const invalidResolutionData: GeneratedDisplay = {
          ...sampleDisplayData,
          resolution: 'invalid-format'
        };
        
        const display = new Display(invalidResolutionData);
        const dimensions = display.getResolutionDimensions();
        
        expect(dimensions).toBeNull();
      });

      it('should return null when resolution is not set', () => {
        const { resolution, ...baseData } = sampleDisplayData;
        const noResolutionData: GeneratedDisplay = baseData;
        
        const display = new Display(noResolutionData);
        const dimensions = display.getResolutionDimensions();
        
        expect(dimensions).toBeNull();
      });
    });

    describe('Fault Management', () => {
      it('should correctly identify displays with faults', () => {
        const display = new Display(sampleDisplayData);
        
        expect(display.hasFaults()).toBe(true);
        expect(display.getFaultCount()).toBe(2);
      });

      it('should handle displays with no faults', () => {
        const noFaultsData: GeneratedDisplay = {
          ...sampleDisplayData,
          countFaults: 0
        };
        
        const display = new Display(noFaultsData);
        
        expect(display.hasFaults()).toBe(false);
        expect(display.getFaultCount()).toBe(0);
      });

      it('should handle undefined fault count', () => {
        const { countFaults, ...baseData } = sampleDisplayData;
        const undefinedFaultsData: GeneratedDisplay = baseData;
        
        const display = new Display(undefinedFaultsData);
        
        expect(display.hasFaults()).toBe(false);
        expect(display.getFaultCount()).toBe(0);
      });
    });

    describe('Tag Management', () => {
      it('should extract tag names correctly', () => {
        const display = new Display(sampleDisplayData);
        const tagNames = display.getTagNames();
        
        expect(tagNames).toEqual(['lobby', 'main-floor']);
      });

      it('should check for specific tags', () => {
        const display = new Display(sampleDisplayData);
        
        expect(display.hasTag('lobby')).toBe(true);
        expect(display.hasTag('main-floor')).toBe(true);
        expect(display.hasTag('non-existent')).toBe(false);
      });

      it('should handle displays with no tags', () => {
        const { tags, ...baseData } = sampleDisplayData;
        const noTagsData: GeneratedDisplay = baseData;
        
        const display = new Display(noTagsData);
        
        expect(display.getTagNames()).toEqual([]);
        expect(display.hasTag('any-tag')).toBe(false);
      });

      it('should handle tags with empty names', () => {
        const emptyTagsData: GeneratedDisplay = {
          ...sampleDisplayData,
          tags: [
            { tag: 'valid-tag', tagId: 1 },
            { tag: '', tagId: 2 },
            { tag: undefined as any, tagId: 3 }
          ]
        };
        
        const display = new Display(emptyTagsData);
        const tagNames = display.getTagNames();
        
        expect(tagNames).toEqual(['valid-tag']);
      });
    });
  });

  describe('Static Methods', () => {
    describe('fromApiData', () => {
      it('should create Display instance from API data', () => {
        const display = Display.fromApiData(sampleDisplayData);
        
        expect(display).toBeInstanceOf(Display);
        expect(display.displayId).toBe(1);
        expect(display.display).toBe('Test Display');
      });
    });

    describe('validate', () => {
      it('should validate and transform valid data', () => {
        const validData = {
          displayId: 1,
          display: 'Test Display',
          licensed: true,
          loggedIn: false,
          auditingUntil: '2024-12-31T23:59:59.000Z'
        };
        
        const display = Display.validate(validData);
        
        expect(display).toBeInstanceOf(Display);
        expect(display.displayId).toBe(1);
        expect(display.isLicensed).toBe(true);
        expect(display.isLoggedIn).toBe(false);
      });

      it('should handle validation with date transformations', () => {
        const dataWithDates = {
          displayId: 1,
          display: 'Test Display',
          auditingUntil: '2024-12-31T23:59:59.000Z',
          lastAccessed: '2024-11-27T18:00:00.000Z',
          createdDt: '2024-01-01T00:00:00.000Z',
          modifiedDt: '2024-11-27T12:00:00.000Z'
        };
        
        const display = Display.validate(dataWithDates);
        
        expect(display.auditingUntilDate).toBeInstanceOf(Date);
        expect(display.lastAccessedDate).toBeInstanceOf(Date);
        expect(display.createdDate).toBeInstanceOf(Date);
        expect(display.modifiedDate).toBeInstanceOf(Date);
      });

      it('should throw validation error for invalid data', () => {
        const invalidData = {
          displayId: 'not-a-number', // Should be number
          display: 123 // Should be string
        };
        
        expect(() => Display.validate(invalidData)).toThrow();
      });
    });
  });

  describe('Serialization', () => {
    describe('toJSON', () => {
      it('should return the original data structure', () => {
        const display = new Display(sampleDisplayData);
        const json = display.toJSON();
        
        expect(json).toEqual(sampleDisplayData);
        expect(json.displayId).toBe(1);
        expect(json.display).toBe('Test Display');
      });
    });
  });

  describe('Zod Schema Validation', () => {
    it('should validate correct data with DisplaySchema', () => {
      const validData = {
        displayId: 1,
        display: 'Test Display',
        licensed: true,
        auditingUntil: '2024-12-31T23:59:59.000Z'
      };
      
      const result = DisplaySchema.parse(validData);
      
      expect(result.displayId).toBe(1);
      expect(result.display).toBe('Test Display');
      expect(result.licensed).toBe(true);
      expect(result.auditingUntil).toBeInstanceOf(Date);
    });

    it('should transform string dates to Date objects', () => {
      const dataWithStringDates = {
        auditingUntil: '2024-12-31T23:59:59.000Z',
        lastAccessed: '2024-11-27T18:00:00.000Z',
        createdDt: '2024-01-01T00:00:00.000Z',
        modifiedDt: '2024-11-27T12:00:00.000Z'
      };
      
      const result = DisplaySchema.parse(dataWithStringDates);
      
      expect(result.auditingUntil).toBeInstanceOf(Date);
      expect(result.lastAccessed).toBeInstanceOf(Date);
      expect(result.createdDt).toBeInstanceOf(Date);
      expect(result.modifiedDt).toBeInstanceOf(Date);
    });

    it('should handle empty string dates', () => {
      const dataWithEmptyDates = {
        auditingUntil: '',
        lastAccessed: '',
        createdDt: '',
        modifiedDt: ''
      };
      
      const result = DisplaySchema.parse(dataWithEmptyDates);
      
      expect(result.auditingUntil).toBeUndefined();
      expect(result.lastAccessed).toBeUndefined();
      expect(result.createdDt).toBeUndefined();
      expect(result.modifiedDt).toBeUndefined();
    });

    it('should allow additional properties with passthrough', () => {
      const dataWithExtraProps = {
        displayId: 1,
        display: 'Test Display',
        customProperty: 'custom-value',
        anotherCustomProp: 123
      };
      
      const result = DisplaySchema.parse(dataWithExtraProps);
      
      expect(result.displayId).toBe(1);
      expect(result.display).toBe('Test Display');
      expect((result as any).customProperty).toBe('custom-value');
      expect((result as any).anotherCustomProp).toBe(123);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null/undefined input gracefully', () => {
      const nullData: GeneratedDisplay = {} as any;
      const display = new Display(nullData);
      
      expect(display.displayId).toBeUndefined();
      expect(display.display).toBeUndefined();
      expect(display.isLicensed).toBe(false);
      expect(display.isLoggedIn).toBe(false);
    });

    it('should handle mixed data types correctly', () => {
      const mixedData: GeneratedDisplay = {
        displayId: 1,
        display: 'Mixed Display',
        licensed: 1 as any, // Number instead of boolean
        loggedIn: 0 as any, // Number instead of boolean
        storageAvailableSpace: '1000000' as any, // String instead of number
        storageTotalSpace: '2000000' as any // String instead of number
      };
      
      const display = new Display(mixedData);
      
      expect(display.displayId).toBe(1);
      expect(display.display).toBe('Mixed Display');
      // Boolean conversion should work for truthy/falsy values
      expect(display.isLicensed).toBe(true); // 1 is truthy
      expect(display.isLoggedIn).toBe(false); // 0 is falsy
    });

    it('should handle very large numbers', () => {
      const largeNumberData: GeneratedDisplay = {
        ...sampleDisplayData,
        storageAvailableSpace: Number.MAX_SAFE_INTEGER,
        storageTotalSpace: Number.MAX_SAFE_INTEGER
      };
      
      const display = new Display(largeNumberData);
      const storageInfo = display.getStorageInfo();
      
      expect(storageInfo).not.toBeNull();
      expect(storageInfo!.availableBytes).toBe(Number.MAX_SAFE_INTEGER);
      expect(storageInfo!.totalBytes).toBe(Number.MAX_SAFE_INTEGER);
    });
  });
});
