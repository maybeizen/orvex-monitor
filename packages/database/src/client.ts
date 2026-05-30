import process from "node:process";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

let db: ReturnType<typeof drizzle<typeof schema>> | undefined;
let sql: ReturnType<typeof postgres> | undefined;

export function createDb() {
  if (db) return db;

  const url = process.env["DATABASE_URL"];
  if (!url) throw new Error("Missing DATABASE_URL");

  sql = postgres(url);
  db = drizzle(sql, { schema });
  return db;
}

export type Db = ReturnType<typeof createDb>;

export async function closeDb(): Promise<void> {
  if (sql) {
    await sql.end();
    sql = undefined;
    db = undefined;
  }
}
