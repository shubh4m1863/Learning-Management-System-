const { Queue } = require('bullmq');
const redisConfig = require('../services/redis.service');
const logger = require('../utils/logger');

// Initialize the queue using the existing Redis connection options
// ioredis instance cannot be directly passed to connection in older bullmq without maxRetriesPerRequest: null,
// but passing the host/port config is safer.
const connectionOptions = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null, // Required by BullMQ
  enableOfflineQueue: false // Fail fast if Redis is down
};

const emailQueue = new Queue('email-queue', {
  connection: connectionOptions
});

/**
 * Add an email job to the queue
 * @param {Object} emailData 
 * @param {string} emailData.to
 * @param {string} emailData.subject
 * @param {string} emailData.body
 */
const addEmailJob = async (emailData) => {
  try {
    const job = await emailQueue.add('send-email', emailData, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      }
    });
    logger.info(`[EmailQueue] Job added: ${job.id}`);
    return job;
  } catch (error) {
    logger.error({ err: error }, '[EmailQueue] Error adding job');
  }
};

module.exports = { emailQueue, addEmailJob };
