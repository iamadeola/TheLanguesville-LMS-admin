import { clearSession, getToken } from "@/lib/auth/session";

// Override via NEXT_PUBLIC_API_BASE_URL; falls back to the deployed origin.
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://backend.thelanguesville.com/api";

// The backend wraps every JSON response in this envelope. On success it may
// also carry a human-readable `message` (e.g. "Profile updated successfully").
type ApiSuccess<T> = { success: true; data: T; message?: string };
export type ApiError = {
  success: false;
  message: string;
  errors?: Array<{ path: string; message: string }>;
};
export type ApiResult<T> = ApiSuccess<T> | ApiError;

/**
 * Pick a user-facing message from a failed API result. Validation failures
 * (HTTP 400) carry a populated `errors[]`; business errors only carry
 * `message`. Render both consistently via this helper.
 */
export function getApiErrorMessage(
  error: ApiError,
  fallback = "Something went wrong. Please try again.",
): string {
  if (error.errors && error.errors.length > 0) {
    return error.errors.map((e) => e.message).join("\n");
  }
  return error.message || fallback;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResult<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, { ...options, headers });
    const data = (await response.json()) as ApiResult<T>;

    // A 401 on a request we authenticated means the token is missing/expired:
    // drop the stale session and bounce to login. Auth endpoints (login,
    // verify-otp, accept-invite) send no token, so their 401s — invalid
    // credentials / OTP — are returned to the caller untouched.
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
      message: error instanceof Error ? error.message : "Network error",
    };
  }
}
