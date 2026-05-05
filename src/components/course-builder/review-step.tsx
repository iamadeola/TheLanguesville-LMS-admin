"use client";

import { Flex, Heading, IconButton, Stack, Text } from "@chakra-ui/react";
import { Pencil } from "lucide-react";
import { useCourseBuilder } from "./course-builder-context";

export function ReviewStep() {
  const { draft, totalLessons, setStep } = useCourseBuilder();

  const truncate = (str: string, max = 42) =>
    str.length > max ? str.slice(0, max) + "…" : str;

  return (
    <Stack gap={6}>
      <Stack gap={1}>
        <Heading as="h2" size="md" color="gray.900">
          Summary
        </Heading>
        <Text fontSize="sm" color="gray.500">
          Review your course details before publishing
        </Text>
      </Stack>

      <Stack gap={0}>
        <Text
          fontSize="xs"
          fontWeight="semibold"
          color="gray.900"
          mb={3}
          letterSpacing="0.01em"
        >
          Course details
        </Text>

        <SummaryRow
          label="Title"
          value={draft.title || "—"}
          onEdit={() => setStep(1)}
        />
        <SummaryRow
          label="Description"
          value={truncate(draft.description) || "—"}
          onEdit={() => setStep(1)}
        />
        <SummaryRow
          label="Level"
          value={draft.level ?? "—"}
          onEdit={() => setStep(1)}
        />
        <SummaryRow
          label="Price"
          value={draft.price ? `$${draft.price}` : "—"}
          onEdit={() => setStep(1)}
        />
        <SummaryRow
          label="Duration"
          value={draft.duration || "—"}
          onEdit={() => setStep(1)}
          last
        />
      </Stack>

      <Stack gap={0}>
        <Text
          fontSize="xs"
          fontWeight="semibold"
          color="gray.900"
          mb={3}
          letterSpacing="0.01em"
        >
          Curriculum
        </Text>

        <SummaryRow
          label="Modules"
          value={String(draft.modules.length)}
          onEdit={() => setStep(2)}
        />
        <SummaryRow
          label="Lessons"
          value={String(totalLessons)}
          onEdit={() => setStep(2)}
          last
        />
      </Stack>
    </Stack>
  );
}

function SummaryRow({
  label,
  value,
  onEdit,
  last = false,
}: {
  label: string;
  value: string;
  onEdit?: () => void;
  last?: boolean;
}) {
  return (
    <Flex
      align="center"
      justify="space-between"
      py={3}
      borderBottomWidth={last ? 0 : "1px"}
      borderColor="gray.200"
      gap={4}
    >
      <Text fontSize="sm" color="gray.500" minW="120px">
        {label}
      </Text>
      <Flex align="center" gap={2} flex="1" justify="flex-end">
        <Text
          fontSize="sm"
          color="gray.900"
          fontWeight="medium"
          textAlign="right"
        >
          {value}
        </Text>
        {onEdit ? (
          <IconButton
            aria-label={`Edit ${label}`}
            variant="ghost"
            size="xs"
            color="gray.400"
            onClick={onEdit}
            _hover={{ color: "#2E2F6F" }}
          >
            <Pencil size={12} />
          </IconButton>
        ) : null}
      </Flex>
    </Flex>
  );
}

// Re-export a convenience hook for the footer button label
export const REVIEW_PRIMARY_LABEL = "Publish";
