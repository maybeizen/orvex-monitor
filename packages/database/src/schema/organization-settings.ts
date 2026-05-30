import { boolean, pgTable, uuid } from "drizzle-orm/pg-core";

import { usageEnforcementTypeEnum } from "./enums";
import { organizations } from "./organizations";

export const organizationSettings = pgTable("organization_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  organization_id: uuid("organization_id")
    .notNull()
    .unique()
    .references(() => organizations.id, { onDelete: "cascade" }),
  require_2fa: boolean("require_2fa").notNull().default(false),
  allow_public_dashboards: boolean("allow_public_dashboards").notNull().default(true),
  billing_type: usageEnforcementTypeEnum("billing_type").notNull().default("hard_limit"),
  notify_on_downtime: boolean("notify_on_downtime").notNull().default(true),
});
