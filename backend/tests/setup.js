// Setup file for Jest
// You can add global mocks or matchers here

process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '1d';

jest.mock('bullmq', () => ({
  Queue: jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    on: jest.fn(),
  })),
  Worker: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
  })),
}));
