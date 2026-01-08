import { FastifyPluginAsync } from 'fastify';

import { webhooksController } from './controller';
import { PubSubMessage, SimulateGcsWebhookBody } from './schema';

const webhooksModule: FastifyPluginAsync = async (fastify) => {
  const controller = webhooksController();

  // GCS Pub/Sub push endpoint chamado pelo Google
  fastify.post<{ Body: PubSubMessage }>('/gcs', controller.gcsNotification);

  // Endpoint de simulação para testes locais (apenas em ambiente de desenvolvimento)
  if (process.env.NODE_ENV !== 'production') {
    fastify.post<{ Body: SimulateGcsWebhookBody }>(
      '/gcs/simulate',
      controller.simulateGcsNotification
    );
  }
};

export default webhooksModule;
