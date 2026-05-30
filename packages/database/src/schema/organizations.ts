import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import {
  organizationStatusEnum,
  subscriptionPlanEnum,
} from "./enums";
import { profiles } from "./profiles";

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon"),
  owner_id: uuid("owner_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "restrict" }),
  status: organizationStatusEnum("status").notNull().default("active"),
  is_personal: boolean("is_personal").notNull().default(false),
  plan: subscriptionPlanEnum("plan").notNull().default("free"),
  customer_id: text("customer_id"),
  subscription_id: text("subscription_id"),
  auto_renew: boolean("auto_renew").notNull().default(true),
  plan_expires_at: timestamp("plan_expires_at", { withTimezone: true, mode: "string" }),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
});
