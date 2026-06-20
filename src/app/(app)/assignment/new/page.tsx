"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { StepBasicInfo } from "@/components/assignment/wizard/step-basic-info";
import { StepGrading } from "@/components/assignment/wizard/step-grading";
import { StepResources } from "@/components/assignment/wizard/step-resources";
import { StepReview } from "@/components/assignment/wizard/step-review";
import { StepSubmission } from "@/components/assignment/wizard/step-submission";
import {
  type AssignmentDraft,
  WizardProvider,
  type WizardStep,
  useWizard,
} from "@/components/assignment/wizard/wizard-context";
import { WizardShell } from "@/components/assignment/wizard/wizard-shell";
import { getApiErrorMessage } from "@/lib/api/client";
import {
  type PlacementInput,
  type UpdateAssignmentPayload,
  createAssignment,
  publishAssignment,
  recordId,
  updateAssignment,
} from "@/lib/api/assignments";
import { assignmentPaths } from "@/lib/routes";

/** Combine a `<input type=date>` + `<input type=time>` into an ISO-8601 string. */
function combineDateTime(date: string, time: string): string | null {
  if (!date) return null;
  const dt = new Date(`${date}T${time || "23:59"}:00`);
  return Number.isNaN(dt.getTime()) ? null : dt.toISOString();
}

/** Build the backend slice for a given wizard step from the local draft. */
function sliceForStep(
  step: WizardStep,
  draft: AssignmentDraft,
  placements: PlacementInput[],
): UpdateAssignmentPayload {
  switch (step) {
    case 1:
      return {
        title: draft.title.trim(),
        description: draft.description || undefined,
        type: draft.type ?? undefined,
        placements,
      };
    case 2:
      return {
        submission: {
          type: draft.submissionType ?? undefined,
          dueAt: combineDateTime(draft.dueDate, draft.dueTime),
          allowLate: draft.allowLate,
          lateDueAt: draft.allowLate
            ? combineDateTime(draft.lateDate, draft.lateTime)
            : null,
        },
      };
    case 3:
      return {
        grading: {
          method: draft.gradingMethod ?? undefined,
          totalPoints: parseInt(draft.totalPoints, 10) || 0,
          passingScore: parseInt(draft.passingScore, 10) || 0,
          rubric:
            draft.gradingMethod === "rubric"
              ? draft.rubric.map((c) => ({ name: c.name, points: c.points }))
              : [],
        },
      };
    case 4:
      return {
        resources: { files: draft.files, links: draft.links },
      };
    default:
      return {};
  }
}

function NewAssignmentFlow() {
  const router = useRouter();
  const {
    draft,
    step,
    setStep,
    canProceed,
    canPublish,
    placements,
    assignmentId,
    setAssignmentId,
  } = useWizard();
  const [saving, setSaving] = useState(false);

  /** Persist the current step. Creates the draft on the first save. */
  const saveCurrentStep = async (): Promise<boolean> => {
    const slice = sliceForStep(step, draft, placements);

    if (step === 1 && !assignmentId) {
      const result = await createAssignment({
        title: draft.title.trim(),
        description: draft.description || undefined,
        type: draft.type ?? undefined,
        placements,
      });
      if (!result.success) {
        toast.error(getApiErrorMessage(result, "Couldn't save assignment"));
        return false;
      }
      setAssignmentId(recordId(result.data));
      return true;
    }

    if (!assignmentId) return true; // nothing to persist yet
    const result = await updateAssignment(assignmentId, slice);
    if (!result.success) {
      toast.error(getApiErrorMessage(result, "Couldn't save changes"));
      return false;
    }
    return true;
  };

  const handlePrimary = async () => {
    if (saving) return;
    setSaving(true);

    if (step === 5) {
      if (!assignmentId) {
        toast.error("Finish the earlier steps before publishing.");
        setSaving(false);
        return;
      }
      const result = await publishAssignment(assignmentId);
      setSaving(false);
      if (result.success) {
        toast.success("Assignment Published", {
          description: "Your assignment has been published successfully.",
        });
        router.push(assignmentPaths.list);
      } else {
        toast.error(getApiErrorMessage(result, "Couldn't publish assignment"));
      }
      return;
    }

    const ok = await saveCurrentStep();
    setSaving(false);
    if (ok) setStep((step + 1) as WizardStep);
  };

  const handleSaveDraft = async () => {
    if (saving) return;
    setSaving(true);
    const ok = await saveCurrentStep();
    setSaving(false);
    if (ok) toast.success("Draft saved");
  };

  const isLast = step === 5;
  const primaryDisabled = isLast ? !canPublish : !canProceed(step);

  return (
    <WizardShell
      primaryLabel={isLast ? "Publish" : "Proceed"}
      primaryDisabled={primaryDisabled}
      primaryLoading={saving}
      onPrimary={handlePrimary}
      onPrevious={step > 1 ? () => setStep((step - 1) as WizardStep) : undefined}
      onSaveDraft={handleSaveDraft}
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
