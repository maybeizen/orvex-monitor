import process from "node:process";

import Redis from "ioredis";

let client: Redis | undefined;

export function getCacheClient(): Redis {
  if (client === undefined) {
    const url = process.env["REDIS_URL"];
    if (!url) {
      throw new Error("REDIS_URL is not set");
    }
    client = new Redis(url, {
      maxRetriesPerRequest: null,
    });
  }
  return client;
}
