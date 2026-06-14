/**
 * In-memory mock data for the Assignment feature.
 *
 * There is no API yet — this module backs every assignment screen with a
 * module-level store so that flows (publish, delete, grade, send reminder)
 * mutate shared state and persist across client-side navigation within a
 * session. It will be swapped for the real API client in the next pass.
 */

export type AssignmentType = "essay" | "quiz" | "project";
export type AssignmentStatus = "active" | "overdue" | "draft";
export type GradingMethod = "manual" | "automatic" | "rubric";
export type SubmissionType = "file" | "text" | "url";
export type SubmissionStatus = "pending" | "submitted" | "graded";

export interface RubricCriterion {
  id: string;
  label: string;
  points: number;
}

export interface AssignmentAttachment {
  id: string;
  name: string;
}

export interface Submission {
  id: string;
  studentName: string;
  email: string;
  /** 0-100, present once graded or pre-filled by the student preview. */
  grade: number | null;
  submittedAgo: string;
  status: SubmissionStatus;
  /** The student's written answer, shown on the grading screen. */
  answer: string;
  attachments: AssignmentAttachment[];
  feedback?: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  type: AssignmentType;
  courseName: string;
  assignedTo: number;
  dueDate: string; // human label e.g. "May 4, 2026"
  status: AssignmentStatus;
  gradingMethod: GradingMethod;
  submissionType: SubmissionType;
  totalPoints: number;
  passingScore: number;
  allowLate: boolean;
  instructions: string;
  attachments: AssignmentAttachment[];
  rubric: RubricCriterion[];
  submissions: Submission[];
}

let nextId = 100;
export function createId(prefix = "id"): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  nextId += 1;
  return `${prefix}-${nextId}`;
}

const SAMPLE_ANSWER = `Le subjonctif est un mode qui exprime une action envisagée, souhaitée ou hypothétique. Il s'emploie principalement après les verbes de volonté, de doute ou d'émotion, ainsi qu'après certaines conjonctions comme « bien que » ou « pour que ».

Par exemple : « Il faut que tu finisses tes devoirs avant de sortir. » Dans cette phrase, le verbe finir est conjugué au subjonctif présent parce qu'il suit une expression d'obligation.

En conclusion, le subjonctif est essentiel pour nuancer la pensée et exprimer des opinions personnelles. Sa maîtrise demande de la pratique mais enrichit considérablement l'expression écrite et orale.`;

function conversationSubmissions(): Submission[] {
  return [
    {
      id: "sub-cw",
      studentName: "Coltrane Wilder",
      email: "c.wilder@gmail.com",
      grade: 87,
      submittedAgo: "3h ago",
      status: "submitted",
      answer: SAMPLE_ANSWER,
      attachments: [
        { id: "a1", name: "coltrane_essay.pdf" },
        { id: "a2", name: "audio_recording.m4a" },
      ],
    },
    {
      id: "sub-ar",
      studentName: "Amelie Rousseau",
      email: "a.rosseau@email.fr",
      grade: 80,
      submittedAgo: "1d ago",
      status: "graded",
      answer: SAMPLE_ANSWER,
      attachments: [{ id: "a1", name: "amelie_essay.pdf" }],
    },
    {
      id: "sub-is",
      studentName: "Isaiah Stiles",
      email: "isstiles@gmail.com",
      grade: 74,
      submittedAgo: "2d ago",
      status: "graded",
      answer: SAMPLE_ANSWER,
      attachments: [{ id: "a1", name: "isaiah_essay.pdf" }],
    },
    {
      id: "sub-mj",
      studentName: "Mary Jones",
      email: "maryjones@emal.fr",
      grade: 82,
      submittedAgo: "1w ago",
      status: "graded",
      answer: SAMPLE_ANSWER,
      attachments: [{ id: "a1", name: "mary_essay.pdf" }],
    },
  ];
}

