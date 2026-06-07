import { apiClient, type ApiResult } from "./client";
import { clearSession, setToken } from "@/lib/auth/session";

export type AdminRole = "superadmin" | "admin";

export interface AdminProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AdminRole;
}

/** Step A of login only confirms an OTP was emailed — no token yet. */
export interface LoginData {
  message: string;
}

/** verify-otp returns the JWT (24h) and a confirmation message. */
export interface VerifyOtpData {
  token: string;
  message: string;
}

export interface AcceptInviteData {
  adminId: string;
  email: string;
  firstName: string;
  lastName: string;
  message: string;
}

export interface InviteData {
  inviteId: string;
  email: string;
  message: string;
}

export function isSuperAdmin(profile: AdminProfile | null | undefined): boolean {
  return profile?.role === "superadmin";
}

/** Step A: email + password → emails a 6-digit OTP. */
export async function login(
  email: string,
  password: string,
): Promise<ApiResult<LoginData>> {
  return apiClient<LoginData>("/admin/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

/** Step B: email + 6-digit OTP → JWT. Stores the token on success. */
export async function verifyOtp(
  email: string,
  otp: string,
): Promise<ApiResult<VerifyOtpData>> {
  const result = await apiClient<VerifyOtpData>("/admin/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });

  if (result.success) {
    setToken(result.data.token);
  }

  return result;
}

export async function getMe(): Promise<ApiResult<AdminProfile>> {
  return apiClient<AdminProfile>("/admin/me", { method: "GET" });
}

export interface AcceptInvitePayload {
  token: string;
  firstName: string;
  lastName: string;
  password: string;
}

/** Public: complete a single-use email invite. Does NOT log the user in. */
export async function acceptInvite(
  payload: AcceptInvitePayload,
): Promise<ApiResult<AcceptInviteData>> {
  return apiClient<AcceptInviteData>("/admin/accept-invite", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** Superadmin-only: email a new admin an invite link. No token is returned. */
export async function inviteAdmin(
  email: string,
): Promise<ApiResult<InviteData>> {
  return apiClient<InviteData>("/admin/invite", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function logout() {
  clearSession();
}
