const { Queue } = require('bullmq');
const redisConfig = require('../services/redis.service');
const logger = require('../utils/logger');

const emailQueue = new Queue('email-queue', {
  connection: redisConfig
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
