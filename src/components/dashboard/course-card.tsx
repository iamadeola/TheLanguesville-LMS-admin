"use client";

import { Box, Flex, HStack, Stack, Text } from "@chakra-ui/react";

interface CourseCardProps {
  level: string;
  status: "Published" | "Draft";
  title: string;
  modules: number;
  lessons: number;
  hours: number;
  progressPercent: number;
}

export function CourseCard({
  level,
  status,
  title,
  modules,
  lessons,
  hours,
  progressPercent,
}: CourseCardProps) {
  const statusColor =
    status === "Published"
      ? { bg: "#DCFCE7", color: "#16A34A" }
      : { bg: "#FEF3C7", color: "#B45309" };

  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderColor="gray.200"
      rounded="lg"
      p={4}
      flex="1"
      minW="0"
    >
      <Flex justify="space-between" align="center" mb={3}>
        <Box
          bg="#E8E9F5"
          color="#2E2F6F"
          px={2.5}
          py={0.5}
          rounded="full"
          fontSize="xs"
          fontWeight="semibold"
        >
          {level}
        </Box>
        <Box
          bg={statusColor.bg}
          color={statusColor.color}
          px={2.5}
          py={0.5}
          rounded="full"
          fontSize="xs"
          fontWeight="semibold"
        >
          {status}
        </Box>
      </Flex>

      <Stack gap={1} mb={3}>
        <Text fontWeight="semibold" color="gray.900" fontSize="sm">
          {title}
        </Text>
        <Text fontSize="xs" color="gray.500">
          {modules} modules · {lessons} lessons · {hours} hours
        </Text>
      </Stack>

      <HStack gap={3}>
        <Box flex="1" h="6px" bg="gray.100" rounded="full" overflow="hidden">
          <Box
            h="full"
            w={`${progressPercent}%`}
            bg="#2E2F6F"
            rounded="full"
          />
        </Box>
        <Text fontSize="xs" color="gray.700" fontWeight="semibold">
          {progressPercent}%
        </Text>
      </HStack>
    </Box>
  );
}
