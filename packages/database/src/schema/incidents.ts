import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { incidentStatusEnum } from "./enums";
import { monitors } from "./monitors";
import { profiles } from "./profiles";

export const incidents = pgTable("incidents", {
  id: uuid("id").primaryKey().defaultRandom(),
  monitor_id: uuid("monitor_id")
    .notNull()
    .references(() => monitors.id, { onDelete: "cascade" }),
  status: incidentStatusEnum("status").notNull().default("open"),
  started_at: timestamp("started_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
  acknowledged_at: timestamp("acknowledged_at", { withTimezone: true, mode: "string" }),
  acknowledged_by: uuid("acknowledged_by").references(() => profiles.id, {
    onDelete: "set null",
  }),
  resolved_at: timestamp("resolved_at", { withTimezone: true, mode: "string" }),
  root_cause: text("root_cause"),
  notes: text("notes"),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
});
