import process from "node:process";

export type StorageDriver = "local" | "s3";

export type StorageCategory = "avatars" | "org-icons";

export interface StorageConfig {
  driver: StorageDriver;
  localPath: string;
  publicBaseUrl: string;
  s3Bucket?: string | undefined;
  s3Region?: string | undefined;
  s3AccessKey?: string | undefined;
  s3SecretKey?: string | undefined;
  s3Endpoint?: string | undefined;
}

export interface UploadUrlResult {
  signedUrl: string;
  token: string;
  path: string;
  publicUrl: string;
}

let config: StorageConfig | undefined;

export function configureStorage(next: StorageConfig): void {
  config = next;
}

export function getStorageConfig(): StorageConfig {
  if (!config) {
    throw new Error("Storage not configured — call configureStorage() at startup");
  }
  return config;
}

export function resolveStorageDriver(): StorageDriver {
  const driver = process.env["STORAGE_DRIVER"];
  if (driver === "local" || driver === "s3") {
    return driver;
  }
  return "local";
}

export function buildStorageConfigFromEnv(): StorageConfig {
  return {
    driver: resolveStorageDriver(),
    localPath: process.env["STORAGE_LOCAL_PATH"] ?? "./uploads",
    publicBaseUrl: process.env["STORAGE_PUBLIC_BASE_URL"] ?? "",
    s3Bucket: process.env["S3_BUCKET"],
    s3Region: process.env["S3_REGION"],
    s3AccessKey: process.env["S3_ACCESS_KEY"],
    s3SecretKey: process.env["S3_SECRET_KEY"],
    s3Endpoint: process.env["S3_ENDPOINT"],
  };
}
