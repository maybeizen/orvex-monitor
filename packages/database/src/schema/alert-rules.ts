import { boolean, jsonb, pgTable, time, timestamp, uuid } from "drizzle-orm/pg-core";

import { alertChannels } from "./alert-channels";
import { monitors } from "./monitors";
import { organizations } from "./organizations";

export const alertRules = pgTable("alert_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  organization_id: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  monitor_id: uuid("monitor_id")
    .notNull()
    .references(() => monitors.id, { onDelete: "cascade" }),
  channel_id: uuid("channel_id")
    .notNull()
    .references(() => alertChannels.id, { onDelete: "cascade" }),
  conditions: jsonb("conditions").notNull().default([]),
  escalation: boolean("escalation").notNull().default(false),
  quiet_hours_start: time("quiet_hours_start"),
  quiet_hours_end: time("quiet_hours_end"),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
});
