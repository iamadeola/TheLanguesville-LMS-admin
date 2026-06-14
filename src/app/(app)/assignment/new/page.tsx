"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { StepBasicInfo } from "@/components/assignment/wizard/step-basic-info";
import { StepGrading } from "@/components/assignment/wizard/step-grading";
import { StepResources } from "@/components/assignment/wizard/step-resources";
import { StepReview } from "@/components/assignment/wizard/step-review";
import { StepSubmission } from "@/components/assignment/wizard/step-submission";
import {
  WizardProvider,
  useWizard,
  type WizardStep,
} from "@/components/assignment/wizard/wizard-context";
import { WizardShell } from "@/components/assignment/wizard/wizard-shell";
import { courseTree } from "@/lib/mock/course-tree";
import { assignmentPaths } from "@/lib/routes";
import { addAssignment, createId } from "@/lib/mock/assignments";

function isoToLabel(iso: string): string {
  if (!iso) return "No due date";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function NewAssignmentFlow() {
  const router = useRouter();
  const { draft, step, setStep, canProceed } = useWizard();

  const publish = () => {
    const selected = new Set(draft.selectedLessonIds);
    const course = courseTree.find((c) =>
      c.modules.some((m) => m.lessons.some((l) => selected.has(l.id))),
    );

    addAssignment({
      id: createId("asg"),
      title: draft.title || "Untitled assignment",
      description: draft.description,
      type: draft.type ?? "essay",
      courseName: course?.title ?? "—",
      assignedTo: course?.studentCount ?? 0,
      dueDate: isoToLabel(draft.dueDate),
      status: "active",
      gradingMethod: draft.gradingMethod ?? "manual",
      submissionType: draft.submissionType ?? "text",
      totalPoints: parseInt(draft.totalPoints, 10) || 100,
      passingScore: parseInt(draft.passingScore, 10) || 60,
      allowLate: draft.allowLate,
      instructions: draft.description,
      attachments: draft.files.map((name) => ({ id: createId("att"), name })),
      rubric: draft.gradingMethod === "rubric" ? draft.rubric : [],
      submissions: [],
    });

    toast.success("Assignment Published", {
      description: "Your assignment has been published successfully.",
    });
    router.push(assignmentPaths.list);
  };

  const handlePrimary = () => {
    if (step === 5) {
      publish();
      return;
    }
    setStep((step + 1) as WizardStep);
  };

  const isLast = step === 5;

  return (
    <WizardShell
      primaryLabel={isLast ? "Publish" : "Proceed"}
      primaryDisabled={!canProceed(step)}
      onPrimary={handlePrimary}
      onPrevious={step > 1 ? () => setStep((step - 1) as WizardStep) : undefined}
      onSaveDraft={() => toast.success("Draft saved")}
      showPrevious={step > 1}
      showSaveDraft={step > 1 && step < 5}
    >
      {step === 1 ? <StepBasicInfo /> : null}
      {step === 2 ? <StepSubmission /> : null}
      {step === 3 ? <StepGrading /> : null}
      {step === 4 ? <StepResources /> : null}
      {step === 5 ? <StepReview /> : null}
    </WizardShell>
  );
}

export default function NewAssignmentPage() {
  return (
    <WizardProvider>
      <NewAssignmentFlow />
    </WizardProvider>
  );
}
