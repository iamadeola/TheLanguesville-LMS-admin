/**
 * In-memory mock data for the Students feature. Swapped for the real API next.
 */

export interface EnrolledCourse {
  id: string;
  level: string;
  title: string;
  description: string;
  modules: number;
  lessons: number;
  duration: string;
  progress: number;
}

export interface RecentGrade {
  id: string;
  title: string;
  course: string;
  score: number;
}

export type ActivityType = "completed" | "milestone" | "joined";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  text: string;
  time: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  course: string;
  level: string;
  progress: number;
  lastActive: string;
  overallProgress: number;
  avgGrade: number;
  coursesCount: number;
  dayStreak: number;
  enrolledCourses: EnrolledCourse[];
  recentGrades: RecentGrade[];
  activity: ActivityItem[];
}

const COURSE_DESC =
  "Oral practice focused on everyday interactions and contemporary culture.";

function fullProfile(
  overrides: Partial<Student> & Pick<Student, "id" | "name" | "email" | "course" | "level" | "progress">,
): Student {
  return {
    lastActive: "2h ago",
    overallProgress: 55,
    avgGrade: 6,
    coursesCount: 2,
    dayStreak: 14,
    enrolledCourses: [
      {
        id: "c1",
        level: "A1",
        title: "French For Absolute Beginners",
        description: COURSE_DESC,
        modules: 8,
        lessons: 32,
        duration: "3 weeks",
        progress: 60,
      },
      {
        id: "c2",
        level: "A2",
        title: "Parisian Conversation",
        description: COURSE_DESC,
        modules: 8,
        lessons: 32,
        duration: "3 weeks",
        progress: 50,
      },
    ],
    recentGrades: [
      { id: "g1", title: "Essay: The New Wave", course: "Parisian Conversation", score: 88 },
      { id: "g2", title: "Commercial Contracts", course: "Parisian Conversation", score: 92 },
      { id: "g3", title: "The Subjunctive", course: "Parisian Conversation", score: 84 },
    ],
    activity: [
      { id: "a1", type: "completed", text: "Completed lesson 12 — The Subjunctive", time: "Yesterday" },
      { id: "a2", type: "milestone", text: "Achieved level B1 milestone", time: "1 week ago" },
      { id: "a3", type: "joined", text: "Joined the course", time: "6 weeks ago" },
    ],
    ...overrides,
  };
}

const seed: Student[] = [
  fullProfile({
    id: "coltrane-wilder",
    name: "Coltrane Wilder",
    email: "c.wilder@gmail.com",
    course: "Parisian Conversation",
    level: "B1",
    progress: 78,
  }),
  fullProfile({
    id: "amelie-rousseau",
    name: "Amelie Rousseau",
    email: "a.rosseau@email.fr",
    course: "Business French",
    level: "B2",
    progress: 45,
    overallProgress: 45,
    avgGrade: 7,
    dayStreak: 9,
  }),
  fullProfile({
    id: "isaiah-stiles",
    name: "Isaiah Stiles",
    email: "isstiles@gmail.com",
    course: "Parisian Conversation",
    level: "B1",
    progress: 62,
    overallProgress: 62,
    dayStreak: 21,
  }),
  fullProfile({
    id: "mary-jones",
    name: "Mary Jones",
    email: "maryjones@emal.fr",
    course: "French For Absolute Beginners",
    level: "A1",
    progress: 91,
    overallProgress: 91,
    avgGrade: 8,
    dayStreak: 30,
  }),
  fullProfile({
    id: "sophie-laurent",
    name: "Sophie Laurent",
    email: "s.laurent@gmail.com",
    course: "Parisian Conversation",
    level: "B1",
    progress: 15,
    overallProgress: 15,
    avgGrade: 5,
    dayStreak: 3,
  }),
  fullProfile({
    id: "bernard-dupont",
    name: "Bernard Dupont",
    email: "b.dupont@email.fr",
    course: "Business French",
    level: "B2",
    progress: 54,
    overallProgress: 54,
    dayStreak: 11,
  }),
  fullProfile({
    id: "camille-laurent",
    name: "Camille Laurent",
    email: "c.laurent@email.fr",
    course: "Discovering French",
    level: "A1",
    progress: 73,
    overallProgress: 73,
    dayStreak: 6,
  }),
  // A freshly-enrolled student with no activity yet — drives the empty detail state.
  fullProfile({
    id: "lucas-moreau",
    name: "Lucas Moreau",
    email: "l.moreau@email.fr",
    course: "Discovering French",
    level: "A1",
    progress: 0,
    lastActive: "just now",
    overallProgress: 0,
    avgGrade: 0,
    coursesCount: 0,
    dayStreak: 0,
    enrolledCourses: [],
    recentGrades: [],
    activity: [],
  }),
];

const store: Student[] = structuredClone(seed);

export function listStudents(): Student[] {
  return store;
}

export function getStudent(id: string | null | undefined): Student | undefined {
  if (!id) return undefined;
  return store.find((s) => s.id === id);
}

export const COURSE_FILTERS = [
  "All Courses",
  "French For Absolute Beginners",
  "Parisian Conversation",
  "Business French",
  "Discovering French",
];
