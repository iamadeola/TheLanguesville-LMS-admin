"use client";

import { Box, HStack, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { Check } from "lucide-react";
import type { CourseLevel } from "./course-builder-context";

interface LevelOption {
  value: CourseLevel;
  label: string;
}

const LEVELS: LevelOption[] = [
  { value: "A1", label: "Beginner" },
  { value: "A2", label: "Elementary" },
  { value: "B1", label: "Intermediate" },
  { value: "B2", label: "Upper Intermediate" },
  { value: "C1", label: "Advanced" },
  { value: "C2", label: "Proficient" },
];

interface LevelRadioCardsProps {
  value: CourseLevel | null;
  onChange: (value: CourseLevel) => void;
}

export function LevelRadioCards({ value, onChange }: LevelRadioCardsProps) {
  return (
    <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={3}>
      {LEVELS.map((opt) => {
        const selected = value === opt.value;
        return (
          <Box
            key={opt.value}
            onClick={() => onChange(opt.value)}
            cursor="pointer"
            borderWidth="1px"
            borderColor={selected ? "#F97461" : "gray.200"}
            bg={selected ? "#FFF1ED" : "white"}
            rounded="md"
            p={3}
            transition="all 0.15s"
            _hover={!selected ? { borderColor: "gray.300" } : undefined}
          >
            <HStack gap={3} align="center">
              <Box
                w="18px"
                h="18px"
                rounded="full"
                borderWidth={selected ? 0 : "1.5px"}
                borderColor="gray.300"
                bg={selected ? "#F97461" : "transparent"}
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
              >
                {selected ? <Check size={12} color="white" /> : null}
              </Box>
              <Stack gap={0} lineHeight="1.2">
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color={selected ? "#F97461" : "gray.900"}
                >
                  {opt.value}
                </Text>
                <Text
                  fontSize="xs"
                  color={selected ? "#F97461" : "gray.500"}
                >
                  {opt.label}
                </Text>
              </Stack>
            </HStack>
          </Box>
        );
      })}
    </SimpleGrid>
  );
}
