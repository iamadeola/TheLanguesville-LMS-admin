"use client";

import { useRouter } from "next/navigation";
import {
  CourseBuilderProvider,
  useCourseBuilder,
} from "@/components/course-builder/course-builder-context";
import { CourseBuilderShell } from "@/components/course-builder/course-builder-shell";
import { CourseSetupStep } from "@/components/course-builder/course-setup-step";
import { CurriculumStep } from "@/components/course-builder/curriculum-step";
import { LessonEditor } from "@/components/course-builder/lesson-editor";
import { ReviewStep } from "@/components/course-builder/review-step";

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
  } = useCourseBuilder();

  // Lesson editor sub-view of step 2
  if (step === 2 && editingLesson) {
    const mod = draft.modules.find((m) => m.id === editingLesson.moduleId);
    const lesson = mod?.lessons.find((l) => l.id === editingLesson.lessonId);
    if (!mod || !lesson) {
      // Lesson got removed; bail back to curriculum.
      setEditingLesson(null);
      return null;
    }
    const hasContent = lesson.blocks.length > 0;
    return (
      <CourseBuilderShell
        primaryLabel="Add lesson"
        primaryDisabled={!hasContent}
        onPrimary={() => setEditingLesson(null)}
        onPrevious={() => setEditingLesson(null)}
      >
        <LessonEditor mod={mod} lesson={lesson} />
      </CourseBuilderShell>
    );
  }

  // Step 1
  if (step === 1) {
    return (
      <CourseBuilderShell
        hidePrevious
        primaryLabel="Proceed"
        primaryDisabled={!isSetupComplete}
        onPrimary={() => setStep(2)}
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
  return (
    <CourseBuilderShell
      primaryLabel="Publish course"
      onPrimary={() => router.push("/courses")}
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
