"use client";

import { Box, Flex, HStack, Stack, Text } from "@chakra-ui/react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Frame shared by "Add new role" and the role detail page: back arrow,
 * breadcrumb, title block, then a footer that stays pinned to the bottom of
 * the viewport while the permission list scrolls.
 */
export function RoleEditorShell({
  current,
  title,
  subtitle,
  onBack,
  children,
  footerLeft,
  footerRight,
}: {
  /** Trailing breadcrumb crumb, e.g. "New role" or the role's name. */
  current: string;
  title: ReactNode;
  subtitle: ReactNode;
  onBack: () => void;
  children: ReactNode;
  footerLeft?: ReactNode;
  footerRight: ReactNode;
}) {
  return (
    <Box>
      <Box px={8} pt={6} pb={10}>
        <Box
          as="button"
          onClick={onBack}
          color="gray.700"
          cursor="pointer"
          display="flex"
          mb={4}
          _hover={{ color: "gray.900" }}
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </Box>

        <HStack gap={2.5} mb={3}>
          <Text
            as="button"
            fontSize="sm"
            color="gray.500"
            cursor="pointer"
            _hover={{ color: "gray.700" }}
            onClick={onBack}
          >
            Roles &amp; Permissions
          </Text>
          <Box color="gray.300" display="flex">
            <ChevronRight size={16} />
          </Box>
          <Text fontSize="sm" color="#2E2F6F" fontWeight="medium">
            {current}
          </Text>
        </HStack>

        <Stack gap={1.5} mb={9}>
          {title}
          {subtitle}
        </Stack>

        {children}
      </Box>

      <Flex
        position="sticky"
        bottom={0}
        align="center"
        justify="space-between"
        gap={4}
        px={8}
        py={5}
        bg="white"
        borderTopWidth="1px"
        borderColor="gray.200"
        zIndex={10}
      >
        <Box>{footerLeft}</Box>
        <HStack gap={4}>{footerRight}</HStack>
      </Flex>
    </Box>
  );
}
