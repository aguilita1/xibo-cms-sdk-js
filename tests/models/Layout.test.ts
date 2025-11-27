/**
 * Unit tests for Layout Model
 * Location: tests\models\Layout.test.ts
 */
import { Layout, LayoutStatus, PublishedStatus, LayoutOrientation } from '../../src/models/Layout';
import { Layout as GeneratedLayout } from '../../src/generated/types/swagger-types';

describe('Layout Model', () => {
  // Mock layout data for testing
  const mockLayoutData: GeneratedLayout = {
    layoutId: 1,
    ownerId: 1,
    campaignId: 1,
    publishedStatusId: 1,
    publishedStatus: 'Published',
    publishedDate: '2023-01-01T00:00:00Z',
    schemaVersion: 2,
    layout: 'Test Layout',
    description: 'A test layout',
    backgroundColor: '#FF0000',
    createdDt: '2023-01-01T00:00:00Z',
    modifiedDt: '2023-01-02T00:00:00Z',
    status: 1,
    retired: false,
    backgroundzIndex: 0,
    width: 1920,
    height: 1080,
    orientation: 'landscape',
    displayOrder: 1,
    duration: 30,
    statusMessage: '',
    enableStat: 1,
    autoApplyTransitions: 1,
    code: 'TEST001',
    isLocked: false,
    regions: [
      {
        regionId: 1,
        layoutId: 1,
        ownerId: 1,
        type: 'zone',
        name: 'Region 1',
        width: 960,
        height: 540,
        top: 0,
        left: 0,
        zIndex: 1,
        duration: 30
      },
      {
        regionId: 2,
        layoutId: 1,
        ownerId: 1,
        type: 'zone',
        name: 'Region 2',
        width: 960,
        height: 540,
        top: 0,
        left: 960,
        zIndex: 2,
        duration: 25
      }
    ],
    tags: [
      { tag: 'test', tagId: 1, value: '' },
      { tag: 'demo', tagId: 2, value: 'value1' }
    ],
    folderId: 1,
    permissionsFolderId: 1
  };

  let layout: Layout;

  beforeEach(() => {
    layout = new Layout(mockLayoutData);
  });

  describe('Constructor and Basic Properties', () => {
    it('should create a Layout instance with provided data', () => {
      expect(layout).toBeInstanceOf(Layout);
      expect(layout.layoutId).toBe(1);
      expect(layout.layout).toBe('Test Layout');
      expect(layout.description).toBe('A test layout');
    });

    it('should proxy all original properties', () => {
      expect(layout.ownerId).toBe(1);
      expect(layout.campaignId).toBe(1);
      expect(layout.width).toBe(1920);
      expect(layout.height).toBe(1080);
      expect(layout.backgroundColor).toBe('#FF0000');
      expect(layout.code).toBe('TEST001');
    });
  });

  describe('Date Transformations', () => {
    it('should transform publishedDate to Date object', () => {
      const publishedDate = layout.publishedDate;
      expect(publishedDate).toBeInstanceOf(Date);
      expect(publishedDate?.toISOString()).toBe('2023-01-01T00:00:00.000Z');
    });

    it('should transform createdDate to Date object', () => {
      const createdDate = layout.createdDate;
      expect(createdDate).toBeInstanceOf(Date);
      expect(createdDate?.toISOString()).toBe('2023-01-01T00:00:00.000Z');
    });

    it('should transform modifiedDate to Date object', () => {
      const modifiedDate = layout.modifiedDate;
      expect(modifiedDate).toBeInstanceOf(Date);
      expect(modifiedDate?.toISOString()).toBe('2023-01-02T00:00:00.000Z');
    });

    it('should handle undefined dates gracefully', () => {
      const layoutWithoutDates = new Layout({
        layoutId: 1,
        layout: 'Test Layout'
      } as GeneratedLayout);

      expect(layoutWithoutDates.publishedDate).toBeUndefined();
      expect(layoutWithoutDates.createdDate).toBeUndefined();
      expect(layoutWithoutDates.modifiedDate).toBeUndefined();
    });
  });

  describe('Status Enums', () => {
    it('should return correct layout status enum', () => {
      expect(layout.layoutStatus).toBe(LayoutStatus.VALID);
    });

    it('should return correct published status enum', () => {
      expect(layout.publishedStatusEnum).toBe(PublishedStatus.PUBLISHED);
    });

    it('should return correct orientation enum', () => {
      expect(layout.orientationEnum).toBe(LayoutOrientation.LANDSCAPE);
    });

    it('should handle undefined status values', () => {
      const layoutWithoutStatus = new Layout({
        layoutId: 1,
        layout: 'Test Layout'
      } as GeneratedLayout);

      expect(layoutWithoutStatus.publishedStatusEnum).toBeUndefined();
      expect(layoutWithoutStatus.orientationEnum).toBeUndefined();
    });
  });

  describe('Status Checking Methods', () => {
    it('should correctly identify published layout', () => {
      expect(layout.isPublished()).toBe(true);
      expect(layout.isDraft()).toBe(false);
      expect(layout.isPendingApproval()).toBe(false);
    });

    it('should correctly identify draft layout', () => {
      const draftLayout = new Layout({
        ...mockLayoutData,
        publishedStatus: 'Draft'
      });

      expect(draftLayout.isPublished()).toBe(false);
      expect(draftLayout.isDraft()).toBe(true);
      expect(draftLayout.isPendingApproval()).toBe(false);
    });

    it('should correctly identify pending approval layout', () => {
      const pendingLayout = new Layout({
        ...mockLayoutData,
        publishedStatus: 'Pending Approval'
      });

      expect(pendingLayout.isPublished()).toBe(false);
      expect(pendingLayout.isDraft()).toBe(false);
      expect(pendingLayout.isPendingApproval()).toBe(true);
    });

    it('should correctly identify valid layout', () => {
      expect(layout.isValid()).toBe(true);

      const buildingLayout = new Layout({
        ...mockLayoutData,
        status: LayoutStatus.BUILDING
      });
      expect(buildingLayout.isValid()).toBe(true);

      const invalidLayout = new Layout({
        ...mockLayoutData,
        status: LayoutStatus.INVALID
      });
      expect(invalidLayout.isValid()).toBe(false);
    });

    it('should correctly identify building layout', () => {
      const buildingLayout = new Layout({
        ...mockLayoutData,
        status: LayoutStatus.BUILDING
      });

      expect(buildingLayout.isBuilding()).toBe(true);
      expect(layout.isBuilding()).toBe(false);
    });

    it('should correctly identify retired layout', () => {
      expect(layout.isRetired()).toBe(false);

      const retiredLayout = new Layout({
        ...mockLayoutData,
        retired: true
      });
      expect(retiredLayout.isRetired()).toBe(true);
    });

    it('should correctly identify locked layout', () => {
      expect(layout.isLocked()).toBe(false);

      const lockedLayout = new Layout({
        ...mockLayoutData,
        isLocked: true
      });
      expect(lockedLayout.isLocked()).toBe(true);
    });

    it('should correctly identify layout with draft', () => {
      expect(layout.hasDraft()).toBe(false);

      const layoutWithDraft = new Layout({
        ...mockLayoutData,
        parentId: 2
      });
      expect(layoutWithDraft.hasDraft()).toBe(true);
    });

    it('should correctly identify stat enabled layout', () => {
      expect(layout.isStatEnabled()).toBe(true);

      const noStatLayout = new Layout({
        ...mockLayoutData,
        enableStat: 0
      });
      expect(noStatLayout.isStatEnabled()).toBe(false);
    });

    it('should correctly identify auto-apply transitions', () => {
      expect(layout.hasAutoApplyTransitions()).toBe(true);

      const noTransitionsLayout = new Layout({
        ...mockLayoutData,
        autoApplyTransitions: 0
      });
      expect(noTransitionsLayout.hasAutoApplyTransitions()).toBe(false);
    });
  });

  describe('Duration Methods', () => {
    it('should return correct duration', () => {
      expect(layout.getDuration()).toBe(30);
    });

    it('should format duration correctly', () => {
      expect(layout.getFormattedDuration()).toBe('00:00:30');

      const longDurationLayout = new Layout({
        ...mockLayoutData,
        duration: 3661 // 1 hour, 1 minute, 1 second
      });
      expect(longDurationLayout.getFormattedDuration()).toBe('01:01:01');
    });

    it('should validate duration correctly', () => {
      expect(layout.isDurationValid()).toEqual({ valid: true });

      const zeroDurationLayout = new Layout({
        ...mockLayoutData,
        duration: 0
      });
      expect(zeroDurationLayout.isDurationValid()).toEqual({
        valid: false,
        reason: 'Duration must be greater than 0'
      });

      const tooLongLayout = new Layout({
        ...mockLayoutData,
        duration: 90000 // More than 24 hours
      });
      expect(tooLongLayout.isDurationValid()).toEqual({
        valid: false,
        reason: 'Duration too long (maximum 24 hours)'
      });
    });

    it('should handle undefined duration', () => {
      const noDurationLayout = new Layout({
        layoutId: 1,
        layout: 'Test Layout'
      } as GeneratedLayout);

      expect(noDurationLayout.getDuration()).toBe(0);
      expect(noDurationLayout.getFormattedDuration()).toBe('00:00:00');
    });
  });

  describe('Region Management', () => {
    it('should return all regions', () => {
      const regions = layout.getRegions();
      expect(regions).toHaveLength(2);
      expect(regions[0]?.name).toBe('Region 1');
      expect(regions[1]?.name).toBe('Region 2');
    });

    it('should return correct region count', () => {
      expect(layout.getRegionCount()).toBe(2);
    });

    it('should find region by ID', () => {
      const region = layout.getRegionById(1);
      expect(region).toBeDefined();
      expect(region?.name).toBe('Region 1');

      const nonExistentRegion = layout.getRegionById(999);
      expect(nonExistentRegion).toBeUndefined();
    });

    it('should find regions by name', () => {
      const regions = layout.getRegionsByName('Region 1');
      expect(regions).toHaveLength(1);
      expect(regions[0]?.regionId).toBe(1);

      const noRegions = layout.getRegionsByName('Non-existent');
      expect(noRegions).toHaveLength(0);
    });

    it('should sort regions by z-index', () => {
      const sortedRegions = layout.getRegionsByZIndex();
      expect(sortedRegions).toHaveLength(2);
      expect(sortedRegions[0]?.zIndex).toBe(1);
      expect(sortedRegions[1]?.zIndex).toBe(2);
    });

    it('should check if layout has regions', () => {
      expect(layout.hasRegions()).toBe(true);

      const noRegionsLayout = new Layout({
        ...mockLayoutData,
        regions: []
      });
      expect(noRegionsLayout.hasRegions()).toBe(false);
    });

    it('should calculate total duration from regions', () => {
      expect(layout.calculateTotalDuration()).toBe(30); // Max of 30 and 25

      const noRegionsLayout = new Layout({
        ...mockLayoutData,
        regions: []
      });
      expect(noRegionsLayout.calculateTotalDuration()).toBe(0);
    });

    it('should validate region positioning', () => {
      const validation = layout.validateRegionPositioning();
      expect(validation.valid).toBe(true);
      expect(validation.issues).toHaveLength(0);
    });

    it('should detect region positioning issues', () => {
      const badRegionsLayout = new Layout({
        ...mockLayoutData,
        regions: [
          {
            regionId: 1,
            layoutId: 1,
            ownerId: 1,
            type: 'zone',
            name: 'Bad Region',
            width: 1000,
            height: 600,
            top: -10, // Negative position
            left: 1500, // Extends beyond layout width (1500 + 1000 > 1920)
            zIndex: 1,
            duration: 30
          }
        ]
      });

      const validation = badRegionsLayout.validateRegionPositioning();
      expect(validation.valid).toBe(false);
      expect(validation.issues).toContain('Region Bad Region extends beyond layout width');
      expect(validation.issues).toContain('Region Bad Region has negative position');
    });
  });

  describe('Background and Styling', () => {
    it('should check if layout has background image', () => {
      expect(layout.hasBackgroundImage()).toBe(false);

      const bgImageLayout = new Layout({
        ...mockLayoutData,
        backgroundImageId: 123
      });
      expect(bgImageLayout.hasBackgroundImage()).toBe(true);
    });

    it('should return background color', () => {
      expect(layout.getBackgroundColor()).toBe('#FF0000');
    });

    it('should validate background color', () => {
      expect(layout.isBackgroundColorValid()).toBe(true);

      const invalidColorLayout = new Layout({
        ...mockLayoutData,
        backgroundColor: 'invalid-color'
      });
      expect(invalidColorLayout.isBackgroundColorValid()).toBe(false);

      const noColorLayout = new Layout({
        layoutId: 1,
        layout: 'Test Layout'
      } as GeneratedLayout);
      expect(noColorLayout.isBackgroundColorValid()).toBe(true); // No color is valid
    });

    it('should return background z-index', () => {
      expect(layout.getBackgroundZIndex()).toBe(0);

      const customZIndexLayout = new Layout({
        ...mockLayoutData,
        backgroundzIndex: 5
      });
      expect(customZIndexLayout.getBackgroundZIndex()).toBe(5);
    });
  });

  describe('Dimensions and Orientation', () => {
    it('should return layout dimensions', () => {
      const dimensions = layout.getDimensions();
      expect(dimensions).toEqual({ width: 1920, height: 1080 });
    });

    it('should calculate aspect ratio', () => {
      expect(layout.getAspectRatio()).toBeCloseTo(1.7777777777777777, 3); // 1920/1080
    });

    it('should identify landscape orientation', () => {
      expect(layout.isLandscape()).toBe(true);
      expect(layout.isPortrait()).toBe(false);
      expect(layout.isSquare()).toBe(false);
    });

    it('should identify portrait orientation', () => {
      const portraitLayout = new Layout({
        ...mockLayoutData,
        width: 1080,
        height: 1920,
        orientation: 'portrait'
      });

      expect(portraitLayout.isLandscape()).toBe(false);
      expect(portraitLayout.isPortrait()).toBe(true);
      expect(portraitLayout.isSquare()).toBe(false);
    });

    it.skip('should identify square orientation - TODO: Make a Xibo Square Layout', () => {
      const squareLayout = new Layout({
        ...mockLayoutData,
        width: 1080,
        height: 1080
      });

      expect(squareLayout.isLandscape()).toBe(false);
      expect(squareLayout.isPortrait()).toBe(false);
      expect(squareLayout.isSquare()).toBe(true);
    });

    it('should handle missing dimensions', () => {
      const noDimensionsLayout = new Layout({
        layoutId: 1,
        layout: 'Test Layout'
      } as GeneratedLayout);

      const dimensions = noDimensionsLayout.getDimensions();
      expect(dimensions).toEqual({ width: 1920, height: 1080 }); // Default values
    });
  });

  describe('Tags and Metadata', () => {
    it('should return tag names', () => {
      const tagNames = layout.getTagNames();
      expect(tagNames).toEqual(['test', 'demo']);
    });

    it('should check if layout has specific tag', () => {
      expect(layout.hasTag('test')).toBe(true);
      expect(layout.hasTag('demo')).toBe(true);
      expect(layout.hasTag('nonexistent')).toBe(false);
    });

    it('should handle layouts without tags', () => {
      const noTagsLayout = new Layout({
        layoutId: 1,
        layout: 'Test Layout'
      } as GeneratedLayout);

      expect(noTagsLayout.getTagNames()).toEqual([]);
      expect(noTagsLayout.hasTag('test')).toBe(false);
    });

    it('should return layout code', () => {
      expect(layout.getCode()).toBe('TEST001');
    });

    it('should return schema version', () => {
      expect(layout.getSchemaVersion()).toBe(2);

      const noSchemaLayout = new Layout({
        layoutId: 1,
        layout: 'Test Layout'
      } as GeneratedLayout);
      expect(noSchemaLayout.getSchemaVersion()).toBe(1); // Default
    });
  });

  describe('Status Summary', () => {
    it('should return comprehensive status summary', () => {
      const summary = layout.getStatusSummary();

      expect(summary).toEqual({
        isValid: true,
        isPublished: true,
        isDraft: false,
        isLocked: false,
        isRetired: false,
        hasRegions: true,
        regionCount: 2,
        duration: 30,
        durationValid: true,
        positioningValid: true,
        backgroundValid: true,
        lastModified: expect.any(Date)
      });
    });
  });

  describe('Validation', () => {
    it('should validate a correct layout', () => {
      const validation = layout.validate();

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.warnings).toHaveLength(0);
    });

    it('should detect validation errors', () => {
      const invalidLayout = new Layout({
        layoutId: 1,
        layout: '', // Missing name
        backgroundColor: 'invalid-color', // Invalid color
        duration: -1 // Invalid duration
      } as GeneratedLayout);

      const validation = invalidLayout.validate();

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Layout name is required');
      expect(validation.errors).toContain('Layout dimensions are required');
      expect(validation.errors).toContain('Invalid background color format');
      expect(validation.errors).toContain('Duration must be greater than 0');
    });

    it('should detect validation warnings', () => {
      const warningLayout = new Layout({
        ...mockLayoutData,
        regions: [], // No regions
        duration: 0, // Zero duration
        retired: true // Retired
      });

      const validation = warningLayout.validate();

      expect(validation.warnings).toContain('Layout has no regions');
      expect(validation.warnings).toContain('Layout duration is 0 seconds');
      expect(validation.warnings).toContain('Layout is retired');
    });
  });

  describe('Static Methods', () => {
    it('should create Layout from API data', () => {
      const layoutFromApi = Layout.fromApiData(mockLayoutData);
      expect(layoutFromApi).toBeInstanceOf(Layout);
      expect(layoutFromApi.layoutId).toBe(1);
    });

    it('should validate and create Layout from unknown data', () => {
      const unknownData = {
        layoutId: 1,
        layout: 'Test Layout',
        createdDt: '2023-01-01T00:00:00Z',
        status: 1
      };

      const validatedLayout = Layout.validate(unknownData);
      expect(validatedLayout).toBeInstanceOf(Layout);
      expect(validatedLayout.layoutId).toBe(1);
      expect(validatedLayout.createdDate).toBeInstanceOf(Date);
    });
  });

  describe('JSON Conversion', () => {
    it('should convert back to JSON format', () => {
      const json = layout.toJSON();
      expect(json).toEqual(mockLayoutData);
    });
  });
});
