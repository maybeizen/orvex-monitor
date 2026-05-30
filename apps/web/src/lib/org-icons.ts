import type { ApiResponse } from "@orvex/types";

import { apiClient } from "@/lib/api-client";

const MIME_TO_EXTENSION: Record<string, "png" | "jpg" | "jpeg" | "webp" | "svg"> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

interface IconUploadResult {
  signedUrl: string;
  token: string;
  path: string;
  publicUrl: string;
}

export async function uploadOrganizationIcon(file: File): Promise<string> {
  const contentType = file.type as keyof typeof MIME_TO_EXTENSION;
  const extension = MIME_TO_EXTENSION[contentType];
  if (!extension) {
    throw new Error("Unsupported image type. Use PNG, JPEG, WebP, or SVG.");
  }

  if (file.size > 512 * 1024) {
    throw new Error("Image must be 512KB or smaller.");
  }

  let upload: ApiResponse<IconUploadResult>;

  try {
    upload = await apiClient.post<ApiResponse<IconUploadResult>>(
      "/organizations/icon-upload-url",
      { contentType, extension },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    if (message.includes("404") || message.toLowerCase().includes("not found")) {
      throw new Error(
        "Icon upload API is unavailable. Make sure the API server is running (turbo dev).",
      );
    }
    throw err instanceof Error ? err : new Error(message);
  }

  if (upload.data.signedUrl) {
    const response = await fetch(upload.data.signedUrl, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: file,
    });

    if (!response.ok) {
      throw new Error("Failed to upload icon to storage.");
    }
  } else {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", upload.data.path);
    formData.append("token", upload.data.token);
    await apiClient.upload<ApiResponse<{ publicUrl: string }>>(
      "/organizations/icon-upload",
      formData,
    );
  }

  return upload.data.publicUrl;
}
