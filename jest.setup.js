// Jest setup file

// Mock console warnings/errors in tests (optional)
global.console = {
    ...console,
    error: jest.fn(),
    warn: jest.fn(),
};
