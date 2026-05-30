import type { AlertChannelType } from "./enums";

export interface EmailChannelConfig {
  toAddress: string;
}

export interface SmsChannelConfig {
  phoneNumber: string;
}

export interface WebhookChannelConfig {
  url: string;
  method?: "POST" | "PUT" | "PATCH";
  headers?: Record<string, string>;
  bodyTemplate?: string;
}

export interface PhoneCallChannelConfig {
  phoneNumber: string;
  voiceMessage?: string;
}

export type AlertChannelConfig =
  | ({ type: "email" } & EmailChannelConfig)
  | ({ type: "sms" } & SmsChannelConfig)
  | ({ type: "webhook" } & WebhookChannelConfig)
  | ({ type: "phone_call" } & PhoneCallChannelConfig);

export interface AlertChannel {
  id: string;
  organizationId: string;
  name: string;
  type: AlertChannelType;
  config: AlertChannelConfig;
  isActive: boolean;
  createdAt: string;
}

export interface CreateAlertChannelInput {
  name: string;
  type: AlertChannelType;
  config: AlertChannelConfig;
  isActive?: boolean | undefined;
}

export interface UpdateAlertChannelInput {
  name?: string | undefined;
  config?: AlertChannelConfig | undefined;
  isActive?: boolean | undefined;
}

export type AlertCondition = "down" | "up" | "degraded" | "ssl_expiring" | "high_response_time";

export interface AlertRule {
  id: string;
  organizationId: string;
  monitorId: string;
  channelId: string;
  conditions: AlertCondition[];
  escalation: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAlertRuleInput {
  monitorId: string;
  channelId: string;
  conditions: AlertCondition[];
  escalation?: boolean | undefined;
  quietHoursStart?: string | undefined;
  quietHoursEnd?: string | undefined;
}

export interface UpdateAlertRuleInput {
  channelId?: string | undefined;
  conditions?: AlertCondition[] | undefined;
  escalation?: boolean | undefined;
  quietHoursStart?: string | undefined;
  quietHoursEnd?: string | undefined;
}
