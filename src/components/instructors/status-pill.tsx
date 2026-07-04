"use client";

import { Box, HStack, Text } from "@chakra-ui/react";
import type { InstructorStatus } from "@/lib/api/instructors";

export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** "● Active" / "● Suspended" pill used on the instructors list + profile. */
export function InstructorStatusPill({ status }: { status: InstructorStatus }) {
  const active = status === "active";
  return (
    <HStack
      gap={1.5}
      px={3}
      py={1}
      rounded="full"
      bg={active ? "#DCFCE7" : "#FEE2E2"}
      w="fit-content"
    >
      <Box w="6px" h="6px" rounded="full" bg={active ? "#16A34A" : "#DC2626"} />
      <Text fontSize="sm" color={active ? "#16A34A" : "#DC2626"} fontWeight="medium">
        {capitalize(status)}
      </Text>
    </HStack>
  );
}
