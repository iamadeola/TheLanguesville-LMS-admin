"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";

export type CourseLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type BlockType = "text" | "video" | "file";

export interface TextBlock {
  id: string;
  type: "text";
  html: string;
}

export interface VideoBlock {
  id: string;
  type: "video";
  url: string;
}

export interface FileBlock {
  id: string;
  type: "file";
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  dataUrl?: string;
}

export type LessonBlock = TextBlock | VideoBlock | FileBlock;

export interface Lesson {
  id: string;
  title: string;
  blocks: LessonBlock[];
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface CourseDraft {
  title: string;
  description: string;
  level: CourseLevel | null;
  price: string;
  duration: string;
  modules: Module[];
}

export type Step = 1 | 2 | 3;

export interface LessonRef {
  moduleId: string;
  lessonId: string;
}

interface CourseBuilderContextValue {
  draft: CourseDraft;
  setDraft: (updater: (prev: CourseDraft) => CourseDraft) => void;
  step: Step;
  setStep: (step: Step) => void;
  courseId: string | null;
  setCourseId: (id: string) => void;
  setModules: (modules: Module[]) => void;
  editingLesson: LessonRef | null;
  setEditingLesson: (ref: LessonRef | null) => void;

  // Helpers
  isSetupComplete: boolean;
  totalLessons: number;

  // Module actions
  addModule: () => void;
  removeModule: (moduleId: string) => void;
  renameModule: (moduleId: string, title: string) => void;

  // Lesson actions
  addLesson: (moduleId: string, suppliedId?: string) => string;
  removeLesson: (ref: LessonRef) => void;
  renameLesson: (ref: LessonRef, title: string) => void;

