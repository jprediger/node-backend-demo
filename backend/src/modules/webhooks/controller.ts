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
    // Webhook do Pub/Sub do GCS (push)
    gcsNotification: async (
      request: FastifyRequest<{ Body: PubSubMessage }>,
      reply: FastifyReply
    ) => {
      // Valida envelope Pub/Sub
      const parsedBody = PubSubMessageSchema.safeParse(request.body);
      if (!parsedBody.success) {
        return replyBadRequestFromZod(reply, parsedBody.error);
      }

      // Decodifica base64
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

      // Valida payload do GCS
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

      // Enfileira processamento de imagem
      await request.server.enqueueImageProcessing({
        bucket,
        objectPath,
        productId,
      });

      return { message: 'Job enqueued' };
    },

    // Simula notificação do GCS em dev
    simulateGcsNotification: async (
      request: FastifyRequest<{ Body: SimulateGcsWebhookBody }>,
      reply: FastifyReply
    ) => {
      // Só em ambiente de desenvolvimento
      if (process.env.NODE_ENV === 'production') {
        reply.code(404);
        return { message: 'Not found' };
      }

      const parsedBody = SimulateGcsWebhookBodySchema.safeParse(request.body);
      if (!parsedBody.success) {
        return replyBadRequestFromZod(reply, parsedBody.error);
      }

      const { bucket, objectPath } = parsedBody.data;

      // Só originais (uploads/originals/...)
      if (!objectPath.startsWith('uploads/originals/')) {
        reply.code(400);
        return { message: 'objectPath must start with "uploads/originals/"' };
      }

      // Extrai productId do path
      const pathParts = objectPath.split('/');
      const productId = pathParts[2];

      if (!productId) {
        reply.code(400);
        return { message: 'Could not extract productId from objectPath' };
      }

      // Enfileira processamento
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
