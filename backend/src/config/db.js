require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const logger = require('../utils/logger');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

const prisma = new PrismaClient({ 
  adapter,
  log: ['query', 'info', 'warn', 'error'],
});

const connectDB = async () => {
  try {
    await prisma.$connect();
    logger.info('PostgreSQL Connected via Prisma');
  } catch (error) {
    logger.error({ err: error }, 'Database connection error');
    process.exit(1);
  }
};

module.exports = { connectDB, prisma };