  // Block actions
  addBlock: (ref: LessonRef, type: BlockType, suppliedId?: string) => string;
  updateBlock: (
    ref: LessonRef,
    blockId: string,
    patch: Partial<LessonBlock>,
  ) => void;
  removeBlock: (ref: LessonRef, blockId: string) => void;
}

const CourseBuilderContext = createContext<CourseBuilderContextValue | null>(
  null,
);

const initialDraft: CourseDraft = {
  title: "",
  description: "",
  level: null,
  price: "",
  duration: "",
  modules: [
    {
      id: createId(),
      title: "New module",
      lessons: [],
    },
  ],
};

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

interface CourseBuilderProviderProps {
  children: ReactNode;
  initialDraft?: CourseDraft;
  initialCourseId?: string;
  initialStep?: Step;
}

export function CourseBuilderProvider({
  children,
  initialDraft: seedDraft,
  initialCourseId,
  initialStep,
}: CourseBuilderProviderProps) {
  const [draft, setDraftState] = useState<CourseDraft>(
    seedDraft ?? initialDraft,
  );
  const [step, setStep] = useState<Step>(initialStep ?? 1);
  const [courseId, setCourseId] = useState<string | null>(
    initialCourseId ?? null,
  );
  const [editingLesson, setEditingLesson] = useState<LessonRef | null>(null);

  const value = useMemo<CourseBuilderContextValue>(() => {
    const setDraft = (updater: (prev: CourseDraft) => CourseDraft) =>
      setDraftState((prev) => updater(prev));

    const isSetupComplete = Boolean(
      draft.title.trim() &&
      draft.description.trim() &&
      draft.level &&
      draft.price.trim() &&
      draft.duration.trim(),
    );

    const totalLessons = draft.modules.reduce(
      (sum, m) => sum + m.lessons.length,
      0,
    );

    return {
      draft,
      setDraft,
      step,
      setStep,
      courseId,
      setCourseId,
      setModules: (modules) => setDraft((prev) => ({ ...prev, modules })),
      editingLesson,
      setEditingLesson,
      isSetupComplete,
      totalLessons,
      addModule: () =>
        setDraft((prev) => ({
          ...prev,
          modules: [
            ...prev.modules,
            {
              id: createId(),
              title: `New module`,
              lessons: [],
            },
          ],
        })),
      removeModule: (moduleId) =>
        setDraft((prev) => ({
          ...prev,
          modules: prev.modules.filter((m) => m.id !== moduleId),
        })),
      renameModule: (moduleId, title) =>
        setDraft((prev) => ({
          ...prev,
          modules: prev.modules.map((m) =>
            m.id === moduleId ? { ...m, title } : m,
          ),
        })),
      addLesson: (moduleId, suppliedId) => {
        const lessonId = suppliedId ?? createId();
        setDraft((prev) => ({
          ...prev,
          modules: prev.modules.map((m) =>
            m.id === moduleId
              ? {
                  ...m,
                  lessons: [
                    ...m.lessons,
                    { id: lessonId, title: "Untitled Lesson", blocks: [] },
                  ],
                }
              : m,
          ),
        }));
        return lessonId;
      },
      removeLesson: ({ moduleId, lessonId }) =>
        setDraft((prev) => ({
          ...prev,
          modules: prev.modules.map((m) =>
            m.id === moduleId
              ? {
                  ...m,
                  lessons: m.lessons.filter((l) => l.id !== lessonId),
                }
              : m,
          ),
        })),
      renameLesson: ({ moduleId, lessonId }, title) =>
        setDraft((prev) => ({
          ...prev,
          modules: prev.modules.map((m) =>
            m.id === moduleId
              ? {
                  ...m,
                  lessons: m.lessons.map((l) =>
                    l.id === lessonId ? { ...l, title } : l,
                  ),
                }
              : m,
          ),
        })),
      addBlock: ({ moduleId, lessonId }, type, suppliedId) => {
        const blockId = suppliedId ?? createId();
        const newBlock: LessonBlock =
          type === "text"
            ? { id: blockId, type: "text", html: "" }
            : type === "video"
              ? { id: blockId, type: "video", url: "" }
              : { id: blockId, type: "file" };
        setDraft((prev) => ({
          ...prev,
          modules: prev.modules.map((m) =>
            m.id === moduleId
              ? {
                  ...m,
                  lessons: m.lessons.map((l) =>
                    l.id === lessonId
                      ? { ...l, blocks: [...l.blocks, newBlock] }
                      : l,
                  ),
                }
              : m,
          ),
        }));
        return blockId;
      },
      updateBlock: ({ moduleId, lessonId }, blockId, patch) =>
        setDraft((prev) => ({
          ...prev,
          modules: prev.modules.map((m) =>
            m.id === moduleId
              ? {
                  ...m,
                  lessons: m.lessons.map((l) =>
                    l.id === lessonId
                      ? {
                          ...l,
                          blocks: l.blocks.map((b) =>
                            // cast through unknown because patch is a partial of
                            // the union; the caller guarantees the shape matches
                            // this block's type.
                            b.id === blockId
                              ? ({ ...b, ...patch } as LessonBlock)
                              : b,
                          ),
                        }
                      : l,
                  ),
                }
              : m,
          ),
        })),
      removeBlock: ({ moduleId, lessonId }, blockId) =>
        setDraft((prev) => ({
          ...prev,
          modules: prev.modules.map((m) =>
            m.id === moduleId
              ? {
                  ...m,
                  lessons: m.lessons.map((l) =>
                    l.id === lessonId
                      ? {
                          ...l,
                          blocks: l.blocks.filter((b) => b.id !== blockId),
                        }
                      : l,
                  ),
                }
              : m,
          ),
        })),
    };
  }, [draft, step, courseId, editingLesson]);

  return (
    <CourseBuilderContext.Provider value={value}>
      {children}
    </CourseBuilderContext.Provider>
  );
}

export function useCourseBuilder() {
  const ctx = useContext(CourseBuilderContext);
  if (!ctx) {
    throw new Error(
      "useCourseBuilder must be used within a CourseBuilderProvider",
    );
  }
  return ctx;
}
