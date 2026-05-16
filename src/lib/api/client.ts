const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type ApiSuccess<T> = { success: true; data: T };
type ApiError = {
  success: false;
  message: string;
  errors?: Array<{ path: string; message: string }>;
};
export type ApiResult<T> = ApiSuccess<T> | ApiError;

function getTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("admin_token="));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResult<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getTokenFromCookie();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, { ...options, headers });
    const data = await response.json();
    return data as ApiResult<T>;
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Network error",
    };
  }
}
