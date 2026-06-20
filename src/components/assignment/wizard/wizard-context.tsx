"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  AssignmentType,
  GradingMethod,
  PlacementInput,
  ResourceFile,
  SubmissionType,
} from "@/lib/api/assignments";
import { getCourse, listCourses } from "@/lib/api/courses";

export type WizardStep = 1 | 2 | 3 | 4 | 5;

/* ------------------------------------------------------------------ *
 * Course → module → lesson tree (built from the real Courses API)
 * ------------------------------------------------------------------ */

export interface TreeLesson {
  id: string;
  title: string;
}
export interface TreeModule {
  id: string;
  title: string;
  lessons: TreeLesson[];
}
export interface TreeCourse {
  id: string;
  title: string;
  level: string;
  moduleCount: number;
  lessonCount: number;
  studentCount: number;
  /** null until the course detail has been lazily fetched. */
  modules: TreeModule[] | null;
  loading: boolean;
}

export interface WizardRubricCriterion {
  id: string;
  name: string;
  points: number;
}

let nextLocalId = 0;
function localId(prefix = "crit"): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  nextLocalId += 1;
  return `${prefix}-${nextLocalId}`;
}

export interface AssignmentDraft {
  title: string;
  description: string;
  type: AssignmentType | null;
  /** Lesson ids selected in the course tree (source of truth for placement). */
  selectedLessonIds: string[];
  submissionType: SubmissionType | null;
  dueDate: string;
  dueTime: string;
  allowLate: boolean;
  lateDate: string;
  lateTime: string;
  gradingMethod: GradingMethod | null;
  totalPoints: string;
  passingScore: string;
  rubric: WizardRubricCriterion[];
  /** Already-uploaded resource files (bytes sent via POST /api/uploads). */
  files: ResourceFile[];
  links: string[];
}

const initialDraft: AssignmentDraft = {
  title: "",
  description: "",
  type: null,
  selectedLessonIds: [],
  submissionType: null,
  dueDate: "",
  dueTime: "23:59",
  allowLate: false,
  lateDate: "",
  lateTime: "23:59",
  gradingMethod: null,
  totalPoints: "100",
  passingScore: "60",
  rubric: [],
  files: [],
  links: [],
};

interface WizardContextValue {
  draft: AssignmentDraft;
  update: (patch: Partial<AssignmentDraft>) => void;
  step: WizardStep;
  setStep: (s: WizardStep) => void;
  /** Backend assignment id once the draft has been created (POST). */
  assignmentId: string | null;
  setAssignmentId: (id: string | null) => void;
  // course tree
  courses: TreeCourse[];
  coursesLoading: boolean;
  loadCourse: (courseId: string) => void;
  /** Real placements derived from the current lesson selection. */
  placements: PlacementInput[];
  // rubric helpers
  addCriterion: () => void;
  updateCriterion: (id: string, patch: Partial<WizardRubricCriterion>) => void;
  removeCriterion: (id: string) => void;
  rubricTotal: number;
  // validity
  canProceed: (s: WizardStep) => boolean;
  canPublish: boolean;
  furthestComplete: number;
}

const WizardContext = createContext<WizardContextValue | null>(null);

/** Collapse a lesson selection into the minimal set of course/module/lesson placements. */
function derivePlacements(
  courses: TreeCourse[],
  selected: Set<string>,
): PlacementInput[] {
  const placements: PlacementInput[] = [];
  for (const course of courses) {
    if (!course.modules) continue; // can't reason about an unloaded course
    const courseLessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
    if (courseLessonIds.length === 0) continue;
    const selectedInCourse = courseLessonIds.filter((id) => selected.has(id));
    if (selectedInCourse.length === 0) continue;

    if (selectedInCourse.length === courseLessonIds.length) {
      placements.push({ courseId: course.id });
      continue;
    }
    for (const m of course.modules) {
      const mLessonIds = m.lessons.map((l) => l.id);
      const selInModule = mLessonIds.filter((id) => selected.has(id));
      if (selInModule.length === 0) continue;
      if (selInModule.length === mLessonIds.length) {
        placements.push({ courseId: course.id, moduleId: m.id });
      } else {
        for (const id of selInModule) {
          placements.push({ courseId: course.id, moduleId: m.id, lessonId: id });
        }
      }
    }
  }
  return placements;
}

