/**
 * Mock analytics data, varied by time period. Swapped for the real API next.
 */

export type Period = "12months" | "30days" | "7days";

export interface AnalyticsStat {
  label: string;
  value: string;
  change: number; // signed % change
}

export interface DropOffPoint {
  id: string;
  lesson: string;
  course: string;
  percent: number;
}

export interface CoursePerformance {
  id: string;
  course: string;
  level: string;
  students: number;
  completion: number;
  engagement: number;
  rating: number;
}

export interface PeriodData {
  stats: AnalyticsStat[];
  engagementTotal: number;
  series: { x: string; value: number }[];
  xLabel: string;
}

function wave(points: number, base: number, peak: number): { x: string; value: number }[] {
  const out: { x: string; value: number }[] = [];
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1);
    const trend = base + (peak - base) * t;
    const noise = Math.sin(i * 1.7) * (peak - base) * 0.06;
    out.push({ x: String(i), value: Math.round(trend + noise) });
  }
  return out;
}

const WEEK_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const PERIOD_DATA: Record<Period, PeriodData> = {
  "7days": {
    stats: [
      { label: "Completion Rate", value: "86%", change: -7.5 },
      { label: "Average Engagement", value: "91%", change: 40 },
      { label: "Time per Lesson", value: "27 min", change: 20 },
      { label: "Drop-offs", value: "5%", change: -10 },
    ],
    engagementTotal: 1740,
    series: WEEK_LABELS.map((x, i) => ({ x, value: wave(7, 200, 320)[i].value })),
    xLabel: "day-name",
  },
  "30days": {
    stats: [
      { label: "Completion Rate", value: "81%", change: -7.5 },
      { label: "Average Engagement", value: "88%", change: 40 },
      { label: "Time per Lesson", value: "22 min", change: 20 },
      { label: "Drop-offs", value: "9%", change: -10 },
    ],
    engagementTotal: 6420,
    series: Array.from({ length: 30 }, (_, i) => ({
      x: String(i + 1),
      value: wave(30, 600, 980)[i].value,
    })),
    xLabel: "day-number",
  },
  "12months": {
    stats: [
      { label: "Completion Rate", value: "78%", change: -7.5 },
      { label: "Average Engagement", value: "84%", change: 40 },
      { label: "Time per Lesson", value: "18 min", change: 20 },
      { label: "Drop-offs", value: "12%", change: -10 },
    ],
    engagementTotal: 23860,
    series: MONTH_LABELS.map((x, i) => ({ x, value: wave(12, 1200, 2600)[i].value })),
    xLabel: "month",
  },
};

export const DROP_OFFS: DropOffPoint[] = [
  { id: "d1", lesson: "The Present Subjunctive", course: "Parisian Conversation", percent: 28 },
  { id: "d2", lesson: "Nasal Vowels", course: "Phonetics", percent: 20 },
  { id: "d3", lesson: "Nasal Vowels", course: "Phonetics", percent: 20 },
];

export const COURSE_PERFORMANCE: CoursePerformance[] = [
  { id: "p1", course: "Parisian Conversation", level: "B1", students: 24, completion: 68, engagement: 68, rating: 4.5 },
  { id: "p2", course: "Business French", level: "B2", students: 18, completion: 45, engagement: 78, rating: 4.3 },
  { id: "p3", course: "Francophone Literature", level: "C1", students: 12, completion: 89, engagement: 77, rating: 4.1 },
  { id: "p4", course: "Discovering French", level: "A1", students: 42, completion: 32, engagement: 85, rating: 5.0 },
  { id: "p5", course: "French For Absolute Beginners", level: "A1", students: 30, completion: 70, engagement: 58, rating: 4.5 },
];
