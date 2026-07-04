import { type ApiResult, apiClient } from "./client";
import type { TeachingLevel } from "./instructors";
import type { EnrollmentType } from "./students";

/* ------------------------------------------------------------------ *
 * Enums
 * ------------------------------------------------------------------ */

export type InvitationRole = "admin" | "instructor" | "student";
export type InvitationStatus = "pending" | "accepted" | "expired" | "cancelled";

/* ------------------------------------------------------------------ *
 * Stats
 * ------------------------------------------------------------------ */

export interface InvitationStats {
  pending: number;
  accepted: number;
  expired: number;
  cancelled: number;
  total: number;
  /** accepted ÷ total, whole percent. */
  acceptanceRate: number;
}

export async function getInvitationStats(): Promise<
  ApiResult<InvitationStats>
> {
  return apiClient<InvitationStats>("/invitations/stats", { method: "GET" });
}

/* ------------------------------------------------------------------ *
 * List
 * ------------------------------------------------------------------ */

export interface InvitationListItem {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: InvitationRole;
  status: InvitationStatus;
  invitationDate: string;
  expiresAt: string;
  /** Set when accepted. */
  joinedAt: string | null;
}

export interface ListInvitationsQuery {
  status?: InvitationStatus | "all";
  role?: InvitationRole;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ListInvitationsData {
  invitations: InvitationListItem[];
  total: number;
  page: number;
  totalPages: number;
}

export async function listInvitations(
  params: ListInvitationsQuery = {},
): Promise<ApiResult<ListInvitationsData>> {
  const qs = new URLSearchParams();
  if (params.status && params.status !== "all")
    qs.append("status", params.status);
  if (params.role) qs.append("role", params.role);
  if (params.search) qs.append("search", params.search);
  if (params.page) qs.append("page", String(params.page));
  if (params.limit) qs.append("limit", String(params.limit));
  const query = qs.toString();
  return apiClient<ListInvitationsData>(
    `/invitations${query ? `?${query}` : ""}`,
    { method: "GET" },
  );
}

/* ------------------------------------------------------------------ *
 * Create — one generic endpoint that fans out per role, with the same
 * rules and emails as /admin/invite and /students/invite.
 * ------------------------------------------------------------------ */

export type CreateInvitationPayload =
  | {
      role: "student";
      firstName: string;
      lastName: string;
      email: string;
      enrollmentType: EnrollmentType;
      courseIds: string[];
    }
  | {
      role: "instructor";
      firstName: string;
      lastName: string;
      email: string;
      teachingLevel: TeachingLevel;
    }
  | { role: "admin"; firstName: string; lastName: string; email: string };

export interface CreateInvitationData {
  inviteId: string;
  email: string;
  role: InvitationRole;
  expiresAt: string;
  /** Student invites return `name`; admin/instructor return first/last. */
  name?: string;
  firstName?: string;
  lastName?: string;
  message?: string;
}

export async function createInvitation(
  payload: CreateInvitationPayload,
): Promise<ApiResult<CreateInvitationData>> {
  return apiClient<CreateInvitationData>("/invitations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* ------------------------------------------------------------------ *
 * Row actions
 * ------------------------------------------------------------------ */

/** Only pending invites; the cancelled invite's token stops working. */
export async function cancelInvitation(
  invitationId: string,
): Promise<ApiResult<{ message?: string }>> {
  return apiClient(`/invitations/${invitationId}/cancel`, { method: "PATCH" });
}

/** Permanent, any status. */
export async function deleteInvitation(
  invitationId: string,
): Promise<ApiResult<{ message?: string }>> {
  return apiClient(`/invitations/${invitationId}`, { method: "DELETE" });
}
