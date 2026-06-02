import EditCourseClient from "./edit-course-client";

export function generateStaticParams() {
  return [{ courseId: "_" }];
}

export default function EditCoursePage() {
  return <EditCourseClient />;
}
