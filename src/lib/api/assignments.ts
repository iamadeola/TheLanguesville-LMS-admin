import { clearSession, getToken } from "@/lib/auth/session";
import { type ApiError, type ApiResult, apiClient } from "./client";

// Mirrors the base URL resolution in `client.ts`; only the CSV export below
// needs it directly (it bypasses `apiClient`, which always parses JSON).
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://backend.thelanguesville.com/api";

/* ------------------------------------------------------------------ *
 * Enums (see contract §5.3)
 * ------------------------------------------------------------------ */

export type AssignmentType = "essay" | "quiz" | "project";
export type SubmissionType = "file" | "text" | "url";
export type GradingMethod = "manual" | "automatic" | "rubric";
export type AssignmentStatus = "draft" | "published" | "archived";
export type DerivedStatus = "draft" | "active" | "overdue" | "archived";
export type SubmissionStatus = "submitted" | "graded";

/* ------------------------------------------------------------------ *
 * Object shapes (contract §5.1 / §5.2)
 * ------------------------------------------------------------------ */

export interface RubricCriterion {
  /** Mongoose docs carry `_id`; the grading view echoes `id` instead. */
  _id?: string;
  id?: string;
  name: string;
  points: number;
}

export interface ResourceFile {
  _id?: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
}

/** Populated course returned by the single-GET endpoint. */
export interface PopulatedCourse {
  _id: string;
  title: string;
  level: string;
  enrolledCount: number;
}

export interface Placement {
  _id?: string;
  /** A string id on writes, a populated course on the single-GET. */
  courseId: string | PopulatedCourse;
  moduleId?: string;
  lessonId?: string;
}

