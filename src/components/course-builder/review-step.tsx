"use client";

import { Box, Heading, Stack, Text } from "@chakra-ui/react";
import { useCourseBuilder } from "./course-builder-context";

export function ReviewStep() {
  const { draft, totalLessons } = useCourseBuilder();

  return (
    <Stack gap={5}>
      <Stack gap={1}>
        <Heading as="h2" size="md" color="gray.900">
          Review
        </Heading>
        <Text fontSize="sm" color="gray.500">
          A quick summary before you publish your course.
        </Text>
      </Stack>

      <Box
        borderWidth="1px"
        borderColor="gray.200"
        rounded="lg"
        p={5}
        bg="white"
      >
        <Stack gap={4}>
          <SummaryRow label="Title" value={draft.title || "—"} />
          <SummaryRow
            label="Description"
            value={draft.description || "—"}
          />
          <SummaryRow label="Level" value={draft.level ?? "—"} />
          <SummaryRow label="Price" value={draft.price ? `$${draft.price}` : "—"} />
          <SummaryRow label="Duration" value={draft.duration || "—"} />
          <SummaryRow
            label="Curriculum"
            value={`${draft.modules.length} modules · ${totalLessons} lessons`}
          />
        </Stack>
      </Box>
    </Stack>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack gap={0.5}>
      <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="0.04em">
        {label}
      </Text>
      <Text fontSize="sm" color="gray.900">
        {value}
      </Text>
    </Stack>
  );
}
