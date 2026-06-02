import LessonDetailClient from "./lesson-detail-client";

export function generateStaticParams() {
  return [{ courseId: "_", lessonId: "_" }];
}

export default function LessonDetailPage() {
  return <LessonDetailClient />;
}