/** Populated instructor returned by the single-GET endpoint. */
export interface PopulatedInstructor {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Assignment {
  _id: string;
  /** Absent on the single-GET (lean); present on list items & write responses. */
  id?: string;
  title: string;
  description?: string;
  type?: AssignmentType;
  placements: Placement[];
  submission: {
    type?: SubmissionType;
    dueAt: string | null;
    allowLate: boolean;
    lateDueAt: string | null;
  };
  grading: {
    method?: GradingMethod;
    totalPoints: number;
    passingScore: number;
    rubric: RubricCriterion[];
  };
  resources: { files: ResourceFile[]; links: string[] };
  status: AssignmentStatus;
  instructorId: string | PopulatedInstructor;
  publishedAt: string | null;
  lastReminderSentAt: string | null;
  createdAt: string;
  updatedAt: string;
  /** Virtual; only present on write responses. */
  isOverdue?: boolean;
}

export interface RubricMark {
  criterionId: string;
  name: string;
  points: number;
  awarded: boolean;
}

export interface Submission {
  _id: string;
  id?: string;
  assignmentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatarUrl?: string;
  studentId?: string;
  content?: string;
  url?: string | null;
  attachments: ResourceFile[];
  submittedAt: string;
  status: SubmissionStatus;
  score: number | null;
  letterGrade: string | null;
  feedback: string | null;
  rubricMarks: RubricMark[];
  gradedAt: string | null;
  gradedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

/* ------------------------------------------------------------------ *
 * Stats & list (contract §2.1 / §2.2)
 * ------------------------------------------------------------------ */

export interface AssignmentStats {
  active: number;
  overdue: number;
  drafts: number;
  submissions: number;
}

export async function getAssignmentStats(): Promise<ApiResult<AssignmentStats>> {
  return apiClient<AssignmentStats>("/assignments/stats", { method: "GET" });
}

export interface AssignmentListItem {
  id: string;
  title: string;
  type: AssignmentType;
  status: AssignmentStatus;
  derivedStatus: DerivedStatus;
  course: { id: string; title: string } | null;
  courseCount: number;
  assignedCount: number;
  submittedCount: number;
  dueAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListAssignmentsQuery {
  /** Maps to the UI tabs; takes precedence over `status`. */
  filter?: "all" | "active" | "overdue" | "draft";
  status?: AssignmentStatus;
  type?: AssignmentType;
  courseId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ListAssignmentsData {
  assignments: AssignmentListItem[];
  total: number;
  page: number;
  totalPages: number;
}

export async function listAssignments(
  params: ListAssignmentsQuery = {},
): Promise<ApiResult<ListAssignmentsData>> {
  const qs = new URLSearchParams();
  if (params.filter) qs.append("filter", params.filter);
  if (params.status) qs.append("status", params.status);
  if (params.type) qs.append("type", params.type);
  if (params.courseId) qs.append("courseId", params.courseId);
  if (params.search) qs.append("search", params.search);
  if (params.page) qs.append("page", String(params.page));
  if (params.limit) qs.append("limit", String(params.limit));
  const query = qs.toString();
  return apiClient<ListAssignmentsData>(
    `/assignments${query ? `?${query}` : ""}`,
    { method: "GET" },
  );
}

/* ------------------------------------------------------------------ *
 * Create / read / update / delete (contract §2.3 – §2.8)
 * ------------------------------------------------------------------ */

export interface PlacementInput {
  courseId: string;
  moduleId?: string;
  lessonId?: string;
}

export interface SubmissionSettingsInput {
  type?: SubmissionType;
  dueAt?: string | null;
  allowLate?: boolean;
  lateDueAt?: string | null;
}

export interface GradingInput {
  method?: GradingMethod;
  totalPoints?: number;
  passingScore?: number;
  rubric?: Array<{ name: string; points: number }>;
}

export interface ResourcesInput {
  files?: ResourceFile[];
  links?: string[];
}

export interface CreateAssignmentPayload {
  title: string;
  description?: string;
  type?: AssignmentType;
  placements?: PlacementInput[];
  submission?: SubmissionSettingsInput;
  grading?: GradingInput;
  resources?: ResourcesInput;
}

/** Every field is optional — send only the slice the user just edited. */
export type UpdateAssignmentPayload = Partial<CreateAssignmentPayload>;

export async function createAssignment(
  payload: CreateAssignmentPayload,
): Promise<ApiResult<Assignment>> {
  return apiClient<Assignment>("/assignments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getAssignment(
  assignmentId: string,
): Promise<ApiResult<Assignment>> {
  return apiClient<Assignment>(`/assignments/${assignmentId}`, {
    method: "GET",
  });
}

export async function updateAssignment(
  assignmentId: string,
  patch: UpdateAssignmentPayload,
): Promise<ApiResult<Assignment>> {
  return apiClient<Assignment>(`/assignments/${assignmentId}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function deleteAssignment(
  assignmentId: string,
): Promise<ApiResult<{ message: string }>> {
  return apiClient<{ message: string }>(`/assignments/${assignmentId}`, {
    method: "DELETE",
  });
}

export async function publishAssignment(
  assignmentId: string,
): Promise<ApiResult<Assignment>> {
  return apiClient<Assignment>(`/assignments/${assignmentId}/publish`, {
    method: "POST",
  });
}

export async function unpublishAssignment(
  assignmentId: string,
): Promise<ApiResult<Assignment>> {
  return apiClient<Assignment>(`/assignments/${assignmentId}/unpublish`, {
    method: "POST",
  });
}

/* ------------------------------------------------------------------ *
 * Submissions & grading (contract §3)
 * ------------------------------------------------------------------ */

export interface AssignmentOverview {
  dueAt: string | null;
  totalPoints: number;
  assignedCount: number;
  submittedCount: number;
  pendingCount: number;
  gradedCount: number;
  /** null until something is graded. */
  avgScore: number | null;
  /** 0–100 integer. */
  completionRate: number;
}

export async function getAssignmentOverview(
  assignmentId: string,
): Promise<ApiResult<AssignmentOverview>> {
  return apiClient<AssignmentOverview>(
    `/assignments/${assignmentId}/overview`,
    { method: "GET" },
  );
}

export interface SubmissionListItem {
  id: string;
  studentName: string;
  studentEmail: string;
  studentAvatarUrl?: string;
  /** null while status === "submitted". */
  score: number | null;
  letterGrade: string | null;
  status: SubmissionStatus;
  submittedAt: string;
}

export interface ListSubmissionsQuery {
  status?: SubmissionStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ListSubmissionsData {
  submissions: SubmissionListItem[];
  totalPoints: number;
  total: number;
  page: number;
  totalPages: number;
}

export async function listSubmissions(
  assignmentId: string,
  params: ListSubmissionsQuery = {},
): Promise<ApiResult<ListSubmissionsData>> {
  const qs = new URLSearchParams();
  if (params.status) qs.append("status", params.status);
  if (params.search) qs.append("search", params.search);
  if (params.page) qs.append("page", String(params.page));
  if (params.limit) qs.append("limit", String(params.limit));
  const query = qs.toString();
  return apiClient<ListSubmissionsData>(
    `/assignments/${assignmentId}/submissions${query ? `?${query}` : ""}`,
    { method: "GET" },
  );
}

export async function sendReminder(
  assignmentId: string,
): Promise<ApiResult<{ notified: number; message: string }>> {
  return apiClient<{ notified: number; message: string }>(
    `/assignments/${assignmentId}/reminders`,
    { method: "POST" },
  );
}

export interface GradingView {
  submission: Submission;
  assignment: {
    id: string;
    title: string;
    grading: {
      method: GradingMethod;
      totalPoints: number;
      passingScore: number;
      rubric: Array<{ id: string; name: string; points: number }>;
    };
  };
  prevSubmissionId: string | null;
  nextSubmissionId: string | null;
}

export async function getSubmission(
  assignmentId: string,
  submissionId: string,
): Promise<ApiResult<GradingView>> {
  return apiClient<GradingView>(
    `/assignments/${assignmentId}/submissions/${submissionId}`,
    { method: "GET" },
  );
}

export interface GradeManualPayload {
  score: number;
  feedback?: string;
}
export interface GradeRubricPayload {
  awardedCriterionIds: string[];
  feedback?: string;
}
export type GradePayload = GradeManualPayload | GradeRubricPayload;

export async function gradeSubmission(
  assignmentId: string,
  submissionId: string,
  payload: GradePayload,
): Promise<ApiResult<Submission>> {
  return apiClient<Submission>(
    `/assignments/${assignmentId}/submissions/${submissionId}/grade`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

/**
 * Downloads the submissions CSV. The endpoint needs the `Authorization`
 * header, so we cannot use a plain `<a href>` — fetch the blob with the token
 * and click a temporary anchor. Bypasses `apiClient` (which forces JSON).
 */
export async function exportSubmissions(
  assignmentId: string,
): Promise<ApiResult<{ fileName: string }>> {
  const token = getToken();
  try {
    const response = await fetch(
      `${API_BASE_URL}/assignments/${assignmentId}/submissions/export`,
      { headers: token ? { Authorization: `Bearer ${token}` } : undefined },
    );

    if (response.status === 401 && token) {
      clearSession();
      if (typeof window !== "undefined") window.location.assign("/login");
      return { success: false, message: "Your session has expired." };
    }

    if (!response.ok) {
      // Errors still come back as the JSON envelope.
      try {
        return (await response.json()) as ApiError;
      } catch {
        return { success: false, message: "Export failed" };
      }
    }

    const blob = await response.blob();
    const fileName =
      parseContentDispositionFilename(
        response.headers.get("Content-Disposition"),
      ) ?? "submissions.csv";

    if (typeof window !== "undefined") {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    }

    return { success: true, data: { fileName } };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Export failed",
    };
  }
}

function parseContentDispositionFilename(header: string | null): string | null {
  if (!header) return null;
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(header);
  return match ? decodeURIComponent(match[1]) : null;
}

/* ------------------------------------------------------------------ *
 * Display helpers
 * ------------------------------------------------------------------ */

export const TYPE_LABELS: Record<AssignmentType, string> = {
  essay: "Essay",
  quiz: "Quiz",
  project: "Project",
};

/**
 * Letter grade + the semantic colour used on the grading screen. Mirrors the
 * server-side scale (percent of `totalPoints`): A ≥ 90, B ≥ 80, C ≥ 70,
 * D ≥ 60, else F. Used for the live preview while the instructor scores; the
 * backend returns the authoritative `letterGrade` once saved.
 */
export function gradeLetter(
  score: number,
  totalPoints = 100,
): { letter: string; color: string } {
  const pct = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
  if (pct >= 90) return { letter: "A", color: "#16A34A" };
  if (pct >= 80) return { letter: "B", color: "#16A34A" };
  if (pct >= 70) return { letter: "C", color: "#9CA3AF" };
  if (pct >= 60) return { letter: "D", color: "#F59E0B" };
  return { letter: "F", color: "#EF4444" };
}

/** Resolve an id from a record that may carry `_id`, `id`, or both. */
export function recordId(record: { _id?: string; id?: string }): string {
  return record._id ?? record.id ?? "";
}
