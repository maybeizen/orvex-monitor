import { pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

import { userOauthProviderEnum } from "./enums";
import { profiles } from "./profiles";

export const userOauthAccounts = pgTable(
  "user_oauth_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    provider: userOauthProviderEnum("provider").notNull(),
    provider_id: text("provider_id").notNull(),
    created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => [unique().on(table.provider, table.provider_id)],
);
