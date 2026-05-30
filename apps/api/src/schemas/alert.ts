import { z } from "zod";

import { AlertChannelType } from "@orvex/types";

const httpMethodSchema = z.enum(["POST", "PUT", "PATCH"]);

const emailChannelConfigSchema = z.object({
  type: z.literal("email"),
  toAddress: z.string().email(),
});

const smsChannelConfigSchema = z.object({
  type: z.literal("sms"),
  phoneNumber: z.string().min(4).max(32),
});

const webhookChannelConfigSchema = z.object({
  type: z.literal("webhook"),
  url: z.string().url(),
  method: httpMethodSchema.optional(),
  headers: z.record(z.string()).optional(),
  bodyTemplate: z.string().optional(),
});

const phoneCallChannelConfigSchema = z.object({
  type: z.literal("phone_call"),
  phoneNumber: z.string().min(4).max(32),
  voiceMessage: z.string().max(500).optional(),
});

const channelConfigSchema = z.discriminatedUnion("type", [
  emailChannelConfigSchema,
  smsChannelConfigSchema,
  webhookChannelConfigSchema,
  phoneCallChannelConfigSchema,
]);

export const createAlertChannelSchema = z
  .object({
    name: z.string().min(1).max(100),
    type: z.nativeEnum(AlertChannelType),
    config: channelConfigSchema,
    isActive: z.boolean().optional(),
  })
  .refine((d) => d.type === d.config.type, {
    message: "channel.type must match config.type",
    path: ["config", "type"],
  });

export const updateAlertChannelSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  config: channelConfigSchema.optional(),
  isActive: z.boolean().optional(),
});

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
const timeSchema = z.string().regex(timeRegex, "must be HH:MM (24h)");

const conditionSchema = z.enum([
  "down",
  "up",
  "degraded",
  "ssl_expiring",
  "high_response_time",
]);

export const createAlertRuleSchema = z.object({
  monitorId: z.string().uuid(),
  channelId: z.string().uuid(),
  conditions: z.array(conditionSchema).min(1),
  escalation: z.boolean().optional(),
  quietHoursStart: timeSchema.optional(),
  quietHoursEnd: timeSchema.optional(),
});

export const updateAlertRuleSchema = z.object({
  channelId: z.string().uuid().optional(),
  conditions: z.array(conditionSchema).min(1).optional(),
  escalation: z.boolean().optional(),
  quietHoursStart: timeSchema.optional(),
  quietHoursEnd: timeSchema.optional(),
});

export type CreateAlertChannelBody = z.infer<typeof createAlertChannelSchema>;
export type UpdateAlertChannelBody = z.infer<typeof updateAlertChannelSchema>;
export type CreateAlertRuleBody = z.infer<typeof createAlertRuleSchema>;
export type UpdateAlertRuleBody = z.infer<typeof updateAlertRuleSchema>;
