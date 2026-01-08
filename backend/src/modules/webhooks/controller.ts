import { FastifyReply, FastifyRequest } from 'fastify';

import {
  GcsObjectDataSchema,
  PubSubMessage,
  PubSubMessageSchema,
  SimulateGcsWebhookBody,
  SimulateGcsWebhookBodySchema,
} from './schema';
import { replyBadRequestFromZod } from '../../utils/zod';

export function webhooksController() {
  return {
    /**
     * Handles GCS Pub/Sub push notifications.
     * Called by Google Cloud Pub/Sub when an object is created/modified in GCS.
     */
    gcsNotification: async (
      request: FastifyRequest<{ Body: PubSubMessage }>,
      reply: FastifyReply
    ) => {
      // Parse Pub/Sub envelope
      const parsedBody = PubSubMessageSchema.safeParse(request.body);
      if (!parsedBody.success) {
        return replyBadRequestFromZod(reply, parsedBody.error);
      }

      // Decode base64 data
      let decodedData: unknown;
      try {
        const jsonString = Buffer.from(
          parsedBody.data.message.data,
          'base64'
        ).toString('utf-8');
        decodedData = JSON.parse(jsonString);
      } catch {
        reply.code(400);
        return { message: 'Invalid base64 or JSON in message.data' };
      }

      // Parse GCS object data
      const parsedGcsData = GcsObjectDataSchema.safeParse(decodedData);
      if (!parsedGcsData.success) {
        request.log.warn({ decodedData }, 'Invalid GCS object data format');
        reply.code(400);
        return { message: 'Invalid GCS object data format' };
      }

      const { bucket, name: objectPath } = parsedGcsData.data;

      if (!objectPath.startsWith('uploads/originals/')) {
        request.log.info({ objectPath }, 'Ignoring non-original upload object');
        return { message: 'Ignored: not an original upload' };
      }

      const pathParts = objectPath.split('/');
      const productId = pathParts[2];

      if (!productId) {
        request.log.warn(
          { objectPath },
          'Could not extract productId from path'
        );
        reply.code(400);
        return { message: 'Could not extract productId from object path' };
      }

      // Enqueue image processing job
      await request.server.enqueueImageProcessing({
        bucket,
        objectPath,
        productId,
      });

      return { message: 'Job enqueued' };
    },

    /**
     * Simulates a GCS Pub/Sub notification for local testing.
     * Only available in development mode.
     */
    simulateGcsNotification: async (
      request: FastifyRequest<{ Body: SimulateGcsWebhookBody }>,
      reply: FastifyReply
    ) => {
      // Only allow in development
      if (process.env.NODE_ENV === 'production') {
        reply.code(404);
        return { message: 'Not found' };
      }

      const parsedBody = SimulateGcsWebhookBodySchema.safeParse(request.body);
      if (!parsedBody.success) {
        return replyBadRequestFromZod(reply, parsedBody.error);
      }

      const { bucket, objectPath } = parsedBody.data;

      // Only process originals (uploads/originals/...) to match production behavior.
      if (!objectPath.startsWith('uploads/originals/')) {
        reply.code(400);
        return { message: 'objectPath must start with "uploads/originals/"' };
      }

      // Extract productId from path: uploads/originals/{productId}/{filename}
      const pathParts = objectPath.split('/');
      const productId = pathParts[2];

      if (!productId) {
        reply.code(400);
        return { message: 'Could not extract productId from objectPath' };
      }

      // Enqueue image processing job
      const job = await request.server.enqueueImageProcessing({
        bucket,
        objectPath,
        productId,
      });

      return {
        message: 'Job enqueued (simulated)',
        jobId: job.id,
        data: { bucket, objectPath, productId },
      };
    },
  };
}
