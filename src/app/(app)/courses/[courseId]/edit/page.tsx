import { Suspense } from "react";
import EditCourseClient from "./edit-course-client";

export function generateStaticParams() {
  return [];
}

export default function EditCoursePage() {
  return (
    <Suspense>
      <EditCourseClient />
    </Suspense>
  );
}
