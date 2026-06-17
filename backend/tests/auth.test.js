const request = require('supertest');
const app = require('../src/app');
const { prisma } = require('../src/config/db');
const redis = require('../src/services/redis.service');
const bcrypt = require('bcryptjs');

jest.mock('../src/config/db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    $queryRaw: jest.fn(),
  },
  connectDB: jest.fn(),
}));

jest.mock('../src/services/redis.service', () => ({
  on: jest.fn(),
  ping: jest.fn().mockResolvedValue('PONG'),
  call: jest.fn().mockResolvedValue([]),
}));

describe('Auth API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        status: 'pending'
      });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.pending).toBe(true);
      expect(res.body.token).toBeUndefined();
    });

    it('should return error if email already exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: '2', email: 'test@example.com' });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('User already exists');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login user and return token', async () => {
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      prisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'user',
        status: 'approved'
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });
  });
});
