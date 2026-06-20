import { clearSession, getToken } from "@/lib/auth/session";
import type { ApiResult } from "./client";

// Mirrors the base URL resolution in `client.ts`.
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://backend.thelanguesville.com/api";

export interface UploadedFile {
  /** Absolute URL the backend serves the stored file from. */
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

/**
 * Uploads a single file to the backend as multipart/form-data and returns the
 * stable URL a content block can reference.
 *
 * This deliberately does NOT go through `apiClient`: that helper forces a JSON
 * Content-Type, whereas for multipart we must let the browser set the
 * `multipart/form-data; boundary=…` header itself. We send the raw bytes (not
 * base64) so there's no ~33% size inflation.
 */
export async function uploadFile(file: File): Promise<ApiResult<UploadedFile>> {
  const token = getToken();
  const form = new FormData();
  form.append("file", file);

  try {
    const response = await fetch(`${API_BASE_URL}/uploads`, {
      method: "POST",
      // Only the auth header — never set Content-Type for FormData.
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: form,
    });
    const data = (await response.json()) as ApiResult<UploadedFile>;

    if (response.status === 401 && token) {
      clearSession();
      if (typeof window !== "undefined") {
        window.location.assign("/login");
      }
    }

    return data;
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Upload failed",
    };
  }
}
