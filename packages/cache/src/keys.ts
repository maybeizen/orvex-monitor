export const CacheKeys = {
  monitor: (id: string) => `monitor:${id}`,
  monitorStatus: (id: string) => `monitor:${id}:status`,
  monitorList: (userId: string) => `user:${userId}:monitors`,
  checkLatest: (monitorId: string) => `check:${monitorId}:latest`,
  incidentOpen: (monitorId: string) => `incident:${monitorId}:open`,
  session: (sid: string) => `sess:${sid}`,
} as const;

export const SessionKeys = {
  session: CacheKeys.session,
} as const;

export const CacheTTL = {
  monitorStatus: 300,
  monitorList: 60,
  checkLatest: 300,
} as const;

/** Default session TTL in seconds (7 days). Override via SESSION_MAX_AGE_MS in the API. */
export const SessionTTL = 60 * 60 * 24 * 7;
