import session from "express-session";

import { getEnv } from "./env";
import { createRedisSessionStore } from "../lib/redis-session-store";

export function createSessionMiddleware() {
  const env = getEnv();
  return session({
    name: env.SESSION_COOKIE_NAME,
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: createRedisSessionStore(),
    cookie: {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: env.SESSION_MAX_AGE_MS,
    },
  });
}
