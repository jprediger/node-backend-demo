import { z } from 'zod';

export const GcsObjectDataSchema = z.object({
  kind: z.literal('storage#object'),
  name: z.string(),
  bucket: z.string(),
  eventType: z.string().optional(),
});

export type GcsObjectData = z.infer<typeof GcsObjectDataSchema>;

export const PubSubMessageSchema = z.object({
  message: z.object({
    data: z.string(),
    messageId: z.string(),
    publishTime: z.string().optional(),
  }),
  subscription: z.string().optional(),
});

export type PubSubMessage = z.infer<typeof PubSubMessageSchema>;

export const SimulateGcsWebhookBodySchema = z.object({
  bucket: z.string(),
  objectPath: z.string(),
});

export type SimulateGcsWebhookBody = z.infer<
  typeof SimulateGcsWebhookBodySchema
>;
