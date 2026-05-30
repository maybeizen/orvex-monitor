export enum OrganizationStatus {
  Active = "active",
  Suspended = "suspended",
  TrialExpired = "trial_expired",
  PendingSetup = "pending_setup",
}

export enum SubscriptionPlan {
  Free = "free",
  Pro = "pro",
  Enterprise = "enterprise",
}

export enum UsageEnforcementType {
  HardLimit = "hard_limit",
  SoftLimit = "soft_limit",
}

export enum OrganizationRole {
  Owner = "owner",
  Admin = "admin",
  Member = "member",
  Viewer = "viewer",
}

export enum OrganizationPermission {
  OrgProfileView = "org:profile_view",
  OrgProfileEdit = "org:profile_edit",
  OrgBillingView = "org:billing_view",
  OrgBillingSubscribe = "org:billing_subscribe",
  OrgBillingCancel = "org:billing_cancel",
  OrgSettingsEdit = "org:settings_edit",
  OrgAuditLogsView = "org:audit_logs_view",

  MemberViewList = "member:view_list",
  MemberInvite = "member:invite",
  MemberManageRoles = "member:manage_roles",
  MemberRemove = "member:remove",

  MonitorViewAll = "monitor:view_all",
  MonitorCreate = "monitor:create",
  MonitorEditAny = "monitor:edit_any",
  MonitorDeleteAny = "monitor:delete_any",
  MonitorManageOwn = "monitor:manage_own",

  AlertChannelView = "alert_channel:view",
  AlertChannelCreate = "alert_channel:create",
  AlertChannelEditAny = "alert_channel:edit_any",
  AlertChannelDeleteAny = "alert_channel:delete_any",
  AlertRuleView = "alert_rule:view",
  AlertRuleCreate = "alert_rule:create",
  AlertRuleEditAny = "alert_rule:edit_any",
  AlertRuleDeleteAny = "alert_rule:delete_any",

  UsageViewFull = "usage:view_full",
}

export enum MonitorType {
  HTTP = "http",
  WebSocket = "websocket",
  Heartbeat = "heartbeat",
  TCP = "tcp",
  Ping = "ping",
  Database = "database",
  Email = "email",
}

export enum MonitorStatus {
  Up = "up",
  Down = "down",
  Maintenance = "maintenance",
  Unknown = "unknown",
}

export enum AlertChannelType {
  Email = "email",
  SMS = "sms",
  Webhook = "webhook",
  PhoneCall = "phone_call",
}

export enum IncidentStatus {
  Open = "open",
  Acknowledged = "acknowledged",
  Resolved = "resolved",
}

export enum CheckRegion {
  Default = "default",
  UsEast = "us-east",
  EuWest = "eu-west",
  ApSoutheast = "ap-southeast",
  ApNortheast = "ap-northeast",
  SaEast = "sa-east",
}
