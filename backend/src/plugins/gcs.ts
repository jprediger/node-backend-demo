import fp from 'fastify-plugin';
import { Storage } from '@google-cloud/storage';
import type { FastifyPluginAsync } from 'fastify';

type SignedUploadUrlInput = {
  objectPath: string;
  contentType: string;
  expiresInSeconds?: number;
};

type SignedReadUrlInput = {
  objectPath: string;
  expiresInSeconds?: number;
};

declare module 'fastify' {
  interface FastifyInstance {
    gcs: {
      bucketName: string;
      storage: Storage;
    };
    gcsSignUploadUrl: (input: SignedUploadUrlInput) => Promise<string>;
    gcsSignReadUrl: (input: SignedReadUrlInput) => Promise<string>;
  }
}

const gcsPlugin: FastifyPluginAsync = fp(
  async (fastify) => {
    const bucketName = process.env.GCS_BUCKET;
    const defaultExpiresInSeconds = Number(
      process.env.GCS_SIGNED_URL_TTL_SECONDS ?? '600'
    );

    if (!bucketName) {
      throw new Error('GCS_BUCKET is not configured');
    }

    const storage = new Storage();

    fastify.decorate('gcs', { bucketName, storage });

    fastify.decorate(
      'gcsSignUploadUrl',
      async (input: SignedUploadUrlInput) => {
        const expiresInSeconds =
          input.expiresInSeconds ?? defaultExpiresInSeconds;
        const file = storage.bucket(bucketName).file(input.objectPath);

        const [url] = await file.getSignedUrl({
          version: 'v4',
          action: 'write',
          expires: Date.now() + expiresInSeconds * 1000,
          contentType: input.contentType,
        });

        return url;
      }
    );

    fastify.decorate('gcsSignReadUrl', async (input: SignedReadUrlInput) => {
      const expiresInSeconds =
        input.expiresInSeconds ?? defaultExpiresInSeconds;
      const file = storage.bucket(bucketName).file(input.objectPath);

      const [url] = await file.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + expiresInSeconds * 1000,
      });

      return url;
    });
  },
  {
    name: 'gcs',
  }
);

export default gcsPlugin;
