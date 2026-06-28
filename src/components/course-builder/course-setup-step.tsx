"use client";

import { Box, Heading, Input, Stack, Text, Textarea } from "@chakra-ui/react";
import { useCourseBuilder } from "./course-builder-context";
import { LevelRadioCards } from "./level-radio-cards";

const DESCRIPTION_MAX = 500;

const inputStyle = {
  h: "44px",
  borderColor: "gray.200",
  rounded: "md",
  fontSize: "sm",
  _focusVisible: {
    borderColor: "#2E2F6F",
    boxShadow: "0 0 0 1px #2E2F6F",
  },
} as const;

export function CourseSetupStep() {
  const { draft, setDraft } = useCourseBuilder();

  return (
    <Stack gap={5}>
      <Stack gap={1}>
        <Heading as="h2" size="md" color="gray.900">
          Course Setup
        </Heading>
        <Text fontSize="sm" color="gray.500">
          Add the essential details to begin creating your course
        </Text>
      </Stack>

      <FieldGroup
        label="Course title"
        helperText="Make it clear and specific for students' first impression"
      >
        <Input
          {...inputStyle}
          placeholder="e.g. Everyday French"
          value={draft.title}
          onChange={(e) =>
            setDraft((prev) => ({ ...prev, title: e.target.value }))
          }
        />
      </FieldGroup>

      <FieldGroup label="Description">
        <Box position="relative">
          <Textarea
            borderColor="gray.200"
            rounded="md"
            fontSize="sm"
            rows={4}
            resize="none"
            placeholder="Describe what students will learn in this course"
            maxLength={DESCRIPTION_MAX}
            value={draft.description}
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, description: e.target.value }))
            }
            _focusVisible={{
              borderColor: "#2E2F6F",
              boxShadow: "0 0 0 1px #2E2F6F",
            }}
          />
          <Text
            position="absolute"
            bottom="8px"
            right="12px"
            fontSize="xs"
            color="gray.400"
          >
            {draft.description.length}/{DESCRIPTION_MAX}
          </Text>
        </Box>
      </FieldGroup>

      <FieldGroup label="Level">
        <LevelRadioCards
          value={draft.level}
          onChange={(level) =>
            setDraft((prev) => ({ ...prev, level }))
          }
        />
      </FieldGroup>

      <FieldGroup label="Price">
        <Box position="relative">
          <Text
            position="absolute"
            left="12px"
            top="50%"
            transform="translateY(-50%)"
            color="gray.500"
            fontSize="sm"
            pointerEvents="none"
          >
            $
          </Text>
          <Input
            {...inputStyle}
            pl="28px"
            placeholder="50"
            value={draft.price}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                price: e.target.value.replace(/[^\d.]/g, ""),
              }))
            }
          />
        </Box>
      </FieldGroup>

      <FieldGroup
        label="Duration"
        helperText="Estimate how long learners will take to complete this course"
      >
        <Input
          {...inputStyle}
          placeholder="e.g. 4 hours"
          value={draft.duration}
          onChange={(e) =>
            setDraft((prev) => ({ ...prev, duration: e.target.value }))
          }
        />
      </FieldGroup>
    </Stack>
  );
}

function FieldGroup({
  label,
  helperText,
  children,
}: {
  label: string;
  helperText?: string;
  children: React.ReactNode;
}) {
  return (
    <Stack gap={1.5}>
      <Text fontSize="sm" fontWeight="medium" color="gray.800">
        {label}
      </Text>
      {children}
      {helperText ? (
        <Text fontSize="xs" color="gray.500">
          {helperText}
        </Text>
      ) : null}
    </Stack>
  );
}
