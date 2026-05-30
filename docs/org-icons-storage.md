# Org icon storage (`org-icons` bucket)

Organization setup supports icon upload via Supabase Storage. The API issues a signed upload URL; the browser uploads directly to Storage, then sends the public URL when creating the organization.

## 1. Create the bucket

In the [Supabase Dashboard](https://supabase.com/dashboard) → **Storage** → **New bucket**:

| Setting | Value |
|---------|--------|
| Name | `org-icons` |
| Public bucket | **Enabled** (simplest setup for public org avatars) |

If you prefer a private bucket, keep it private and add a public read policy for `org-icons/*` (see step 3).

## 2. File constraints (enforced in app)

- Max size: **512 KB**
- Allowed types: `image/png`, `image/jpeg`, `image/webp`, `image/svg+xml`
- Object path pattern: `{userId}/{uuid}.{ext}`

## 3. Storage policies (SQL Editor)

For a **public** bucket with authenticated uploads:

```sql
-- Allow authenticated users to upload into their own folder
create policy "org_icons_insert_own_folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'org-icons'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Public read (skip if bucket is already public)
create policy "org_icons_public_read"
on storage.objects for select
to public
using (bucket_id = 'org-icons');
```

The API uses the **service role** to create signed upload URLs, so uploads work even before RLS is tuned; policies still protect direct client access if you expose the anon key to Storage.

## 4. Environment variables

Already required by the API (`apps/api`):

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

No extra env vars are needed for icon upload.

Public URL format after upload:

```
{SUPABASE_URL}/storage/v1/object/public/org-icons/{userId}/{uuid}.{ext}
```

## 5. Verify

1. Run the app and open `/app/onboarding?create=1`.
2. Choose **Upload**, pick a small PNG/WebP.
3. Submit the form — the org row should store the public URL in `organizations.icon`.

If upload fails with “Failed to create upload URL”, confirm the bucket name is exactly `org-icons` and the API service role key is valid.
