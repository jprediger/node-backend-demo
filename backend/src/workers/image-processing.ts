import { Job, Processor } from 'bullmq';
import { FastifyBaseLogger, FastifyInstance } from 'fastify';
import { Storage } from '@google-cloud/storage';
import sharp from 'sharp';
import path from 'path';

// Config de thumbnail
const THUMBNAIL_CONFIG = {
  width: 300,
  height: 300,
  fit: 'inside' as const,
  quality: 80,
};

// Payload do job de imagem
export type ImageProcessingJobData = {
  bucket: string;
  objectPath: string;
  productId: string;
};

export type ImageProcessingDeps = {
  log: FastifyBaseLogger;
  prisma: FastifyInstance['prisma'];
  gcs: { storage: Storage; bucketName: string };
};

/**
 * Gera o path do thumbnail a partir do original.
 */
function getThumbnailPath(objectPath: string): string {
  const ext = path.extname(objectPath);
  const baseName = path.basename(objectPath, ext);
  // Usa prefixo diferente para evitar loops de webhook
  if (!objectPath.startsWith('uploads/originals/')) {
    throw new Error(
      `Invalid original objectPath. Expected prefix "uploads/originals/": ${objectPath}`
    );
  }

  // uploads/originals/{productId}/{filename} -> uploads/thumbnails/{productId}/
  const parts = objectPath.split('/');
  const productId = parts[2];
  if (!productId) {
    throw new Error(
      `Could not extract productId from objectPath: ${objectPath}`
    );
  }

  return `uploads/thumbnails/${productId}/${baseName}.webp`;
}

/**
 * Cria o processor do worker.
 */
export function createImageProcessor(
  deps: ImageProcessingDeps
): Processor<ImageProcessingJobData> {
  return async (job: Job<ImageProcessingJobData>) => {
    const { bucket, objectPath, productId } = job.data;

    deps.log.info(
      { jobId: job.id, bucket, objectPath, productId },
      'Processing image job'
    );

    // 1. Download image from GCS
    deps.log.info({ jobId: job.id, objectPath }, 'Downloading image from GCS');
    const file = deps.gcs.storage.bucket(bucket).file(objectPath);
    const [imageBuffer] = await file.download();

    // 2. Process image with Sharp - generate optimized thumbnail
    deps.log.info({ jobId: job.id }, 'Generating thumbnail with Sharp');
    const thumbnailBuffer = await sharp(imageBuffer)
      .resize(THUMBNAIL_CONFIG.width, THUMBNAIL_CONFIG.height, {
        fit: THUMBNAIL_CONFIG.fit,
        withoutEnlargement: true,
      })
      .webp({ quality: THUMBNAIL_CONFIG.quality })
      .toBuffer();

    // 3. Upload thumbnail to GCS
    const thumbnailPath = getThumbnailPath(objectPath);
    deps.log.info(
      { jobId: job.id, thumbnailPath },
      'Uploading thumbnail to GCS'
    );

    const thumbnailFile = deps.gcs.storage.bucket(bucket).file(thumbnailPath);
    await thumbnailFile.save(thumbnailBuffer, {
      contentType: 'image/webp',
      metadata: {
        cacheControl: 'public, max-age=31536000',
      },
    });

    // 4. Update product.thumbnailPath in database
    deps.log.info(
      { jobId: job.id, productId },
      'Updating product thumbnail path in database'
    );
    await deps.prisma.product.update({
      where: { id: productId },
      data: { thumbnailPath },
    });

    deps.log.info(
      { jobId: job.id, thumbnailPath },
      'Image processing completed successfully'
    );

    return { thumbnailPath };
  };
}
