import { pgEnum } from "drizzle-orm/pg-core";

export const organizationStatusEnum = pgEnum("organization_status", [
  "active",
  "suspended",
  "trial_expired",
  "pending_setup",
]);

export const subscriptionPlanEnum = pgEnum("subscription_plan", [
  "free",
  "pro",
  "enterprise",
]);

export const usageEnforcementTypeEnum = pgEnum("usage_enforcement_type", [
  "hard_limit",
  "soft_limit",
]);

export const organizationRoleEnum = pgEnum("organization_role", [
  "owner",
  "admin",
  "member",
  "viewer",
]);

export const monitorTypeEnum = pgEnum("monitor_type", [
  "http",
  "websocket",
  "heartbeat",
  "tcp",
  "ping",
  "database",
  "email",
]);

export const monitorStatusEnum = pgEnum("monitor_status", [
  "up",
  "down",
  "maintenance",
  "unknown",
]);

export const alertChannelTypeEnum = pgEnum("alert_channel_type", [
  "email",
  "sms",
  "webhook",
  "phone_call",
]);

export const incidentStatusEnum = pgEnum("incident_status", [
  "open",
  "acknowledged",
  "resolved",
]);

export const userAvatarTypeEnum = pgEnum("user_avatar_type", [
  "gravatar",
  "upload",
  "none",
]);

export const userStatusEnum = pgEnum("user_status", [
  "online",
  "offline",
  "away",
  "do_not_disturb",
]);

export const userGlobalRoleEnum = pgEnum("user_global_role", [
  "user",
  "moderator",
  "support",
  "admin",
]);

export const userOauthProviderEnum = pgEnum("user_oauth_provider", ["google", "github"]);
