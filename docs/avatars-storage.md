# Avatar storage (`avatars` bucket)

Created by migration `0004_account_lifecycle.sql`. Used for profile picture uploads via signed URLs from the API.

## Bucket

- **ID:** `avatars`
- **Public read:** yes
- **Max file size:** 2 MB
- **Allowed types:** JPEG, PNG, WebP, GIF

Uploads use `POST /api/v1/account/avatar/upload-url` then client `PUT` to the signed URL.

Public URL format:

```
{SUPABASE_URL}/storage/v1/object/public/avatars/{userId}/{uuid}.{ext}
```
