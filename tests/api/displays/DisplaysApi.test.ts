import { DisplaysApi } from '../../../src/api/displays/DisplaysApi';
import { HttpClient } from '../../../src/client/HttpClient';
import { Display, DisplaySearchParams, DisplayUpdateParams } from '../../../src/models/Display';
import { Context } from '../../../src/types';
import { NotFoundError, AuthenticationError, ValidationError } from '../../../src/errors';

// Mock the HttpClient
jest.mock('../../../src/client/HttpClient');

describe('DisplaysApi', () => {
  let displaysApi: DisplaysApi;
  let mockHttpClient: jest.Mocked<HttpClient>;

  // Sample display data for testing
  const sampleDisplay: Display = {
    displayId: 1,
    display: 'Test Display',
    description: 'Test Display Description',
    tags: [],
    auditingUntil: 1735689599, // Unix timestamp for 2024-12-31 23:59:59
    defaultLayoutId: 1,
    licensed: 1,
    license: 'test-license-key',
    incSchedule: 1,
    emailAlert: 1,
    alertTimeout: 300,
    wakeOnLanEnabled: 0,
    wakeOnLanTime: '',
    broadCastAddress: '',
    secureOn: '',
    cidr: '0',
    latitude: 40.7128,
    longitude: -74.0060,
    timeZone: '',
    languages: '',
    displayProfileId: 1,
    displayTypeId: 1,
    screenSize: 55,
    venueId: 1,
    address: '',
    isMobile: 0,
    isOutdoor: 0,
    costPerPlay: 0.50,
    impressionsPerPlay: 1000,
    customId: '',
    ref1: '',
    ref2: '',
    ref3: '',
    ref4: '',
    ref5: '',
    teamViewerSerial: '',
    webkeySerial: '',
    folderId: 1,
    loggedIn: 1,
    lastAccessed: 1704110400, // Unix timestamp for 2024-01-01 12:00:00
    macAddress: '00:11:22:33:44:55',
    clientVersion: '3.0.0',
    clientType: 'android',
    clientCode: 123,
    displayGroupId: 1,
    mediaInventoryStatus: 1,
    xmrChannel: 'test-channel',
    xmrPubKey: 'test-pub-key',
    lastCommandSuccess: 1,
    deviceName: 'Test Device',
    orientation: '0',
    resolution: '1920x1080',
    commercialLicence: 1,
    lanIpAddress: '192.168.1.100',
    storageAvailableSpace: 1000000,
    storageTotalSpace: 2000000
  };


  beforeEach(() => {
    // Create a mock HttpClient with all required methods
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      patch: jest.fn(),
      request: jest.fn(),
      getRateLimitInfo: jest.fn(),
      getBaseUrl: jest.fn(),
      setTimeout: jest.fn(),
      handleResponseError: jest.fn(),
      normalizeHeaders: jest.fn(),
    } as unknown as jest.Mocked<HttpClient>;

    displaysApi = new DisplaysApi(mockHttpClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('search', () => {
    it('should search displays with default parameters', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: [sampleDisplay],
        status: 200,
        headers: { 'x-total-count': '1' },
        config: { method: 'GET', url: '/display' } as any
      });

      const result = await displaysApi.search();

      expect(mockHttpClient.get).toHaveBeenCalledWith('/display', {}, undefined);
      expect(result.data).toEqual([sampleDisplay]);
      expect(result.total).toBe(1);
    });

    it('should search displays with search parameters', async () => {
      const searchParams: DisplaySearchParams = {
        displayId: 1,
        display: 'Test',
        tags: 'tag1,tag2',
        authorised: 1,
        loggedIn: 1
      };

      mockHttpClient.get.mockResolvedValue({
        data: [sampleDisplay],
        status: 200,
        headers: { 'x-total-count': '1' },
        config: { method: 'GET', url: '/display' } as any
      });

      const result = await displaysApi.search(searchParams);

      expect(mockHttpClient.get).toHaveBeenCalledWith('/display', {
        displayId: '1',
        display: 'Test',
        tags: 'tag1,tag2',
        authorised: '1',
        loggedIn: '1'
      }, undefined);
      expect(result.data).toEqual([sampleDisplay]);
    });

    it('should search displays with context', async () => {
      const context: Context = {
        timeout: 5000,
        retryAttempts: 2
      };

      mockHttpClient.get.mockResolvedValue({
        data: [sampleDisplay],
        status: 200,
        headers: { 'x-total-count': '1' },
        config: { method: 'GET', url: '/display' } as any
      });

      const result = await displaysApi.search({}, context);

      expect(mockHttpClient.get).toHaveBeenCalledWith('/display', {}, context);
      expect(result.data).toEqual([sampleDisplay]);
    });

    it('should handle search errors', async () => {
      const error = new AuthenticationError('Unauthorized');
      mockHttpClient.get.mockRejectedValue(error);

      await expect(displaysApi.search()).rejects.toThrow(AuthenticationError);
    });
  });

  describe('get', () => {
    it('should get a display by ID', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: [sampleDisplay],
        status: 200,
        headers: { 'x-total-count': '1' },
        config: { method: 'GET', url: '/display' } as any
      });

      const result = await displaysApi.get(1);

      expect(result).toEqual(sampleDisplay);
    });

    it('should get a display with context', async () => {
      const context: Context = {
        timeout: 3000
      };

      mockHttpClient.get.mockResolvedValue({
        data: [sampleDisplay],
        status: 200,
        headers: { 'x-total-count': '1' },
        config: { method: 'GET', url: '/display' } as any
      });

      const result = await displaysApi.get(1, context);

      expect(result).toEqual(sampleDisplay);
    });

    it('should handle not found error', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: [],
        status: 200,
        headers: { 'x-total-count': '0' },
        config: { method: 'GET', url: '/display' } as any
      });

      await expect(displaysApi.get(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('update', () => {
    it('should update a display', async () => {
      const updateData: DisplayUpdateParams = {
        display: 'Updated Display Name',
        description: 'Updated description',
        defaultLayoutId: 1,
        licensed: 1,
        license: 'updated-license',
        incSchedule: 1,
        emailAlert: 1,
        wakeOnLanEnabled: 0
      };

      const updatedDisplay = { ...sampleDisplay, ...updateData };
      mockHttpClient.put.mockResolvedValue({
        data: updatedDisplay,
        status: 200,
        headers: {},
        config: { method: 'PUT', url: '/display/1' } as any
      });

      const result = await displaysApi.update(1, updateData);

      expect(mockHttpClient.put).toHaveBeenCalledWith('/display/1', updateData, undefined);
      expect(result).toEqual(updatedDisplay);
    });

    it('should update a display with context', async () => {
      const updateData: DisplayUpdateParams = {
        display: 'Updated Display Name',
        defaultLayoutId: 1,
        licensed: 1,
        license: 'test-license',
        incSchedule: 1,
        emailAlert: 1,
        wakeOnLanEnabled: 0
      };
      const context: Context = {
        timeout: 10000
      };

      mockHttpClient.put.mockResolvedValue({
        data: sampleDisplay,
        status: 200,
        headers: {},
        config: { method: 'PUT', url: '/display/1' } as any
      });

      const result = await displaysApi.update(1, updateData, context);

      expect(mockHttpClient.put).toHaveBeenCalledWith('/display/1', updateData, context);
      expect(result).toEqual(sampleDisplay);
    });

    it('should handle validation errors', async () => {
      const updateData: DisplayUpdateParams = {
        display: 'Test',
        defaultLayoutId: 1,
        licensed: 1,
        license: 'test-license',
        incSchedule: 1,
        emailAlert: 1,
        wakeOnLanEnabled: 0
      };
      const error = new ValidationError('Display name is required');
      mockHttpClient.put.mockRejectedValue(error);

      await expect(displaysApi.update(1, updateData)).rejects.toThrow(ValidationError);
    });
  });

  describe('delete', () => {
    it('should delete a display', async () => {
      mockHttpClient.delete.mockResolvedValue({
        data: undefined,
        status: 204,
        headers: {},
        config: { method: 'DELETE', url: '/display/1' } as any
      });

      await displaysApi.delete(1);

      expect(mockHttpClient.delete).toHaveBeenCalledWith('/display/1', undefined);
    });

    it('should delete a display with context', async () => {
      const context: Context = {
        timeout: 5000
      };

      mockHttpClient.delete.mockResolvedValue({
        data: undefined,
        status: 204,
        headers: {},
        config: { method: 'DELETE', url: '/display/1' } as any
      });

      await displaysApi.delete(1, context);

      expect(mockHttpClient.delete).toHaveBeenCalledWith('/display/1', context);
    });

    it('should handle delete errors', async () => {
      const error = new NotFoundError('Display not found');
      mockHttpClient.delete.mockRejectedValue(error);

      await expect(displaysApi.delete(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('requestScreenshot', () => {
    it('should request a screenshot', async () => {
      mockHttpClient.put.mockResolvedValue({
        data: sampleDisplay,
        status: 200,
        headers: {},
        config: { method: 'PUT', url: '/display/requestscreenshot/1' } as any
      });

      const result = await displaysApi.requestScreenshot(1);

      expect(mockHttpClient.put).toHaveBeenCalledWith('/display/requestscreenshot/1', {}, undefined);
      expect(result).toEqual(sampleDisplay);
    });

    it('should request a screenshot with context', async () => {
      const context: Context = {
        timeout: 15000
      };

      mockHttpClient.put.mockResolvedValue({
        data: sampleDisplay,
        status: 200,
        headers: {},
        config: { method: 'PUT', url: '/display/requestscreenshot/1' } as any
      });

      const result = await displaysApi.requestScreenshot(1, context);

      expect(mockHttpClient.put).toHaveBeenCalledWith('/display/requestscreenshot/1', {}, context);
      expect(result).toEqual(sampleDisplay);
    });
  });

  describe('wakeOnLan', () => {
    it('should send wake on LAN command', async () => {
      mockHttpClient.post.mockResolvedValue({
        data: undefined,
        status: 204,
        headers: {},
        config: { method: 'POST', url: '/display/wol/1' } as any
      });

      await displaysApi.wakeOnLan(1);

      expect(mockHttpClient.post).toHaveBeenCalledWith('/display/wol/1', {}, undefined);
    });

    it('should send wake on LAN command with context', async () => {
      const context: Context = {
        timeout: 5000
      };

      mockHttpClient.post.mockResolvedValue({
        data: undefined,
        status: 204,
        headers: {},
        config: { method: 'POST', url: '/display/wol/1' } as any
      });

      await displaysApi.wakeOnLan(1, context);

      expect(mockHttpClient.post).toHaveBeenCalledWith('/display/wol/1', {}, context);
    });
  });

  describe('toggleAuthorize', () => {
    it('should toggle display authorization', async () => {
      mockHttpClient.put.mockResolvedValue({
        data: undefined,
        status: 204,
        headers: {},
        config: { method: 'PUT', url: '/display/authorise/1' } as any
      });

      await displaysApi.toggleAuthorize(1);

      expect(mockHttpClient.put).toHaveBeenCalledWith('/display/authorise/1', {}, undefined);
    });

    it('should toggle display authorization with context', async () => {
      const context: Context = {
        timeout: 3000
      };

      mockHttpClient.put.mockResolvedValue({
        data: undefined,
        status: 204,
        headers: {},
        config: { method: 'PUT', url: '/display/authorise/1' } as any
      });

      await displaysApi.toggleAuthorize(1, context);

      expect(mockHttpClient.put).toHaveBeenCalledWith('/display/authorise/1', {}, context);
    });
  });

  describe('setDefaultLayout', () => {
    it('should set default layout', async () => {
      mockHttpClient.put.mockResolvedValue({
        data: undefined,
        status: 204,
        headers: {},
        config: { method: 'PUT', url: '/display/defaultlayout/1' } as any
      });

      await displaysApi.setDefaultLayout(1, 5);

      expect(mockHttpClient.put).toHaveBeenCalledWith('/display/defaultlayout/1', { layoutId: 5 }, undefined);
    });

    it('should set default layout with context', async () => {
      const context: Context = {
        timeout: 5000
      };

      mockHttpClient.put.mockResolvedValue({
        data: undefined,
        status: 204,
        headers: {},
        config: { method: 'PUT', url: '/display/defaultlayout/1' } as any
      });

      await displaysApi.setDefaultLayout(1, 5, context);

      expect(mockHttpClient.put).toHaveBeenCalledWith('/display/defaultlayout/1', { layoutId: 5 }, context);
    });
  });

  describe('licenseCheck', () => {
    it('should perform license check', async () => {
      mockHttpClient.put.mockResolvedValue({ 
        data: undefined, 
        status: 200, 
        headers: {}, 
        config: { method: 'PUT', url: '/display/licenceCheck/1' } as any 
      });

      await displaysApi.licenseCheck(1);

      expect(mockHttpClient.put).toHaveBeenCalledWith('/display/licenceCheck/1', {}, undefined);
    });

    it('should perform license check with context', async () => {
      const context: Context = {
        timeout: 10000
      };

      mockHttpClient.put.mockResolvedValue({ 
        data: undefined, 
        status: 200, 
        headers: {}, 
        config: { method: 'PUT', url: '/display/licenceCheck/1' } as any 
      });

      await displaysApi.licenseCheck(1, context);

      expect(mockHttpClient.put).toHaveBeenCalledWith('/display/licenceCheck/1', {}, context);
    });
  });

  describe('getStatus', () => {
    it('should get display status', async () => {
      const statusData = ['Status line 1', 'Status line 2', 'Status line 3'];
      mockHttpClient.get.mockResolvedValue({
        data: statusData,
        status: 200,
        headers: {},
        config: { method: 'GET', url: '/display/status/1' } as any
      });

      const result = await displaysApi.getStatus(1);

      expect(mockHttpClient.get).toHaveBeenCalledWith('/display/status/1', undefined, undefined);
      expect(result).toEqual(statusData);
    });

    it('should get display status with context', async () => {
      const statusData = ['Status line 1'];
      const context: Context = {
        timeout: 5000
      };

      mockHttpClient.get.mockResolvedValue({
        data: statusData,
        status: 200,
        headers: {},
        config: { method: 'GET', url: '/display/status/1' } as any
      });

      const result = await displaysApi.getStatus(1, context);

      expect(mockHttpClient.get).toHaveBeenCalledWith('/display/status/1', undefined, context);
      expect(result).toEqual(statusData);
    });
  });

  describe('purgeAll', () => {
    it('should purge all media from display', async () => {
      mockHttpClient.put.mockResolvedValue({
        data: undefined,
        status: 204,
        headers: {},
        config: { method: 'PUT', url: '/display/purgeAll/1' } as any
      });

      await displaysApi.purgeAll(1);

      expect(mockHttpClient.put).toHaveBeenCalledWith('/display/purgeAll/1', {}, undefined);
    });

    it('should purge all media from display with context', async () => {
      const context: Context = {
        timeout: 30000
      };

      mockHttpClient.put.mockResolvedValue({
        data: undefined,
        status: 204,
        headers: {},
        config: { method: 'PUT', url: '/display/purgeAll/1' } as any
      });

      await displaysApi.purgeAll(1, context);

      expect(mockHttpClient.put).toHaveBeenCalledWith('/display/purgeAll/1', {}, context);
    });
  });

  describe('buildQueryParams', () => {
    it('should build query parameters correctly', () => {
      const params = {
        displayId: 1,
        display: 'Test Display',
        tags: 'tag1,tag2',
        authorised: 1,
        loggedIn: 0,
        undefinedParam: undefined,
        nullParam: null,
        emptyString: ''
      };

      // Access the protected method through type assertion
      const queryParams = (displaysApi as any).buildQueryParams(params);

      expect(queryParams.get('displayId')).toBe('1');
      expect(queryParams.get('display')).toBe('Test Display');
      expect(queryParams.get('tags')).toBe('tag1,tag2');
      expect(queryParams.get('authorised')).toBe('1');
      expect(queryParams.get('loggedIn')).toBe('0');
      expect(queryParams.has('undefinedParam')).toBe(false);
      expect(queryParams.has('nullParam')).toBe(false);
      expect(queryParams.has('emptyString')).toBe(true);
    });

    it('should handle empty parameters object', () => {
      const queryParams = (displaysApi as any).buildQueryParams({});
      expect(queryParams.toString()).toBe('');
    });
  });

  describe('buildUrl', () => {
    it('should build URL without parameters', () => {
      const url = (displaysApi as any).buildUrl('/display');
      expect(url).toBe('/display');
    });

    it('should build URL with parameters', () => {
      const params = {
        displayId: 1,
        display: 'Test'
      };
      const url = (displaysApi as any).buildUrl('/display', params);
      expect(url).toBe('/display?displayId=1&display=Test');
    });

    it('should build URL with encoded parameters', () => {
      const params = {
        display: 'Test Display',
        tags: 'tag1,tag2'
      };
      const url = (displaysApi as any).buildUrl('/display', params);
      expect(url).toBe('/display?display=Test+Display&tags=tag1%2Ctag2');
    });
  });

  describe('error handling', () => {
    it('should propagate HTTP client errors', async () => {
      const error = new Error('Network error');
      mockHttpClient.get.mockRejectedValue(error);

      await expect(displaysApi.search()).rejects.toThrow('Network error');
    });

    it('should handle authentication errors', async () => {
      const error = new AuthenticationError('Invalid credentials');
      mockHttpClient.get.mockRejectedValue(error);

      await expect(displaysApi.get(1)).rejects.toThrow(AuthenticationError);
    });

    it('should handle validation errors', async () => {
      const updateData: DisplayUpdateParams = {
        display: 'Test',
        defaultLayoutId: 1,
        licensed: 1,
        license: 'test-license',
        incSchedule: 1,
        emailAlert: 1,
        wakeOnLanEnabled: 0
      };
      const error = new ValidationError('Invalid input');
      mockHttpClient.put.mockRejectedValue(error);

      await expect(displaysApi.update(1, updateData)).rejects.toThrow(ValidationError);
    });
  });

  describe('parameter validation', () => {
    it('should handle numeric displayId parameters', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: [sampleDisplay],
        status: 200,
        headers: { 'x-total-count': '1' },
        config: { method: 'GET', url: '/display' } as any
      });

      await displaysApi.get(123);

      expect(mockHttpClient.get).toHaveBeenCalledWith('/display', { displayId: '123' }, undefined);
    });

    it('should handle string parameters with special characters', async () => {
      const searchParams: DisplaySearchParams = {
        display: 'Test & Display',
        tags: 'tag1,tag2'
      };

      mockHttpClient.get.mockResolvedValue({
        data: [sampleDisplay],
        status: 200,
        headers: { 'x-total-count': '1' },
        config: { method: 'GET', url: '/display' } as any
      });

      await displaysApi.search(searchParams);

      expect(mockHttpClient.get).toHaveBeenCalledWith('/display', {
        display: 'Test & Display',
        tags: 'tag1,tag2'
      }, undefined);
    });
  });
});
