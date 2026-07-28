import { type ApiResult, apiClient } from "./client";

/* ------------------------------------------------------------------ *
 * Shared shapes
 *
 * Every endpoint here is read-only and gated on `analytics.view`.
 * ------------------------------------------------------------------ */

export type Period = "7days" | "30days" | "12months";

export type StatFormat = "number" | "percent" | "minutes";

export interface AnalyticsStat {
  key: string;
  label: string;
  /** null when `available` is false — the metric isn't recorded at all. */
  value: number | null;
  format: StatFormat;
  /**
   * null is NOT zero. It means there's no honest figure to show: either the
   * prior period had a zero baseline, or the metric is a current state the
   * backend never snapshots. Render no arrow and no percentage.
   */
  changePercent: number | null;
  available: boolean;
  /** Only present when `available` is false. */
  unavailableReason?: string;
}

/** `x` is a display label ("Jan", "Mon", "14"), never a number. */
export interface AnalyticsSeriesPoint {
  x: string;
  value: number;
}

/**
 * Stat value as the cards render it. Unavailable or absent values collapse to
 * an em dash so a missing metric never reads as a real zero.
 */
export function formatStatValue(stat: AnalyticsStat): string {
  if (!stat.available || stat.value === null) return "—";
  if (stat.format === "percent") return `${stat.value}%`;
  if (stat.format === "minutes") return `${stat.value} min`;
  return stat.value.toLocaleString();
}

function periodQuery(period?: Period): string {
  const qs = new URLSearchParams();
  if (period) qs.append("period", period);
  const query = qs.toString();
  return query ? `?${query}` : "";
}

/* ------------------------------------------------------------------ *
 * Dashboard screen
 * ------------------------------------------------------------------ */

export interface DashboardCourse {
  id: string;
  title: string;
  level: string;
  /** Lowercase from the API ("published"); CourseCard wants it capitalised. */
  status: string;
  modules: number;
  lessons: number;
  hours: number;
  progressPercent: number;
}

export interface DashboardStudentsChart {
  total: number;
  changePercent: number | null;
  /** Cumulative roster size over the period — not per-day signups. */
  series: AnalyticsSeriesPoint[];
}

export interface DashboardData {
  period: Period;
  /** keys: totalCourses, totalStudents, lessonsPublished, avgCompletion */
  stats: AnalyticsStat[];
  activeCourses: DashboardCourse[];
  studentsChart: DashboardStudentsChart;
}

export async function getDashboard(
  period?: Period,
): Promise<ApiResult<DashboardData>> {
  return apiClient<DashboardData>(`/analytics/dashboard${periodQuery(period)}`, {
    method: "GET",
  });
}

/* ------------------------------------------------------------------ *
 * Analytics screen — overview
 * ------------------------------------------------------------------ */

export interface DropOffPoint {
  id: string;
  lesson: string;
  course: string;
  courseId: string;
  /**
   * Of the students who finished the previous lesson, the share that never
   * finished this one. A real funnel, not an estimate.
   */
  percent: number;
}

export interface OverviewData {
  period: Period;
  /** keys: completionRate, averageEngagement, timePerLesson, dropOffs */
  stats: AnalyticsStat[];
  /** Count of recorded activity events, bucketed over time. */
  engagement: {
    total: number;
    series: AnalyticsSeriesPoint[];
  };
  /** Top 3 lessons students stop at. */
  dropOffPoints: DropOffPoint[];
}

export async function getOverview(
  period?: Period,
): Promise<ApiResult<OverviewData>> {
  return apiClient<OverviewData>(`/analytics/overview${periodQuery(period)}`, {
    method: "GET",
  });
}

/* ------------------------------------------------------------------ *
 * Analytics screen — course performance table
 * ------------------------------------------------------------------ */

export interface CoursePerformanceRow {
  id: string;
  course: string;
  level: string;
  students: number;
  completion: number;
  engagement: number;
  /** null when the course has no reviews — render "—". */
  rating: number | null;
}

export interface CoursePerformanceQuery {
  period?: Period;
  page?: number;
  limit?: number;
}

export interface CoursePerformanceData {
  courses: CoursePerformanceRow[];
  total: number;
  page: number;
  totalPages: number;
}

export async function getCoursePerformance(
  params: CoursePerformanceQuery = {},
): Promise<ApiResult<CoursePerformanceData>> {
  const qs = new URLSearchParams();
  if (params.period) qs.append("period", params.period);
  if (params.page) qs.append("page", String(params.page));
  if (params.limit) qs.append("limit", String(params.limit));
  const query = qs.toString();
  return apiClient<CoursePerformanceData>(
    `/analytics/courses${query ? `?${query}` : ""}`,
    { method: "GET" },
  );
}

/* ------------------------------------------------------------------ *
 * Point-in-time platform totals — no period involved.
 * ------------------------------------------------------------------ */

export interface AnalyticsSummary {
  courses: { total: number; published: number; draft: number };
  students: { total: number; active: number };
  instructors: { total: number; active: number };
  enrollments: { total: number; completed: number; dropped: number };
}

export async function getSummary(): Promise<ApiResult<AnalyticsSummary>> {
  return apiClient<AnalyticsSummary>("/analytics/summary", { method: "GET" });
}
