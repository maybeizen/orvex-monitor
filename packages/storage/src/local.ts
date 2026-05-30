import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

import multer from "multer";

import {
  getStorageConfig,
  type StorageCategory,
  type UploadUrlResult,
} from "./config";

const CATEGORY_DIRS: Record<StorageCategory, string> = {
  avatars: "avatars",
  "org-icons": "org-icons",
};

function categoryDir(category: StorageCategory): string {
  return CATEGORY_DIRS[category];
}

export function buildObjectPath(userId: string, extension: string): string {
  return `${userId}/${randomUUID()}.${extension}`;
}

export function resolveLocalDirectory(category: StorageCategory): string {
  const { localPath } = getStorageConfig();
  return join(localPath, categoryDir(category));
}

export function resolveLocalFilePath(
  category: StorageCategory,
  objectPath: string,
): string {
  return join(resolveLocalDirectory(category), objectPath);
}

export function resolvePublicUrl(
  category: StorageCategory,
  objectPath: string,
): string {
  const { publicBaseUrl } = getStorageConfig();
  const base = publicBaseUrl.replace(/\/$/, "");
  return `${base}/uploads/${categoryDir(category)}/${objectPath}`;
}

export async function ensureLocalCategoryDir(
  category: StorageCategory,
): Promise<string> {
  const dir = resolveLocalDirectory(category);
  await mkdir(dir, { recursive: true });
  return dir;
}

export function createLocalUploadUrl(
  category: StorageCategory,
  userId: string,
  extension: string,
): UploadUrlResult {
  const objectPath = buildObjectPath(userId, extension);
  const token = randomUUID();
  return {
    signedUrl: "",
    token,
    path: objectPath,
    publicUrl: resolvePublicUrl(category, objectPath),
  };
}

export function createLocalMulter(category: StorageCategory): multer.Multer {
  const storage = multer.diskStorage({
    destination: (_req, _file, callback) => {
      void (async () => {
        try {
          const dir = await ensureLocalCategoryDir(category);
          callback(null, dir);
        } catch (err) {
          callback(err as Error, "");
        }
      })();
    },
    filename: (_req, file, callback) => {
      const ext = file.originalname.split(".").pop() ?? "bin";
      callback(null, `${randomUUID()}.${ext}`);
    },
  });

  return multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
  });
}

export function createAvatarMulter(): multer.Multer {
  return createLocalMulter("avatars");
}

export function createOrgIconMulter(): multer.Multer {
  return createLocalMulter("org-icons");
}
