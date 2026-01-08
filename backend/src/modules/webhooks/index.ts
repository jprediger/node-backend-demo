import { FastifyPluginAsync } from 'fastify';

import { webhooksController } from './controller';
import { PubSubMessage, SimulateGcsWebhookBody } from './schema';

const webhooksModule: FastifyPluginAsync = async (fastify) => {
  const controller = webhooksController();

  // GCS Pub/Sub push endpoint - no authentication (called by Google)
  fastify.post<{ Body: PubSubMessage }>('/gcs', controller.gcsNotification);

  // Simulation endpoint for local testing (only in development)
  if (process.env.NODE_ENV !== 'production') {
    fastify.post<{ Body: SimulateGcsWebhookBody }>(
      '/gcs/simulate',
      controller.simulateGcsNotification
    );
  }
};

export default webhooksModule;
