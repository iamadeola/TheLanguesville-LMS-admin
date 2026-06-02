"use client";

import { Box, Flex, Skeleton, Stack, Text } from "@chakra-ui/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EditCourseShell } from "@/components/course-builder/edit-course-shell";
import {
  CourseBuilderProvider,
  useCourseBuilder,
  type CourseDraft,
} from "@/components/course-builder/course-builder-context";
import { CourseSetupStep } from "@/components/course-builder/course-setup-step";
import { CurriculumStep } from "@/components/course-builder/curriculum-step";
import { LessonEditor } from "@/components/course-builder/lesson-editor";
import { type ApiCourse, getCourse, updateCourse } from "@/lib/api/courses";

function mapCourseToDraft(course: ApiCourse): CourseDraft {
  return {
    title: course.title,
    description: course.description,
    level: course.level,
    price: String(course.price ?? ""),
    duration: course.duration ?? "",
    modules: course.modules.map((m) => ({
      id: m._id,
      title: m.title,
      lessons: m.lessons.map((l) => ({
        id: l._id,
        title: l.title,
        blocks: l.contentBlocks.map((b) => {
          if (b.type === "text")
            return { id: b._id, type: "text" as const, html: b.content ?? "" };
          if (b.type === "video")
            return { id: b._id, type: "video" as const, url: b.url ?? "" };
          return {
            id: b._id,
            type: "file" as const,
            fileName: b.fileName,
            fileSize: b.fileSize,
            mimeType: b.mimeType,
          };
        }),
      })),
    })),
  };
}

interface EditFlowProps {
  course: ApiCourse;
  openModuleId?: string;
  openLessonId?: string;
}

function EditFlow({ course, openModuleId, openLessonId }: EditFlowProps) {
  const router = useRouter();
  const { courseId } = useParams<{ courseId: string }>();
  const {
    step,
    setStep,
    draft,
    isSetupComplete,
    editingLesson,
    setEditingLesson,
  } = useCourseBuilder();

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (openModuleId && openLessonId) {
      setEditingLesson({ moduleId: openModuleId, lessonId: openLessonId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveSetup = async () => {
    setSaving(true);
    const result = await updateCourse(courseId, {
      title: draft.title,
      description: draft.description,
      level: draft.level ?? undefined,
      price: parseFloat(draft.price) || 0,
      duration: draft.duration,
    });
    if (result.success) {
      toast.success("Course details saved");
      setStep(2);
    } else {
      toast.error(result.message || "Failed to save course details");
    }
    setSaving(false);
  };

  const handleFinish = async () => {
    setSaving(true);
    const result = await updateCourse(courseId, {
      title: draft.title,
      description: draft.description,
      level: draft.level ?? undefined,
      price: parseFloat(draft.price) || 0,
      duration: draft.duration,
    });
    if (result.success) {
      toast.success("Course updated!");
      router.push(`/courses/${courseId}`);
    } else {
      toast.error(result.message || "Failed to save");
      setSaving(false);
    }
  };

  if (step === 2 && editingLesson) {
    const mod = draft.modules.find((m) => m.id === editingLesson.moduleId);
    const lesson = mod?.lessons.find((l) => l.id === editingLesson.lessonId);
    if (!mod || !lesson) {
      setEditingLesson(null);
      return null;
    }
    return (
      <EditCourseShell
        courseTitle={course.title}
        courseId={courseId}
        primaryLabel="Done"
        onPrimary={() => setEditingLesson(null)}
        onPrevious={() => setEditingLesson(null)}
      >
        <LessonEditor mod={mod} lesson={lesson} />
      </EditCourseShell>
    );
  }

  if (step === 1) {
    return (
      <EditCourseShell
        courseTitle={course.title}
        courseId={courseId}
        primaryLabel="Next: Curriculum"
        primaryDisabled={!isSetupComplete || saving}
        primaryLoading={saving}
        onPrimary={handleSaveSetup}
        hidePrevious
      >
        <CourseSetupStep />
      </EditCourseShell>
    );
  }

  return (
    <EditCourseShell
      courseTitle={course.title}
      courseId={courseId}
      primaryLabel="Save changes"
      primaryDisabled={saving}
      primaryLoading={saving}
      onPrimary={handleFinish}
      onPrevious={() => setStep(1)}
    >
      <CurriculumStep />
    </EditCourseShell>
  );
}

function EditCoursePageInner() {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const openModuleId = searchParams.get("moduleId") ?? undefined;
  const openLessonId = searchParams.get("lessonId") ?? undefined;
  const [course, setCourse] = useState<ApiCourse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const result = await getCourse(courseId);
      if (result.success) {
        setCourse(result.data);
      } else {
        toast.error(result.message || "Failed to load course");
        router.push(`/courses/${courseId}`);
      }
      setLoading(false);
    }
    void load();
  }, [courseId, router]);

  if (loading || !course) {
    return (
      <Flex h="100dvh" align="center" justify="center" bg="white">
        <Stack gap={3} align="center">
          <Box
            w="48px"
            h="48px"
            rounded="md"
            bg="#E8E9F5"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize="lg" fontWeight="bold" color="#2E2F6F">
              L
            </Text>
          </Box>
          <Stack gap={2} w="240px">
            <Skeleton height="12px" rounded="md" />
            <Skeleton height="12px" width="70%" rounded="md" />
          </Stack>
        </Stack>
      </Flex>
    );
  }

  const seedDraft = mapCourseToDraft(course);

  return (
    <CourseBuilderProvider
      initialDraft={seedDraft}
      initialCourseId={courseId}
      initialStep={2}
    >
      <EditFlow
        course={course}
        openModuleId={openModuleId}
        openLessonId={openLessonId}
      />
    </CourseBuilderProvider>
  );
}

export default function EditCourseClient() {
  return <EditCoursePageInner />;
}
