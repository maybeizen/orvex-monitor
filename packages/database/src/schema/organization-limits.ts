import { integer, pgTable, uuid } from "drizzle-orm/pg-core";

import { organizations } from "./organizations";

export const organizationLimits = pgTable("organization_limits", {
  id: uuid("id").primaryKey().defaultRandom(),
  organization_id: uuid("organization_id")
    .notNull()
    .unique()
    .references(() => organizations.id, { onDelete: "cascade" }),
  max_users: integer("max_users").notNull().default(3),
  max_monitors: integer("max_monitors").notNull().default(5),
  max_alert_channels: integer("max_alert_channels").notNull().default(2),
  min_check_interval_sec: integer("min_check_interval_sec").notNull().default(300),
  storage_limit_mb: integer("storage_limit_mb").notNull().default(100),
});
