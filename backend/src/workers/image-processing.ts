import { Job, Processor } from 'bullmq';
import { FastifyBaseLogger, FastifyInstance } from 'fastify';
import { Storage } from '@google-cloud/storage';
import sharp from 'sharp';
import path from 'path';

// Thumbnail configuration
const THUMBNAIL_CONFIG = {
  width: 300,
  height: 300,
  fit: 'inside' as const,
  quality: 80,
};

// Job data type for image processing
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
 * Generates the thumbnail path from the original image path.
 * Example: "products/{id}/original/image.jpg" -> "products/{id}/thumbnails/image.webp"
 */
function getThumbnailPath(objectPath: string): string {
  const ext = path.extname(objectPath);
  const baseName = path.basename(objectPath, ext);
  // Replace /original/ with /thumbnails/ in the path
  const thumbnailDir = path
    .dirname(objectPath)
    .replace('/original', '/thumbnails');
  return path.join(thumbnailDir, `${baseName}.webp`);
}

/**
 * Creates the image processing worker processor function.
 * Separated from the plugin for better testability and organization.
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
