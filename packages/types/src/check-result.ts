import type { CheckRegion } from "./enums";

export interface HeartbeatMetrics {
  cpuUsagePercent?: number | undefined;
  memoryUsageMB?: number | undefined;
  memoryTotalMB?: number | undefined;
  storageUsedMB?: number | undefined;
  storageTotalMB?: number | undefined;
  networkInKbps?: number | undefined;
  networkOutKbps?: number | undefined;
  uptimeSec?: number | undefined;
}

export interface CheckResult {
  id: string;
  monitorId: string;
  checkedAt: string;
  isUp: boolean;
  statusCode?: number;
  responseMs?: number;
  errorMessage?: string;
  region: CheckRegion;
  heartbeatMetrics?: HeartbeatMetrics;
}

export interface CreateCheckResultInput {
  monitorId: string;
  isUp: boolean;
  statusCode?: number | undefined;
  responseMs?: number | undefined;
  errorMessage?: string | undefined;
  region?: CheckRegion | undefined;
  heartbeatMetrics?: HeartbeatMetrics | undefined;
}
