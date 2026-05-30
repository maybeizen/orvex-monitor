import { Redis } from "@upstash/redis";

let client: Redis | undefined;

export function getCacheClient(): Redis {
  if (client === undefined) {
    client = new Redis({
      url: process.env["UPSTASH_REDIS_REST_URL"]!,
      token: process.env["UPSTASH_REDIS_REST_TOKEN"]!,
    });
  }
  return client;
}
