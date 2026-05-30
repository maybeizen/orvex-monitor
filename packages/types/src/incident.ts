import type { IncidentStatus } from "./enums";

export interface Incident {
  id: string;
  monitorId: string;
  status: IncidentStatus;
  startedAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  rootCause?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIncidentInput {
  monitorId: string;
  startedAt?: string | undefined;
  rootCause?: string | undefined;
  notes?: string | undefined;
}

export interface UpdateIncidentInput {
  status?: IncidentStatus | undefined;
  acknowledgedAt?: string | undefined;
  acknowledgedBy?: string | undefined;
  resolvedAt?: string | undefined;
  rootCause?: string | undefined;
  notes?: string | undefined;
}
