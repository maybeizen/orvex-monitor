import { sql } from "drizzle-orm";
import {
  boolean,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import {
  userAvatarTypeEnum,
  userGlobalRoleEnum,
  userStatusEnum,
} from "./enums";

export const profiles = pgTable(
  "profiles",
  {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  password_hash: text("password_hash"),
  full_name: text("full_name"),
  avatar_url: text("avatar_url"),
  timezone: text("timezone").notNull().default("UTC"),
  first_name: text("first_name").notNull().default(""),
  last_name: text("last_name").notNull().default(""),
  username: text("username").notNull(),
  avatar_type: userAvatarTypeEnum("avatar_type").notNull().default("gravatar"),
  global_role: userGlobalRoleEnum("global_role").notNull().default("user"),
  status: userStatusEnum("status").notNull().default("offline"),
  is_banned: boolean("is_banned").notNull().default(false),
  banned_at: timestamp("banned_at", { withTimezone: true, mode: "string" }),
  email_verified: boolean("email_verified").notNull().default(false),
  last_login_at: timestamp("last_login_at", { withTimezone: true, mode: "string" }),
  deleted_at: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
  deletion_requested_at: timestamp("deletion_requested_at", {
    withTimezone: true,
    mode: "string",
  }),
  deletion_scheduled_at: timestamp("deletion_scheduled_at", {
    withTimezone: true,
    mode: "string",
  }),
  gravatar_email: text("gravatar_email"),
  mfa_enabled: boolean("mfa_enabled").notNull().default(false),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
  },
  (table) => [
    uniqueIndex("profiles_email_unique").on(table.email),
    uniqueIndex("idx_profiles_username_lower").on(sql`lower(${table.username})`),
  ],
);
