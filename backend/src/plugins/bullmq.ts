import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import { Queue, Worker, Job, ConnectionOptions } from 'bullmq';

import {
  ImageProcessingJobData,
  createImageProcessor,
} from '../workers/image-processing';

declare module 'fastify' {
  interface FastifyInstance {
    bullmq: {
      imageProcessingQueue: Queue<ImageProcessingJobData>;
    };
    enqueueImageProcessing: (
      data: ImageProcessingJobData
    ) => Promise<Job<ImageProcessingJobData>>;
  }
}

const bullmqPlugin: FastifyPluginAsync = fp(
  async (fastify) => {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
      throw new Error('REDIS_URL is not configured');
    }

    // Parse Redis URL for connection options
    const url = new URL(redisUrl);
    const connection: ConnectionOptions = {
      host: url.hostname,
      port: parseInt(url.port || '6379', 10),
      password: url.password || undefined,
      maxRetriesPerRequest: null, // Required by BullMQ
    };

    const imageProcessingQueue = new Queue<ImageProcessingJobData>(
      'image-processing',
      { connection }
    );

    // Create worker only if enabled via environment variable
    const shouldRunWorker = process.env.RUN_IMAGE_WORKER === 'true';
    let worker: Worker<ImageProcessingJobData> | undefined;

    if (shouldRunWorker) {
      // Create worker with injected dependencies
      const processor = createImageProcessor({
        log: fastify.log,
        prisma: fastify.prisma,
        gcs: fastify.gcs,
      });

      worker = new Worker<ImageProcessingJobData>(
        'image-processing',
        processor,
        { connection }
      );

      worker.on('completed', (job) => {
        fastify.log.info({ jobId: job.id }, 'Job completed successfully');
      });

      worker.on('failed', (job, err) => {
        fastify.log.error({ jobId: job?.id, error: err.message }, 'Job failed');
      });

      fastify.log.info('Image worker started and listening for jobs');
    } else {
      fastify.log.info('Image worker is disabled in this instance');
    }

    // Decorate Fastify instance
    fastify.decorate('bullmq', { imageProcessingQueue });

    fastify.decorate(
      'enqueueImageProcessing',
      async (data: ImageProcessingJobData) => {
        const job = await imageProcessingQueue.add('process-image', data, {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
        });
        fastify.log.info(
          { jobId: job.id, data },
          'Image processing job enqueued'
        );
        return job;
      }
    );

    // Cleanup on shutdown
    fastify.addHook('onClose', async () => {
      if (worker) {
        await worker.close();
      }
      await imageProcessingQueue.close();
    });
  },
  {
    name: 'bullmq',
    dependencies: ['prisma', 'gcs'],
  }
);

export default bullmqPlugin;
