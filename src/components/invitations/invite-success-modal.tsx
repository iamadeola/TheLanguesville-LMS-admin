"use client";

import { Box, Button, Flex, HStack, Stack, Text } from "@chakra-ui/react";
import { CircleCheck } from "lucide-react";
import { Avatar } from "@/components/shared/avatar";
import { AppButton } from "@/components/ui/app-button";
import { formatDateLong } from "@/lib/format";
import { InviteOverlay } from "./invite-shell";

const ROLE_BADGES: Record<string, { bg: string; color: string }> = {
  Student: { bg: "#DBEAFE", color: "#1D4ED8" },
  Instructor: { bg: "#EEF2FF", color: "#4338CA" },
  Admin: { bg: "#F3F4F6", color: "#374151" },
};

interface InviteSuccessModalProps {
  name: string;
  email: string;
  /** "Student" | "Instructor" | "Admin" — rendered as the badge. */
  roleLabel: string;
  /** "The student will receive an email to join the platform." */
  description: string;
  expiresAt: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel: string;
  onSecondary: () => void;
  onClose: () => void;
}

/** "Invitation sent successfully" — shown after any invite wizard completes. */
export function InviteSuccessModal({
  name,
  email,
  roleLabel,
  description,
  expiresAt,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  onClose,
}: InviteSuccessModalProps) {
  const badge = ROLE_BADGES[roleLabel] ?? ROLE_BADGES.Admin;

  return (
    <InviteOverlay onClose={onClose} maxW="420px">
      <Stack gap={5} align="center" textAlign="center" pt={2}>
        <Flex w="56px" h="56px" rounded="full" bg="#DCFCE7" align="center" justify="center" color="#16A34A">
          <CircleCheck size={28} />
        </Flex>
        <Stack gap={1.5}>
          <Text fontSize="lg" fontWeight="semibold" color="gray.900">
            Invitation sent successfully
          </Text>
          <Text fontSize="sm" color="gray.500" maxW="300px">
            {description}
          </Text>
        </Stack>

        <Flex w="full" bg="gray.50" borderWidth="1px" borderColor="gray.100" rounded="xl" px={4} py={3.5} align="center" justify="space-between">
          <HStack gap={3}>
            <Avatar name={name} size={38} />
            <Stack gap={0} textAlign="left">
              <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                {name}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {email}
              </Text>
            </Stack>
          </HStack>
          <Box px={3} py={1} rounded="full" bg={badge.bg} color={badge.color} fontSize="xs" fontWeight="medium">
            {roleLabel}
          </Box>
        </Flex>

        <Text fontSize="sm" color="gray.500">
          Expires{" "}
          <Text as="span" color="#F97461" fontWeight="medium">
            {formatDateLong(expiresAt)}
          </Text>
        </Text>

        <Stack gap={3} w="full">
          <AppButton onClick={onPrimary}>{primaryLabel}</AppButton>
          <Button variant="outline" rounded="full" h="48px" fontWeight="medium" onClick={onSecondary}>
            {secondaryLabel}
          </Button>
        </Stack>
      </Stack>
    </InviteOverlay>
  );
}
