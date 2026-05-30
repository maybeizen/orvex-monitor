export {
  buildStorageConfigFromEnv,
  configureStorage,
  getStorageConfig,
  resolveStorageDriver,
  type StorageCategory,
  type StorageConfig,
  type StorageDriver,
  type UploadUrlResult,
} from "./config";
export {
  buildObjectPath,
  createAvatarMulter,
  createLocalMulter,
  createLocalUploadUrl,
  createOrgIconMulter,
  ensureLocalCategoryDir,
  resolveLocalDirectory,
  resolveLocalFilePath,
  resolvePublicUrl,
} from "./local";
export { createS3DownloadUrl, createS3UploadUrl } from "./s3";

import { getStorageConfig } from "./config";
import { createLocalUploadUrl, resolvePublicUrl } from "./local";
import { createS3DownloadUrl, createS3UploadUrl } from "./s3";

export async function createAvatarUploadUrl(
  userId: string,
  contentType: string,
  extension: string,
) {
  const { driver } = getStorageConfig();
  if (driver === "s3") {
    return createS3UploadUrl("avatars", userId, extension, contentType);
  }
  return createLocalUploadUrl("avatars", userId, extension);
}

export async function createOrgIconUploadUrl(
  userId: string,
  contentType: string,
  extension: string,
) {
  const { driver } = getStorageConfig();
  if (driver === "s3") {
    return createS3UploadUrl("org-icons", userId, extension, contentType);
  }
  return createLocalUploadUrl("org-icons", userId, extension);
}

export async function createAvatarDownloadUrl(objectPath: string): Promise<string> {
  const { driver } = getStorageConfig();
  if (driver === "s3") {
    return createS3DownloadUrl("avatars", objectPath);
  }
  return resolvePublicUrl("avatars", objectPath);
}

export async function createOrgIconDownloadUrl(objectPath: string): Promise<string> {
  const { driver } = getStorageConfig();
  if (driver === "s3") {
    return createS3DownloadUrl("org-icons", objectPath);
  }
  return resolvePublicUrl("org-icons", objectPath);
}
