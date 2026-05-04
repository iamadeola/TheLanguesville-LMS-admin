"use client";

import { Box, HStack, Text } from "@chakra-ui/react";

interface ProgressStepsProps {
  label: string;
  currentStep: number;
  totalSteps: number;
}

/**
 * Segmented progress bar (e.g. "Personal details: 1/2") used in onboarding forms.
 */
export function ProgressSteps({
  label,
  currentStep,
  totalSteps,
}: ProgressStepsProps) {
  return (
    <Box w="full">
      <HStack gap={1.5} mb={2}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <Box
            key={i}
            flex="1"
            h="4px"
            rounded="full"
            bg={i < currentStep ? "#22C55E" : "#E5E7EB"}
          />
        ))}
      </HStack>
      <Text fontSize="xs" color="gray.700" fontWeight="medium">
        {label}: {currentStep}/{totalSteps}
      </Text>
    </Box>
  );
}
