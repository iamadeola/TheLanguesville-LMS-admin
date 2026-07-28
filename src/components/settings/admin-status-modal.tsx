"use client";

import { Button, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";
import { InviteOverlay } from "@/components/invitations/invite-shell";
import { Avatar } from "@/components/shared/avatar";
import type { AdminListItem } from "@/lib/api/settings";

/**
 * Deactivate / Reactivate confirmation. Unlike the generic ConfirmModal this
 * one leads with the admin's avatar and name, which is how the design
 * disambiguates whose account is about to change.
 */
export function AdminStatusModal({
  admin,
  onConfirm,
  onClose,
}: {
  admin: AdminListItem;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const deactivating = admin.status === "active";

  const confirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  };

  return (
    <InviteOverlay onClose={busy ? undefined : onClose} maxW="420px">
      <Stack gap={5} align="center" textAlign="center" pt={1}>
        <Stack gap={2.5} align="center">
          <Avatar
            name={admin.name}
            src={admin.avatarUrl}
            initials={admin.initials}
            size={52}
          />
          <Text fontSize="sm" color="gray.700">
            {admin.name}
          </Text>
        </Stack>

        <Stack gap={2}>
          <Text fontSize="xl" fontWeight="semibold" color="gray.900">
            {deactivating ? "Deactivate Admin?" : "Reactivate Admin?"}
          </Text>
          <Text fontSize="sm" color="gray.600" maxW="330px">
            {deactivating
              ? "Are you sure you want to deactivate this admin. After deactivation, this admin will no longer be able to perform any action"
              : "Are you sure you want to reactivate this admin?"}
          </Text>
        </Stack>

        <Stack gap={3} w="full" mt={1}>
          <Button
            bg="#2E2F6F"
            color="white"
            rounded="full"
            h="48px"
            fontWeight="medium"
            _hover={{ bg: "#262760" }}
            loading={busy}
            disabled={busy}
            onClick={confirm}
          >
            {deactivating ? "Deactivate admin" : "Reactivate admin"}
          </Button>
          <Button
            variant="outline"
            rounded="full"
            h="48px"
            fontWeight="medium"
            disabled={busy}
            onClick={onClose}
          >
            Cancel
          </Button>
        </Stack>
      </Stack>
    </InviteOverlay>
  );
}
