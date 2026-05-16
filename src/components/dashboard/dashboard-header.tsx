"use client";

import {
  Box,
  Flex,
  HStack,
  Heading,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Bell, UserCircle2 } from "lucide-react";

interface DashboardHeaderProps {
  title: string;
  notificationCount?: number;
  user?: { name: string; role: string };
  loading?: boolean;
}

export function DashboardHeader({
  title,
  notificationCount = 0,
  user,
  loading = false,
}: DashboardHeaderProps) {
  return (
    <Flex
      h="72px"
      w="full"
      align="center"
      justify="space-between"
      px={8}
      borderBottomWidth="1px"
      borderColor="gray.200"
      bg="white"
      position="sticky"
      top={0}
      zIndex={10}
    >
      <Heading as="h1" size="lg" color="gray.900">
        {title}
      </Heading>

      <HStack gap={6}>
        <Box position="relative">
          <Bell size={22} color="#374151" />
          {notificationCount > 0 ? (
            <Box
              position="absolute"
              top="-2px"
              right="-2px"
              w="9px"
              h="9px"
              rounded="full"
              bg="#EF4444"
              borderWidth="2px"
              borderColor="white"
            />
          ) : null}
        </Box>

        <HStack gap={3}>
          <UserCircle2 size={36} color="#9CA3AF" strokeWidth={1.5} />
          {loading || !user ? (
            <Stack gap={1}>
              <Skeleton height="13px" width="100px" rounded="sm" />
              <Skeleton height="11px" width="60px" rounded="sm" />
            </Stack>
          ) : (
            <Stack gap={0} lineHeight="1.2">
              <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                {user.name}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {user.role}
              </Text>
            </Stack>
          )}
        </HStack>
      </HStack>
    </Flex>
  );
}
