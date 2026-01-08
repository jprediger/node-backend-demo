import { z } from 'zod';

// GCS Pub/Sub notification payload
// https://cloud.google.com/storage/docs/pubsub-notifications#format
export const GcsObjectDataSchema = z.object({
  kind: z.literal('storage#object'),
  name: z.string(), // Object path, e.g., "uploads/originals/abc123/image.jpg"
  bucket: z.string(),
  eventType: z.string().optional(), // OBJECT_FINALIZE, OBJECT_DELETE, etc.
});

export type GcsObjectData = z.infer<typeof GcsObjectDataSchema>;

// Pub/Sub push message format
export const PubSubMessageSchema = z.object({
  message: z.object({
    data: z.string(), // Base64 encoded JSON
    messageId: z.string(),
    publishTime: z.string().optional(),
  }),
  subscription: z.string().optional(),
});

export type PubSubMessage = z.infer<typeof PubSubMessageSchema>;

// Simplified payload for local simulation/testing
export const SimulateGcsWebhookBodySchema = z.object({
  bucket: z.string(),
  objectPath: z.string(),
});

export type SimulateGcsWebhookBody = z.infer<
  typeof SimulateGcsWebhookBodySchema
>;
