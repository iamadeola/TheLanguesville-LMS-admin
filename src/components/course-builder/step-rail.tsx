"use client";

import { Box, HStack, Stack, Text } from "@chakra-ui/react";
import { Check } from "lucide-react";
import { useCourseBuilder, type Step } from "./course-builder-context";

interface StepDef {
  number: Step;
  label: string;
}

const STEPS: StepDef[] = [
  { number: 1, label: "Course Setup" },
  { number: 2, label: "Curriculum" },
  { number: 3, label: "Review" },
];

type Status = "complete" | "active" | "pending";

function getStatus(step: Step, current: Step): Status {
  if (step < current) return "complete";
  if (step === current) return "active";
  return "pending";
}

export function StepRail() {
  const { step: current, isSetupComplete, totalLessons, setStep } =
    useCourseBuilder();

  // Mark step 1 as complete once basic setup is done, regardless of current step
  const overrideStatus = (s: Step, base: Status): Status => {
    if (s === 1 && isSetupComplete && current !== 1) return "complete";
    if (s === 2 && totalLessons > 0 && current === 3) return "complete";
    return base;
  };

  const canNavigate = (s: Step) => {
    if (s === 1) return true;
    if (s === 2) return isSetupComplete;
    if (s === 3) return isSetupComplete && totalLessons > 0;
    return false;
  };

  return (
    <Stack gap={2} w="220px" pt={2}>
      {STEPS.map((s) => {
        const base = getStatus(s.number, current);
        const status = overrideStatus(s.number, base);
        const navigable = canNavigate(s.number);
        const isActive = status === "active";

        return (
          <HStack
            key={s.number}
            gap={3}
            px={3}
            py={2.5}
            rounded="md"
            bg={isActive ? "#FFF1ED" : "transparent"}
            cursor={navigable ? "pointer" : "not-allowed"}
            opacity={navigable ? 1 : 0.6}
            onClick={() => {
              if (navigable) setStep(s.number);
            }}
            _hover={navigable && !isActive ? { bg: "gray.50" } : undefined}
            transition="background 0.15s"
          >
            <Box
              w="24px"
              h="24px"
              rounded="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
              bg={
                status === "complete"
                  ? "#16A34A"
                  : isActive
                    ? "#F97461"
                    : "#9CA3AF"
              }
              color="white"
              fontSize="xs"
              fontWeight="semibold"
              flexShrink={0}
            >
              {status === "complete" ? <Check size={14} /> : s.number}
            </Box>
            <Text
              fontSize="sm"
              fontWeight={isActive ? "semibold" : "medium"}
              color={isActive ? "#F97461" : "gray.800"}
            >
              {s.label}
            </Text>
          </HStack>
        );
      })}
    </Stack>
  );
}
