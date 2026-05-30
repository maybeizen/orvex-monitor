import { z } from "zod";

import { MonitorStatus, MonitorType } from "@orvex/types";

const httpMethodSchema = z.enum([
  "GET",
  "HEAD",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "OPTIONS",
]);

const httpConfigSchema = z.object({
  type: z.literal("http"),
  method: httpMethodSchema.default("GET"),
  headers: z.record(z.string()).optional(),
  body: z.string().optional(),
  expectedStatusCodes: z.array(z.number().int().min(100).max(599)).optional(),
  followRedirects: z.boolean().optional(),
  verifyTls: z.boolean().optional(),
});

const wsConfigSchema = z.object({
  type: z.literal("websocket"),
  protocol: z.string().optional(),
  pingMessage: z.string().optional(),
  expectedMessage: z.string().optional(),
});

const tcpConfigSchema = z.object({
  type: z.literal("tcp"),
  port: z.number().int().min(1).max(65_535),
});

const pingConfigSchema = z.object({
  type: z.literal("ping"),
  packetCount: z.number().int().min(1).max(10).optional(),
});

const databaseConfigSchema = z.object({
  type: z.literal("database"),
  engine: z.enum(["postgres", "mysql", "mongodb", "redis"]),
  connectionString: z.string().optional(),
  query: z.string().optional(),
});

const emailConfigSchema = z.object({
  type: z.literal("email"),
  smtpHost: z.string().optional(),
  smtpPort: z.number().int().min(1).max(65_535).optional(),
  fromAddress: z.string().email().optional(),
  expectedResponseCode: z.number().int().optional(),
});

const heartbeatConfigSchema = z.object({
  type: z.literal("heartbeat"),
  token: z.string().min(16).max(128),
  graceSec: z.number().int().min(1).max(86_400).optional(),
});

const configSchema = z.discriminatedUnion("type", [
  httpConfigSchema,
  wsConfigSchema,
  tcpConfigSchema,
  pingConfigSchema,
  databaseConfigSchema,
  emailConfigSchema,
  heartbeatConfigSchema,
]);

const baseMonitorFields = {
  name: z.string().min(1).max(100),
  type: z.nativeEnum(MonitorType),
  target: z.string().min(1).max(2048),
  intervalSec: z.number().int().min(10).max(86_400),
  timeoutSec: z.number().int().min(1).max(300),
  enabled: z.boolean().optional(),
};

export const createMonitorSchema = z
  .object({ ...baseMonitorFields, config: configSchema })
  .refine((d) => d.type === d.config.type, {
    message: "monitor.type must match config.type",
    path: ["config", "type"],
  });

export const updateMonitorSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    type: z.nativeEnum(MonitorType).optional(),
    target: z.string().min(1).max(2048).optional(),
    intervalSec: z.number().int().min(10).max(86_400).optional(),
    timeoutSec: z.number().int().min(1).max(300).optional(),
    enabled: z.boolean().optional(),
    status: z.nativeEnum(MonitorStatus).optional(),
    config: configSchema.optional(),
  })
  .refine(
    (d) => d.type === undefined || d.config === undefined || d.type === d.config.type,
    {
      message: "monitor.type must match config.type",
      path: ["config", "type"],
    },
  );

export type CreateMonitorBody = z.infer<typeof createMonitorSchema>;
export type UpdateMonitorBody = z.infer<typeof updateMonitorSchema>;
