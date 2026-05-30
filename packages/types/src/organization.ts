import type {
  OrganizationStatus,
  SubscriptionPlan,
  UsageEnforcementType,
} from "./enums";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  icon?: string;

  ownerId: string;
  status: OrganizationStatus;
  isPersonal: boolean;

  plan: SubscriptionPlan;
  customerId?: string;
  subscriptionId?: string;
  autoRenew: boolean;
  planExpiresAt?: string;

  createdAt: string;
  updatedAt: string;
}

export interface OrganizationListItem extends Organization {
  memberCount: number;
}

export interface OrganizationLimits {
  id: string;
  organizationId: string;
  maxUsers: number;
  maxMonitors: number;
  maxAlertChannels: number;
  minCheckIntervalSec: number;
  storageLimitMB: number;
}

export interface OrganizationSettings {
  id: string;
  organizationId: string;
  require2FA: boolean;
  allowPublicDashboards: boolean;
  billingType: UsageEnforcementType;
  notifyOnDowntime: boolean;
}

export interface CreateOrganizationInput {
  name: string;
  slug: string;
  icon?: string | undefined;
  isPersonal?: boolean | undefined;
  plan?: SubscriptionPlan | undefined;
}

export interface UpdateOrganizationInput {
  name?: string | undefined;
  slug?: string | undefined;
  icon?: string | undefined;
  status?: OrganizationStatus | undefined;
  isPersonal?: boolean | undefined;
  plan?: SubscriptionPlan | undefined;
  customerId?: string | undefined;
  subscriptionId?: string | undefined;
  autoRenew?: boolean | undefined;
  planExpiresAt?: string | undefined;
}

export interface UpdateOrganizationSettingsInput {
  require2FA?: boolean | undefined;
  allowPublicDashboards?: boolean | undefined;
  billingType?: UsageEnforcementType | undefined;
  notifyOnDowntime?: boolean | undefined;
}
