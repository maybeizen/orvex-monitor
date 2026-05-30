import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import {
  getStorageConfig,
  type StorageCategory,
  type UploadUrlResult,
} from "./config";
import { buildObjectPath, resolvePublicUrl } from "./local";

const CATEGORY_PREFIX: Record<StorageCategory, string> = {
  avatars: "avatars",
  "org-icons": "org-icons",
};

let s3Client: S3Client | undefined;

function getS3Client(): S3Client {
  if (!s3Client) {
    const cfg = getStorageConfig();
    if (!cfg.s3Bucket || !cfg.s3Region || !cfg.s3AccessKey || !cfg.s3SecretKey) {
      throw new Error("S3 storage requires S3_BUCKET, S3_REGION, S3_ACCESS_KEY, and S3_SECRET_KEY");
    }
    s3Client = new S3Client({
      region: cfg.s3Region,
      credentials: {
        accessKeyId: cfg.s3AccessKey,
        secretAccessKey: cfg.s3SecretKey,
      },
      ...(cfg.s3Endpoint ? { endpoint: cfg.s3Endpoint, forcePathStyle: true } : {}),
    });
  }
  return s3Client;
}

function s3Key(category: StorageCategory, objectPath: string): string {
  return `${CATEGORY_PREFIX[category]}/${objectPath}`;
}

const PRESIGN_PUT_TTL_SECONDS = 300;
const PRESIGN_GET_TTL_SECONDS = 3600;

export async function createS3UploadUrl(
  category: StorageCategory,
  userId: string,
  extension: string,
  contentType: string,
): Promise<UploadUrlResult> {
  const cfg = getStorageConfig();
  const objectPath = buildObjectPath(userId, extension);
  const key = s3Key(category, objectPath);
  const command = new PutObjectCommand({
    Bucket: cfg.s3Bucket,
    Key: key,
    ContentType: contentType,
  });
  const signedUrl = await getSignedUrl(getS3Client(), command, {
    expiresIn: PRESIGN_PUT_TTL_SECONDS,
  });
  return {
    signedUrl,
    token: key,
    path: objectPath,
    publicUrl: resolvePublicUrl(category, objectPath),
  };
}

export async function createS3DownloadUrl(
  category: StorageCategory,
  objectPath: string,
): Promise<string> {
  const cfg = getStorageConfig();
  const command = new GetObjectCommand({
    Bucket: cfg.s3Bucket,
    Key: s3Key(category, objectPath),
  });
  return getSignedUrl(getS3Client(), command, {
    expiresIn: PRESIGN_GET_TTL_SECONDS,
  });
}