const RUBRIC: RubricCriterion[] = [
  { id: "r1", label: "Content & Relevance", points: 25 },
  { id: "r2", label: "Vocabulary Usage", points: 25 },
  { id: "r3", label: "Grammar & Sentence Structure", points: 25 },
  { id: "r4", label: "Organization & Clarity", points: 25 },
];

const seed: Assignment[] = [
  {
    id: "french-conversation-practice",
    title: "French Conversation Practice",
    description:
      "This assignment helps students improve spoken French through simple, real-life conversations. It focuses on building confidence, pronunciation, and everyday communication skills.",
    type: "essay",
    courseName: "French For Absolute Beginners",
    assignedTo: 12,
    dueDate: "May 4, 2026",
    status: "active",
    gradingMethod: "rubric",
    submissionType: "text",
    totalPoints: 100,
    passingScore: 60,
    allowLate: true,
    instructions:
      "This assignment helps students improve spoken French through simple, real-life conversations. It focuses on building confidence, pronunciation, and everyday communication skills.",
    attachments: [
      { id: "f1", name: "french_conversation_practice.pdf" },
      { id: "f2", name: "rubric.pdf" },
    ],
    rubric: RUBRIC,
    submissions: conversationSubmissions(),
  },
  {
    id: "commercial-contracts",
    title: "Commercial Contracts",
    description:
      "Draft and analyse a commercial contract in French, applying the business vocabulary covered in the module.",
    type: "project",
    courseName: "Business French",
    assignedTo: 18,
    dueDate: "May 7, 2026",
    status: "active",
    gradingMethod: "manual",
    submissionType: "file",
    totalPoints: 100,
    passingScore: 50,
    allowLate: false,
    instructions:
      "Draft and analyse a commercial contract in French. Submit a single PDF applying the business vocabulary and contract structures covered in the module.",
    attachments: [{ id: "f1", name: "contract_brief.pdf" }],
    rubric: [],
    submissions: [
      {
        id: "sub-bd",
        studentName: "Bernard Dupont",
        email: "b.dupont@email.fr",
        grade: null,
        submittedAgo: "5h ago",
        status: "submitted",
        answer: SAMPLE_ANSWER,
        attachments: [{ id: "a1", name: "contract_draft.pdf" }],
      },
      {
        id: "sub-cl",
        studentName: "Camille Laurent",
        email: "c.laurent@email.fr",
        grade: 88,
        submittedAgo: "3d ago",
        status: "graded",
        answer: SAMPLE_ANSWER,
        attachments: [{ id: "a1", name: "contract_draft.pdf" }],
      },
    ],
  },
  {
    id: "nasal-vowels",
    title: "Nasal Vowels",
    description:
      "A short quiz on recognising and producing the nasal vowels of French.",
    type: "quiz",
    courseName: "Parisian Conversation",
    assignedTo: 12,
    dueDate: "May 12, 2026",
    status: "overdue",
    gradingMethod: "automatic",
    submissionType: "text",
    totalPoints: 100,
    passingScore: 60,
    allowLate: false,
    instructions:
      "Complete the quiz on recognising and producing the nasal vowels of French.",
    attachments: [],
    rubric: [],
    submissions: [],
  },
  {
    id: "the-subjunctive",
    title: "The Subjunctive",
    description:
      "Write a short essay demonstrating correct use of the French subjunctive mood.",
    type: "essay",
    courseName: "Discovering French",
    assignedTo: 24,
    dueDate: "May 14, 2026",
    status: "active",
    gradingMethod: "manual",
    submissionType: "text",
    totalPoints: 100,
    passingScore: 60,
    allowLate: true,
    instructions:
      "Write a short essay (200-300 words) demonstrating correct use of the French subjunctive mood across at least three different triggers.",
    attachments: [{ id: "f1", name: "subjunctive_guide.pdf" }],
    rubric: [],
    submissions: [
      {
        id: "sub-ts1",
        studentName: "Lucas Moreau",
        email: "l.moreau@email.fr",
        grade: null,
        submittedAgo: "2h ago",
        status: "submitted",
        answer: SAMPLE_ANSWER,
        attachments: [{ id: "a1", name: "subjunctive_essay.pdf" }],
      },
    ],
  },
  {
    id: "food-vocabulary",
    title: "Food Vocabulary",
    description:
      "Practise everyday food and restaurant vocabulary through a short writing task.",
    type: "essay",
    courseName: "French For Absolute Beginners",
    assignedTo: 12,
    dueDate: "May 20, 2026",
    status: "active",
    gradingMethod: "manual",
    submissionType: "text",
    totalPoints: 100,
    passingScore: 60,
    allowLate: false,
    instructions:
      "Write a short menu and a dialogue ordering food in a restaurant, using the vocabulary from this module.",
    attachments: [],
    rubric: [],
    submissions: [],
  },
  {
    id: "weekend-plans",
    title: "Weekend Plans",
    description:
      "A draft assignment about discussing future weekend plans in French.",
    type: "essay",
    courseName: "Everyday Conversations",
    assignedTo: 0,
    dueDate: "May 28, 2026",
    status: "draft",
    gradingMethod: "manual",
    submissionType: "text",
    totalPoints: 100,
    passingScore: 60,
    allowLate: false,
    instructions: "",
    attachments: [],
    rubric: [],
    submissions: [],
  },
];

