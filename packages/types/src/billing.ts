import { SubscriptionPlan, UsageEnforcementType } from "./enums";

export interface PlanLimits {
  maxUsers: number;
  maxMonitors: number;
  maxAlertChannels: number;
  minCheckIntervalSec: number;
  storageLimitMB: number;
}

export interface PlanDefaults extends PlanLimits {
  billingType: UsageEnforcementType;
}

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  [SubscriptionPlan.Free]: {
    maxUsers: 3,
    maxMonitors: 5,
    maxAlertChannels: 2,
    minCheckIntervalSec: 300,
    storageLimitMB: 100,
  },
  [SubscriptionPlan.Pro]: {
    maxUsers: 25,
    maxMonitors: 100,
    maxAlertChannels: 20,
    minCheckIntervalSec: 60,
    storageLimitMB: 5_000,
  },
  [SubscriptionPlan.Enterprise]: {
    maxUsers: 1_000,
    maxMonitors: 10_000,
    maxAlertChannels: 200,
    minCheckIntervalSec: 30,
    storageLimitMB: 100_000,
  },
};

export const PLAN_DEFAULTS: Record<SubscriptionPlan, PlanDefaults> = {
  [SubscriptionPlan.Free]: {
    ...PLAN_LIMITS[SubscriptionPlan.Free],
    billingType: UsageEnforcementType.HardLimit,
  },
  [SubscriptionPlan.Pro]: {
    ...PLAN_LIMITS[SubscriptionPlan.Pro],
    billingType: UsageEnforcementType.SoftLimit,
  },
  [SubscriptionPlan.Enterprise]: {
    ...PLAN_LIMITS[SubscriptionPlan.Enterprise],
    billingType: UsageEnforcementType.SoftLimit,
  },
};
