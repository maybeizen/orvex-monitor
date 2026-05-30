import { Store, type SessionData } from "express-session";

import { getCacheClient, SessionKeys, SessionTTL } from "@orvex/cache";

type SessionCallback = (err?: unknown, session?: SessionData | null) => void;

function ttlSeconds(session: SessionData): number {
  const maxAge = session.cookie.maxAge;
  if (typeof maxAge === "number" && maxAge > 0) {
    return Math.max(1, Math.ceil(maxAge / 1000));
  }
  return SessionTTL;
}

export class UpstashSessionStore extends Store {
  override get(sid: string, callback: SessionCallback): void {
    void (async () => {
      try {
        const raw = await getCacheClient().get<string>(SessionKeys.session(sid));
        if (raw === null) {
          callback(null, null);
          return;
        }
        const session =
          typeof raw === "string" ? (JSON.parse(raw) as SessionData) : (raw as SessionData);
        callback(null, session);
      } catch (err) {
        callback(err);
      }
    })();
  }

  override set(sid: string, session: SessionData, callback?: (err?: unknown) => void): void {
    void (async () => {
      try {
        await getCacheClient().set(SessionKeys.session(sid), JSON.stringify(session), {
          ex: ttlSeconds(session),
        });
        callback?.();
      } catch (err) {
        callback?.(err);
      }
    })();
  }

  override destroy(sid: string, callback?: (err?: unknown) => void): void {
    void (async () => {
      try {
        await getCacheClient().del(SessionKeys.session(sid));
        callback?.();
      } catch (err) {
        callback?.(err);
      }
    })();
  }

  override touch(sid: string, session: SessionData, callback?: (err?: unknown) => void): void {
    this.set(sid, session, callback);
  }
}
