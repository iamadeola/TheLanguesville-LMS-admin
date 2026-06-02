import CourseDetailClient from "./course-detail-client";

export function generateStaticParams() {
  return [{ courseId: "_" }];
}

export default function CourseDetailPage() {
  return <CourseDetailClient />;
}
