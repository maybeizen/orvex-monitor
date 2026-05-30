import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { monitorStatusEnum, monitorTypeEnum } from "./enums";
import { organizations } from "./organizations";
import { profiles } from "./profiles";

export const monitors = pgTable("monitors", {
  id: uuid("id").primaryKey().defaultRandom(),
  organization_id: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: monitorTypeEnum("type").notNull(),
  target: text("target").notNull(),
  interval_sec: integer("interval_sec").notNull().default(60),
  timeout_sec: integer("timeout_sec").notNull().default(10),
  enabled: boolean("enabled").notNull().default(true),
  status: monitorStatusEnum("status").notNull().default("unknown"),
  last_check: timestamp("last_check", { withTimezone: true, mode: "string" }),
  config: jsonb("config").notNull().default({}),
  created_by: uuid("created_by")
    .notNull()
    .references(() => profiles.id, { onDelete: "restrict" }),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
});
