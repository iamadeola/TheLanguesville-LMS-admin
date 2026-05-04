"use client";

import { Box, Stack, Text } from "@chakra-ui/react";
import type { LucideIcon } from "lucide-react";

interface ContentTypeCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick?: () => void;
}

export function ContentTypeCard({
  icon: Icon,
  title,
  description,
  onClick,
}: ContentTypeCardProps) {
  return (
    <Box
      onClick={onClick}
      cursor={onClick ? "pointer" : "default"}
      borderWidth="1px"
      borderColor="gray.200"
      rounded="lg"
      p={4}
      flex="1"
      minW={0}
      bg="white"
      _hover={onClick ? { borderColor: "#2E2F6F" } : undefined}
      transition="border-color 0.15s"
    >
      <Stack gap={3}>
        <Box
          w="36px"
          h="36px"
          rounded="md"
          bg="#E8E9F5"
          color="#2E2F6F"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Icon size={18} />
        </Box>
        <Stack gap={0.5}>
          <Text fontSize="sm" fontWeight="semibold" color="gray.900">
            {title}
          </Text>
          <Text fontSize="xs" color="gray.500">
            {description}
          </Text>
        </Stack>
      </Stack>
    </Box>
  );
}
