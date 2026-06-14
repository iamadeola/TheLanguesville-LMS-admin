"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  type AssignmentType,
  type GradingMethod,
  type RubricCriterion,
  type SubmissionType,
  createId,
} from "@/lib/mock/assignments";

export type WizardStep = 1 | 2 | 3 | 4 | 5;

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
  rubric: RubricCriterion[];
  files: string[];
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
  // rubric helpers
  addCriterion: () => void;
  updateCriterion: (id: string, patch: Partial<RubricCriterion>) => void;
  removeCriterion: (id: string) => void;
  rubricTotal: number;
  // per-step validity
  canProceed: (s: WizardStep) => boolean;
  furthestComplete: number;
}

const WizardContext = createContext<WizardContextValue | null>(null);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<AssignmentDraft>(initialDraft);
  const [step, setStep] = useState<WizardStep>(1);

  const value = useMemo<WizardContextValue>(() => {
    const update = (patch: Partial<AssignmentDraft>) =>
      setDraft((prev) => ({ ...prev, ...patch }));

    const rubricTotal = draft.rubric.reduce((sum, c) => sum + (c.points || 0), 0);
    const total = parseInt(draft.totalPoints, 10) || 0;

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
      addCriterion: () =>
        update({
          rubric: [
            ...draft.rubric,
            { id: createId("crit"), label: "New criterion", points: 10 },
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
      furthestComplete,
    };
  }, [draft, step]);

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}

export function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useWizard must be used within a WizardProvider");
  return ctx;
}
