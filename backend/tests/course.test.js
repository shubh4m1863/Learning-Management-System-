const request = require('supertest');
const app = require('../src/app');
const { prisma } = require('../src/config/db');
const jwt = require('jsonwebtoken');

jest.mock('../src/config/db', () => ({
  prisma: {
    course: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
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

jest.mock('../src/middlewares/cache.middleware', () => ({
  clearCache: jest.fn(),
  cacheMiddleware: () => (req, res, next) => next(),
}));

describe('Course API', () => {
  let userToken;
  let adminToken;

  beforeAll(() => {
    userToken = jwt.sign({ id: '1', role: 'user' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    adminToken = jwt.sign({ id: '2', role: 'admin' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/courses', () => {
    it('should return a list of courses', async () => {
      prisma.course.findMany.mockResolvedValue([{ id: '1', title: 'Test Course' }]);
      prisma.course.count.mockResolvedValue(1);

      const res = await request(app).get('/api/v1/courses');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
    });
  });

  describe('POST /api/v1/courses', () => {
    it('should prevent normal user from creating course', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: '1', role: 'user', status: 'approved' });
      
      const res = await request(app)
        .post('/api/v1/courses')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'New Course',
          description: 'Desc',
          category: 'Tech'
        });

      // Role authorization fails
      expect(res.statusCode).toEqual(403);
    });

    it('should allow admin to create a course', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: '2', role: 'admin', status: 'approved' });
      prisma.course.create.mockResolvedValue({ id: '2', title: 'New Course' });

      const res = await request(app)
        .post('/api/v1/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'New Course',
          description: 'Desc',
          category: 'Tech',
          level: 'Beginner'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('New Course');
    });
  });
});
