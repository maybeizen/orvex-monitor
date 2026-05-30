import { RedisStore } from "connect-redis";

import { getCacheClient } from "@orvex/cache";

export function createRedisSessionStore(): RedisStore {
  return new RedisStore({
    client: getCacheClient(),
    prefix: "sess:",
  });
}
