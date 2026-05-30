import { z } from "zod";

export const heartbeatMetricsSchema = z.object({
  cpuUsagePercent: z.number().min(0).max(100).optional(),
  memoryUsageMB: z.number().min(0).optional(),
  memoryTotalMB: z.number().min(0).optional(),
  storageUsedMB: z.number().min(0).optional(),
  storageTotalMB: z.number().min(0).optional(),
  networkInKbps: z.number().min(0).optional(),
  networkOutKbps: z.number().min(0).optional(),
  uptimeSec: z.number().min(0).optional(),
});

export const heartbeatIngestSchema = z.object({
  metrics: heartbeatMetricsSchema.optional(),
  message: z.string().max(1024).optional(),
});

export type HeartbeatIngestBody = z.infer<typeof heartbeatIngestSchema>;
