import { boolean, jsonb, pgTable, timestamp, unique, uuid } from "drizzle-orm/pg-core";

import { organizationRoleEnum } from "./enums";
import { organizations } from "./organizations";
import { profiles } from "./profiles";

export const memberships = pgTable(
  "memberships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    user_id: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    invited_by: uuid("invited_by").references(() => profiles.id, { onDelete: "set null" }),
    joined_at: timestamp("joined_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
    role: organizationRoleEnum("role").notNull().default("member"),
    permissions_override: jsonb("permissions_override").notNull().default([]),
    is_owner: boolean("is_owner").notNull().default(false),
  },
  (table) => [unique().on(table.organization_id, table.user_id)],
);
