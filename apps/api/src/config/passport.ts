import type { UserOAuthProvider } from "@orvex/types";
import { UserOAuthProvider as Provider } from "@orvex/types";
import passport from "passport";
import type { Profile as GitHubProfile } from "passport-github2";
import { Strategy as GitHubStrategy } from "passport-github2";
import type {
  Profile as GoogleProfile,
  VerifyCallback as GoogleVerifyCallback,
} from "passport-google-oauth20";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import { getEnv } from "./env";

export interface OAuthProfile {
  provider: UserOAuthProvider;
  providerId: string;
  email: string;
  firstName?: string | undefined;
  lastName?: string | undefined;
}

export function configurePassport(): void {
  const env = getEnv();
  const callbackBase = env.OAUTH_CALLBACK_BASE_URL.replace(/\/$/, "");

  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
          callbackURL: `${callbackBase}/api/v1/auth/google/callback`,
          scope: ["profile", "email"] as const,
        },
        (
          _accessToken: string,
          _refreshToken: string,
          profile: GoogleProfile,
          done: GoogleVerifyCallback,
        ) => {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            done(new Error("Google account has no email"));
            return;
          }

          const oauthProfile: OAuthProfile = {
            provider: Provider.Google,
            providerId: profile.id,
            email,
            firstName: profile.name?.givenName,
            lastName: profile.name?.familyName,
          };
          done(null, oauthProfile as unknown as Express.User);
        },
      ),
    );
  }

  if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: env.GITHUB_CLIENT_ID,
          clientSecret: env.GITHUB_CLIENT_SECRET,
          callbackURL: `${callbackBase}/api/v1/auth/github/callback`,
          scope: ["user:email"],
        },
        (
          _accessToken: string,
          _refreshToken: string,
          profile: GitHubProfile,
          done: GoogleVerifyCallback,
        ) => {
          const email = profile.emails?.[0]?.value ?? profile.username;
          if (!email) {
            done(new Error("GitHub account has no email"));
            return;
          }

          const displayName = profile.displayName ?? profile.username ?? "";
          const nameParts = displayName.trim().split(/\s+/);
          const oauthProfile: OAuthProfile = {
            provider: Provider.GitHub,
            providerId: profile.id,
            email,
            firstName: nameParts[0],
            lastName: nameParts.slice(1).join(" ") || undefined,
          };
          done(null, oauthProfile as unknown as Express.User);
        },
      ),
    );
  }

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user as Express.User);
  });
}
