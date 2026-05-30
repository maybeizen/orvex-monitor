import type { MonitorStatus, MonitorType } from "./enums";

export type HttpMethod = "GET" | "HEAD" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS";

export interface HttpConfig {
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: string;
  expectedStatusCodes?: number[];
  followRedirects?: boolean;
  verifyTls?: boolean;
}

export interface WebSocketConfig {
  protocol?: string;
  pingMessage?: string;
  expectedMessage?: string;
}

export interface TcpConfig {
  port: number;
}

export interface PingConfig {
  packetCount?: number;
}

export interface DatabaseConfig {
  engine: "postgres" | "mysql" | "mongodb" | "redis";
  connectionString?: string;
  query?: string;
}

export interface EmailConfig {
  smtpHost?: string;
  smtpPort?: number;
  fromAddress?: string;
  expectedResponseCode?: number;
}

export interface HeartbeatConfig {
  token: string;
  graceSec?: number;
}

export type MonitorConfig =
  | ({ type: "http" } & HttpConfig)
  | ({ type: "websocket" } & WebSocketConfig)
  | ({ type: "tcp" } & TcpConfig)
  | ({ type: "ping" } & PingConfig)
  | ({ type: "database" } & DatabaseConfig)
  | ({ type: "email" } & EmailConfig)
  | ({ type: "heartbeat" } & HeartbeatConfig);

export interface Monitor {
  id: string;
  organizationId: string;
  name: string;
  type: MonitorType;
  target: string;
  intervalSec: number;
  timeoutSec: number;
  enabled: boolean;
  status: MonitorStatus;
  lastCheck?: string;
  config: MonitorConfig;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMonitorInput {
  name: string;
  type: MonitorType;
  target: string;
  intervalSec: number;
  timeoutSec: number;
  enabled?: boolean | undefined;
  config: MonitorConfig;
}

export interface UpdateMonitorInput {
  name?: string | undefined;
  type?: MonitorType | undefined;
  target?: string | undefined;
  intervalSec?: number | undefined;
  timeoutSec?: number | undefined;
  enabled?: boolean | undefined;
  status?: MonitorStatus | undefined;
  config?: MonitorConfig | undefined;
}

export interface MonitorStatusUpdate {
  status: MonitorStatus;
  lastCheck: string;
}
