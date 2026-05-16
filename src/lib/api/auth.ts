import { apiClient, type ApiResult } from "./client";

export interface LoginData {
  message: string;
  adminId: string;
  requiresOtp: true;
}

export interface AdminProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "super_admin" | "admin";
  isActive: boolean;
}

export interface VerifyOtpData {
  token: string;
  admin: AdminProfile;
}

function setCookie(name: string, value: string, maxAgeSecs?: number) {
  let cookie = `${name}=${encodeURIComponent(value)}; path=/; samesite=lax`;
  if (maxAgeSecs !== undefined) {
    cookie += `; max-age=${maxAgeSecs}`;
  }
  document.cookie = cookie;
}

export async function login(
  email: string,
  password: string,
): Promise<ApiResult<LoginData>> {
  const result = await apiClient<LoginData>("/admin/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  return result;
}

export async function verifyOtp(
  email: string,
  otp: string,
): Promise<ApiResult<VerifyOtpData>> {
  const result = await apiClient<VerifyOtpData>("/admin/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });

  if (result.success) {
    setCookie("admin_token", result.data.token);
    setCookie("admin_profile", JSON.stringify(result.data.admin));
  }

  return result;
}

export async function getMe(): Promise<ApiResult<AdminProfile>> {
  return apiClient<AdminProfile>("/admin/me", { method: "GET" });
}

export function clearAuthCookies() {
  setCookie("admin_token", "", 0);
  setCookie("admin_profile", "", 0);
}
