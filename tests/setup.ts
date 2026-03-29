// Mute console logs during tests to keep output clean, unless it's an error
global.console = {
    ...console,
    log: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
};

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/equipchat_test?schema=public';

// Setup global timeout
jest.setTimeout(10000);

beforeAll(async () => {
    // Global setup before tests (e.g. connecting to test DB or mocking Prisma)
});

afterAll(async () => {
    // Global teardown after tests
});
