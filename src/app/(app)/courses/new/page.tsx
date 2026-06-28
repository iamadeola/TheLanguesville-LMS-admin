"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  CourseBuilderProvider,
  useCourseBuilder,
} from "@/components/course-builder/course-builder-context";
import { CourseBuilderShell } from "@/components/course-builder/course-builder-shell";
import { CourseSetupStep } from "@/components/course-builder/course-setup-step";
import { CurriculumStep } from "@/components/course-builder/curriculum-step";
import {
  LessonEditor,
  saveLessonBlocks,
} from "@/components/course-builder/lesson-editor";
import { ReviewStep } from "@/components/course-builder/review-step";
import type { ApiResult } from "@/lib/api/client";
import type { CourseSummary } from "@/lib/api/courses";
import { publishCourse, updateCourse } from "@/lib/api/courses";
import { apiClient, getApiErrorMessage } from "@/lib/api/client";

function NewCourseFlow() {
  const router = useRouter();
  const {
    step,
    setStep,
    draft,
    isSetupComplete,
    totalLessons,
    editingLesson,
    setEditingLesson,
    setCourseId,
    setModules,
    courseId,
  } = useCourseBuilder();
  const [creating, setCreating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [savingLesson, setSavingLesson] = useState(false);

  const handleProceedFromSetup = async () => {
    setCreating(true);

    // If we've already created the course (e.g. the user stepped back to Course
    // Setup to tweak the price/duration), update it in place instead of POSTing
    // a brand-new course. Recreating would both duplicate the course and wipe
    // the modules/lessons already added in the curriculum step.
    if (courseId) {
      const result = await updateCourse(courseId, {
        title: draft.title,
        description: draft.description,
        level: draft.level ?? undefined,
        price: parseFloat(draft.price) || 0,
        duration: draft.duration,
      });
      if (result.success) {
        setStep(2);
      } else {
        toast.error(
          result.message || "Failed to save changes. Please try again.",
        );
      }
      setCreating(false);
      return;
    }

    const result = (await apiClient<
      CourseSummary & {
        modules?: { _id: string; title: string; lessons: [] }[];
      }
    >("/courses", {
      method: "POST",
      body: JSON.stringify({
        title: draft.title,
        description: draft.description,
        level: draft.level,
        price: parseFloat(draft.price) || 0,
        duration: draft.duration,
        status: "draft",
        modules: [{ title: "Module 1", order: 0 }],
      }),
    })) as ApiResult<
      CourseSummary & {
        modules?: { _id: string; title: string; lessons: [] }[];
      }
    >;

    if (result.success) {
      const id = result.data._id;
      setCourseId(id);
      const apiModules = result.data.modules ?? [];
      if (apiModules.length > 0) {
        setModules(
          apiModules.map((m) => ({
            id: m._id,
            title: m.title,
            lessons: [],
          })),
        );
      }
      setStep(2);
    } else {
      toast.error(
        result.message || "Failed to create course. Please try again.",
      );
    }
    setCreating(false);
  };

  // Lesson editor sub-view of step 2
  if (step === 2 && editingLesson) {
    const mod = draft.modules.find((m) => m.id === editingLesson.moduleId);
    const lesson = mod?.lessons.find((l) => l.id === editingLesson.lessonId);
    if (!mod || !lesson) {
      setEditingLesson(null);
      return null;
    }
    const hasContent = lesson.blocks.length > 0;
    const finishLesson = async () => {
      if (courseId) {
        setSavingLesson(true);
        const result = await saveLessonBlocks(courseId, mod.id, lesson);
        setSavingLesson(false);
        if (!result.success) {
          toast.error(
            getApiErrorMessage(
              result,
              "Couldn't save this lesson. Please try again.",
            ),
          );
          return;
        }
        toast.success("Lesson saved");
      }
      setEditingLesson(null);
    };
    return (
      <CourseBuilderShell
        primaryLabel="Save lesson"
        primaryDisabled={!hasContent || savingLesson}
        primaryLoading={savingLesson}
        onPrimary={finishLesson}
        hidePrevious
      >
        <LessonEditor mod={mod} lesson={lesson} onDone={finishLesson} />
      </CourseBuilderShell>
    );
  }

  // Step 1
  if (step === 1) {
    return (
      <CourseBuilderShell
        hidePrevious
        primaryLabel="Proceed"
        primaryDisabled={!isSetupComplete || creating}
        primaryLoading={creating}
        onPrimary={handleProceedFromSetup}
      >
        <CourseSetupStep />
      </CourseBuilderShell>
    );
  }

  // Step 2 (curriculum)
  if (step === 2) {
    return (
      <CourseBuilderShell
        primaryLabel="Proceed"
        primaryDisabled={totalLessons === 0}
        onPrimary={() => setStep(3)}
        onPrevious={() => setStep(1)}
      >
        <CurriculumStep />
      </CourseBuilderShell>
    );
  }

  // Step 3 (review)
  const handlePublish = async () => {
    if (!courseId) {
      router.push("/courses");
      return;
    }
    setPublishing(true);
    const result = await publishCourse(courseId);
    if (result.success) {
      toast.success("Course published!");
      router.push("/courses");
    } else {
      toast.error(result.message || "Failed to publish course");
      setPublishing(false);
    }
  };

  return (
    <CourseBuilderShell
      primaryLabel="Publish"
      primaryLoading={publishing}
      primaryDisabled={publishing}
      onPrimary={handlePublish}
      onPrevious={() => setStep(2)}
    >
      <ReviewStep />
    </CourseBuilderShell>
  );
}

export default function NewCoursePage() {
  return (
    <CourseBuilderProvider>
      <NewCourseFlow />
    </CourseBuilderProvider>
  );
}
