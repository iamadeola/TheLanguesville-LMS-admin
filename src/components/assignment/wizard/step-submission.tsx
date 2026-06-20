"use client";

import { Grid, HStack, Stack, Text } from "@chakra-ui/react";
import { Link2, Type, Upload } from "lucide-react";
import type { SubmissionType } from "@/lib/api/assignments";
import { SelectableCard, Toggle } from "@/components/assignment/shared";
import { useWizard } from "./wizard-context";
import { Card, FieldLabel, StepHeading, TextField } from "./wizard-bits";

const SUB_TYPES: { value: SubmissionType; label: string; icon: typeof Upload }[] = [
  { value: "file", label: "File upload", icon: Upload },
  { value: "text", label: "Text entry", icon: Type },
  { value: "url", label: "URL", icon: Link2 },
];

export function StepSubmission() {
  const { draft, update } = useWizard();

  return (
    <Stack gap={6}>
      <StepHeading
        title="Submission settings"
        subtitle="Configure how and when students submit their work."
      />

      <Card title="Submission type">
        <HStack gap={3} align="stretch">
          {SUB_TYPES.map((t) => (
            <SelectableCard
              key={t.value}
              icon={t.icon}
              label={t.label}
              selected={draft.submissionType === t.value}
              onClick={() => update({ submissionType: t.value })}
            />
          ))}
        </HStack>
      </Card>

      <Card title="Due date & time">
        <Grid templateColumns="1fr 1fr" gap={4}>
          <Stack gap={0}>
            <FieldLabel>Due date</FieldLabel>
            <TextField
              type="date"
              value={draft.dueDate}
              onChange={(e) => update({ dueDate: e.target.value })}
            />
          </Stack>
          <Stack gap={0}>
            <FieldLabel>Due time</FieldLabel>
            <TextField
              type="time"
              value={draft.dueTime}
              onChange={(e) => update({ dueTime: e.target.value })}
            />
          </Stack>
        </Grid>
      </Card>

      <Card title="Submission rules">
        <Stack gap={4}>
          <HStack justify="space-between" align="flex-start">
            <Stack gap={0.5}>
              <Text fontSize="sm" fontWeight="medium" color="gray.900">
                Allow late submissions
              </Text>
              <Text fontSize="sm" color="gray.500">
                Students can submit after the due date with a late penalty
              </Text>
            </Stack>
            <Toggle
              aria-label="Allow late submissions"
              checked={draft.allowLate}
              onChange={(next) => update({ allowLate: next })}
            />
          </HStack>

          {draft.allowLate ? (
            <Grid templateColumns="1fr 1fr" gap={4}>
              <Stack gap={0}>
                <FieldLabel>Due date</FieldLabel>
                <TextField
                  type="date"
                  value={draft.lateDate}
                  onChange={(e) => update({ lateDate: e.target.value })}
                />
              </Stack>
              <Stack gap={0}>
                <FieldLabel>Due time</FieldLabel>
                <TextField
                  type="time"
                  value={draft.lateTime}
                  onChange={(e) => update({ lateTime: e.target.value })}
                />
              </Stack>
            </Grid>
          ) : null}
        </Stack>
      </Card>
    </Stack>
  );
}
