# Supabase security checklist

Steps that cannot be applied via SQL migrations. Run after deploying schema changes and when onboarding a new Supabase project.

## Database migrations

Apply migrations from the repo root:

```bash
SUPABASE_DB_PASSWORD="$SUPABASE_DATABASE_PASSWORD" bunx supabase db push
```

Migration [`0003_security_hardening.sql`](../supabase/migrations/0003_security_hardening.sql) addresses:

- Mutable function `search_path` warnings
- `SECURITY DEFINER` functions callable via PostgREST RPC (moved to `private` schema)
- RLS-enabled auth helper tables without policies

## Re-run Security Advisor

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project
2. Go to **Database** → **Security Advisor** (or **Advisors**)
3. Confirm the function and RLS warnings above are cleared

## Leaked password protection (Auth)

This is a dashboard-only setting; it cannot be enabled in SQL.

1. **Authentication** → **Providers** → **Email**
2. Enable **Leaked password protection** (HaveIBeenPwned check)

Alternatively: **Authentication** → **Password Security** if your project UI groups it there.

After enabling, re-run Security Advisor — the `auth_leaked_password_protection` warning should disappear.

## Org icon storage

See [org-icons-storage.md](./org-icons-storage.md) for the `org-icons` bucket setup required by organization icon upload during onboarding.