export function WizardProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<AssignmentDraft>(initialDraft);
  const [step, setStep] = useState<WizardStep>(1);
  const [assignmentId, setAssignmentId] = useState<string | null>(null);
  const [courses, setCourses] = useState<TreeCourse[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  // Load the instructor's courses once for the placement picker.
  useEffect(() => {
    let active = true;
    listCourses({ limit: 100 }).then((result) => {
      if (!active) return;
      if (result.success) {
        setCourses(
          result.data.courses.map((c) => ({
            id: c._id,
            title: c.title,
            level: c.level,
            moduleCount: c.moduleCount ?? 0,
            lessonCount: c.lessonCount ?? 0,
            studentCount: c.enrolledCount ?? 0,
            modules: null,
            loading: false,
          })),
        );
      }
      setCoursesLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const loadCourse = useCallback((courseId: string) => {
    setCourses((prev) => {
      const target = prev.find((c) => c.id === courseId);
      if (!target || target.modules || target.loading) return prev;
      return prev.map((c) => (c.id === courseId ? { ...c, loading: true } : c));
    });
    getCourse(courseId).then((result) => {
      setCourses((prev) =>
        prev.map((c) => {
          if (c.id !== courseId) return c;
          if (!result.success) return { ...c, loading: false };
          return {
            ...c,
            loading: false,
            modules: result.data.modules.map((m) => ({
              id: m._id,
              title: m.title,
              lessons: m.lessons.map((l) => ({ id: l._id, title: l.title })),
            })),
          };
        }),
      );
    });
  }, []);

  const update = useCallback(
    (patch: Partial<AssignmentDraft>) =>
      setDraft((prev) => ({ ...prev, ...patch })),
    [],
  );

  const placements = useMemo(
    () => derivePlacements(courses, new Set(draft.selectedLessonIds)),
    [courses, draft.selectedLessonIds],
  );

  const value = useMemo<WizardContextValue>(() => {
    const rubricTotal = draft.rubric.reduce((sum, c) => sum + (c.points || 0), 0);
    const total = parseInt(draft.totalPoints, 10) || 0;
    const passing = parseInt(draft.passingScore, 10) || 0;

    const canProceed = (s: WizardStep): boolean => {
      switch (s) {
        case 1:
          return Boolean(
            draft.title.trim() &&
              draft.type &&
              draft.selectedLessonIds.length > 0,
          );
        case 2:
          return Boolean(draft.submissionType && draft.dueDate && draft.dueTime);
        case 3:
          if (!draft.gradingMethod) return false;
          if (passing > total) return false;
          if (draft.gradingMethod === "rubric") {
            return rubricTotal > 0 && rubricTotal === total;
          }
          return Boolean(draft.totalPoints && draft.passingScore);
        case 4:
          return true; // resources optional
        case 5:
          return true;
        default:
          return false;
      }
    };

    // Mirror the backend publish preconditions (contract §2.7).
    const lateOk = !draft.allowLate
      ? true
      : Boolean(draft.lateDate) &&
        (() => {
          const due = new Date(`${draft.dueDate}T${draft.dueTime || "23:59"}:00`);
          const late = new Date(`${draft.lateDate}T${draft.lateTime || "23:59"}:00`);
          return late.getTime() > due.getTime();
        })();
    const canPublish =
      canProceed(1) && canProceed(2) && canProceed(3) && lateOk;

    let furthestComplete = 0;
    for (let s = 1 as WizardStep; s <= 5; s = (s + 1) as WizardStep) {
      if (canProceed(s)) furthestComplete = s;
      else break;
    }

    return {
      draft,
      update,
      step,
      setStep,
      assignmentId,
      setAssignmentId,
      courses,
      coursesLoading,
      loadCourse,
      placements,
      addCriterion: () =>
        update({
          rubric: [
            ...draft.rubric,
            { id: localId("crit"), name: "New criterion", points: 10 },
          ],
        }),
      updateCriterion: (id, patch) =>
        update({
          rubric: draft.rubric.map((c) =>
            c.id === id ? { ...c, ...patch } : c,
          ),
        }),
      removeCriterion: (id) =>
        update({ rubric: draft.rubric.filter((c) => c.id !== id) }),
      rubricTotal,
      canProceed,
      canPublish,
      furthestComplete,
    };
  }, [
    draft,
    step,
    update,
    assignmentId,
    courses,
    coursesLoading,
    loadCourse,
    placements,
  ]);

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}

export function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useWizard must be used within a WizardProvider");
  return ctx;
}
