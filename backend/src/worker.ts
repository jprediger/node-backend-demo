import 'dotenv/config';
import Fastify from 'fastify';
import prismaPlugin from './plugins/prisma';
import gcsPlugin from './plugins/gcs';
import bullmqPlugin from './plugins/bullmq';

async function main() {
  // Habilita worker
  process.env.RUN_IMAGE_WORKER = 'true';

  const app = Fastify({
    logger: {
      level: 'info',
      transport: {
        target: 'pino-pretty',
      },
    },
  });

  try {
    app.log.info('Starting worker process...');

    // Plugins necessários (prisma, gcs, bullmq)
    await app.register(prismaPlugin);
    await app.register(gcsPlugin);
    await app.register(bullmqPlugin);

    // Aguarda plugins
    await app.ready();

    app.log.info('Worker process is running and processing jobs...');

    // Finalização graciosa
    const signals = ['SIGINT', 'SIGTERM'] as const;
    signals.forEach((signal) => {
      process.on(signal, async () => {
        app.log.info(`Received ${signal}, shutting down worker...`);
        await app.close();
        process.exit(0);
      });
    });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
