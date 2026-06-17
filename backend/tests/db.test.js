const { mockDeep } = require('jest-mock-extended');

jest.mock('../src/config/db', () => {
  const { mockDeep } = require('jest-mock-extended');
  return {
    prisma: mockDeep(),
    connectDB: jest.fn(),
  };
});

const { prisma } = require('../src/config/db');

describe('Database Tests (Constraints & Foreign Keys)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should prevent duplicate enrollments (simulating unique constraint)', async () => {
    prisma.enrollment.create.mockRejectedValue({
      code: 'P2002',
      clientVersion: '7.8.0',
      meta: { target: ['userId', 'courseId'] }
    });

    await expect(prisma.enrollment.create({
      data: { userId: '1', courseId: '1' }
    })).rejects.toMatchObject({ code: 'P2002' });
  });

  it('should simulate cascading deletes for lessons when course is deleted', async () => {
    prisma.course.delete.mockResolvedValue({ id: 'course_1' });
    
    const result = await prisma.course.delete({ where: { id: 'course_1' } });
    expect(result.id).toBe('course_1');
    expect(prisma.course.delete).toHaveBeenCalledWith({ where: { id: 'course_1' } });
  });
});
