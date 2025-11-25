/**
 * Test setup for Xibo CMS SDK
 */

// Global test configuration
beforeAll(() => {
  // Set test environment
  process.env.NODE_ENV = 'test';
});

afterAll(() => {
  // Cleanup after all tests
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to suppress logs during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};
