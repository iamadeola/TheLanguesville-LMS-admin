import { type ApiResult, apiClient } from "./client";

/* ------------------------------------------------------------------ *
 * Profile (contract §4.1 / §4.2)
 * ------------------------------------------------------------------ */

export interface SettingsProfile {
  id: string;
  email: string;
  firstName: string;
  /** Optional fields are omitted by the backend when unset. */
  middleName?: string;
  lastName: string;
  fullName: string;
  role: string;
  professionalTitle?: string;
  department?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface UpdateProfilePayload {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  professionalTitle?: string;
  department?: string;
  bio?: string;
  avatarUrl?: string;
}

export async function getProfile(): Promise<ApiResult<SettingsProfile>> {
  return apiClient<SettingsProfile>("/settings/profile", { method: "GET" });
}

export async function updateProfile(
  payload: UpdateProfilePayload,
): Promise<ApiResult<SettingsProfile>> {
  return apiClient<SettingsProfile>("/settings/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/* ------------------------------------------------------------------ *
 * Security (contract §4.3)
 * ------------------------------------------------------------------ */

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export async function changePassword(
  payload: ChangePasswordPayload,
): Promise<ApiResult<{ message: string }>> {
  return apiClient<{ message: string }>("/settings/password", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/* ------------------------------------------------------------------ *
 * Notifications (contract §4.4 / §4.5)
 * ------------------------------------------------------------------ */

export interface NotificationPreferences {
  /** Teaching Activity */
  assignmentSubmissions: boolean;
  gradeReviewRequests: boolean;
  /** Delivery Channels */
  emailNotifications: boolean;
  browserPushNotifications: boolean;
}

export async function getNotifications(): Promise<
  ApiResult<NotificationPreferences>
> {
  return apiClient<NotificationPreferences>("/settings/notifications", {
    method: "GET",
  });
}

export async function updateNotifications(
  patch: Partial<NotificationPreferences>,
): Promise<ApiResult<NotificationPreferences>> {
  return apiClient<NotificationPreferences>("/settings/notifications", {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}
