import { boolean, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { monitors } from "./monitors";

export const checkResults = pgTable("check_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  monitor_id: uuid("monitor_id")
    .notNull()
    .references(() => monitors.id, { onDelete: "cascade" }),
  checked_at: timestamp("checked_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
  is_up: boolean("is_up").notNull(),
  status_code: integer("status_code"),
  response_ms: integer("response_ms"),
  error_message: text("error_message"),
  region: text("region").notNull().default("default"),
  heartbeat_metrics: jsonb("heartbeat_metrics"),
});
