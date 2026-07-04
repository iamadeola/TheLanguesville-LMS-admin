"use client";

import { Box, Flex, HStack, Portal, Stack, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";

/** Full-screen dimmed overlay hosting a centered white card. */
export function InviteOverlay({
  children,
  onClose,
  maxW = "460px",
}: {
  children: ReactNode;
  onClose?: () => void;
  maxW?: string;
}) {
  return (
    <Portal>
      <Box
        position="fixed"
        inset={0}
        bg="blackAlpha.600"
        zIndex={250}
        display="flex"
        alignItems="center"
        justifyContent="center"
        px={4}
        onClick={onClose}
      >
        <Box
          bg="white"
          rounded="2xl"
          w="full"
          maxW={maxW}
          boxShadow="2xl"
          px={7}
          py={7}
          maxH="92dvh"
          overflowY="auto"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </Box>
      </Box>
    </Portal>
  );
}

/** Green "1 of 2" progress bar under the wizard title. */
export function WizardProgress({ step, total }: { step: number; total: number }) {
  return (
    <HStack gap={3} mt={4} mb={5}>
      <Box flex="1" h="6px" rounded="full" bg="gray.200" overflow="hidden">
        <Box h="full" rounded="full" bg="#22C55E" w={`${(step / total) * 100}%`} transition="width 0.25s" />
      </Box>
      <Text fontSize="xs" color="gray.600" flexShrink={0}>
        {step} of {total}
      </Text>
    </HStack>
  );
}

/** Wizard title block ("Invite Instructor" / "Send a join link…"). */
export function WizardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <Stack gap={1}>
      <Text fontSize="xl" fontWeight="bold" color="gray.900">
        {title}
      </Text>
      {subtitle ? (
        <Text fontSize="sm" color="gray.500">
          {subtitle}
        </Text>
      ) : null}
    </Stack>
  );
}

/** Section heading inside a wizard step. */
export function StepHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <Stack gap={0.5} mb={5}>
      <Text fontWeight="semibold" color="gray.900">
        {title}
      </Text>
      <Text fontSize="sm" color="gray.500">
        {subtitle}
      </Text>
    </Stack>
  );
}

/** "‹ Back to …" link centered above the wizard footer buttons. */
export function BackLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Flex justify="center" mb={4}>
      <HStack as="button" onClick={onClick} gap={1.5} color="gray.700" fontSize="sm" cursor="pointer" _hover={{ color: "gray.900" }}>
        <Text as="span" fontSize="md" lineHeight="1">
          ‹
        </Text>
        <Text>{label}</Text>
      </HStack>
    </Flex>
  );
}