// Module-level mutable store (deep-cloned from the seed so edits don't leak).
const store: Assignment[] = structuredClone(seed);

export function listAssignments(): Assignment[] {
  return store;
}

export function getAssignment(id: string | null | undefined): Assignment | undefined {
  if (!id) return undefined;
  return store.find((a) => a.id === id);
}

export function deleteAssignment(id: string): void {
  const idx = store.findIndex((a) => a.id === id);
  if (idx !== -1) store.splice(idx, 1);
}

export function addAssignment(a: Assignment): void {
  store.unshift(a);
}

export function gradeSubmission(
  assignmentId: string,
  submissionId: string,
  grade: number,
  feedback: string,
): void {
  const assignment = getAssignment(assignmentId);
  const submission = assignment?.submissions.find((s) => s.id === submissionId);
  if (submission) {
    submission.grade = grade;
    submission.feedback = feedback;
    submission.status = "graded";
  }
}

export interface AssignmentStats {
  active: number;
  overdue: number;
  drafts: number;
  submissions: number;
}

export function getStats(): AssignmentStats {
  return {
    active: store.filter((a) => a.status === "active").length,
    overdue: store.filter((a) => a.status === "overdue").length,
    drafts: store.filter((a) => a.status === "draft").length,
    submissions: store.reduce((sum, a) => sum + a.submissions.length, 0),
  };
}

/** Counts for an assignment's overview cards. */
export function submissionStats(a: Assignment) {
  const submitted = a.submissions.length;
  const graded = a.submissions.filter((s) => s.status === "graded").length;
  const pending = Math.max(a.assignedTo - submitted, 0);
  const gradedScores = a.submissions
    .filter((s) => s.status === "graded" && s.grade != null)
    .map((s) => s.grade as number);
  const avgScore =
    gradedScores.length > 0
      ? Math.round(gradedScores.reduce((x, y) => x + y, 0) / gradedScores.length)
      : 0;
  const completion = a.assignedTo > 0 ? Math.round((submitted / a.assignedTo) * 100) : 0;
  return { submitted, graded, pending, avgScore, completion };
}

/** Letter grade + the semantic colour used on the grading screen. */
export function gradeLetter(score: number): { letter: string; color: string } {
  if (score >= 90) return { letter: "A", color: "#16A34A" };
  if (score >= 80) return { letter: "B", color: "#16A34A" };
  if (score >= 70) return { letter: "C", color: "#9CA3AF" };
  if (score >= 60) return { letter: "D", color: "#F59E0B" };
  return { letter: "F", color: "#EF4444" };
}

export const TYPE_LABELS: Record<AssignmentType, string> = {
  essay: "Essay",
  quiz: "Quiz",
  project: "Project",
};
