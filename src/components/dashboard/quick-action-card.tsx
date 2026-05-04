"use client";

import { Box, Stack, Text } from "@chakra-ui/react";
import type { LucideIcon } from "lucide-react";

interface QuickActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  iconColor?: string;
  iconBg?: string;
  onClick?: () => void;
}

export function QuickActionCard({
  icon: Icon,
  title,
  description,
  iconColor = "#2E2F6F",
  iconBg = "#E8E9F5",
  onClick,
}: QuickActionCardProps) {
  return (
    <Box
      onClick={onClick}
      bg="white"
      borderWidth="1px"
      borderColor="gray.200"
      rounded="lg"
      p={4}
      flex="1"
      minW="0"
      textAlign="left"
      cursor={onClick ? "pointer" : "default"}
      _hover={onClick ? { borderColor: "gray.300" } : undefined}
      transition="border-color 0.15s"
    >
      <Stack gap={3}>
        <Box
          w="36px"
          h="36px"
          rounded="md"
          bg={iconBg}
          color={iconColor}
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
