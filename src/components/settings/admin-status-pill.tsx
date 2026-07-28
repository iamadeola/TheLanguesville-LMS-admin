"use client";

import { Box, Text } from "@chakra-ui/react";
import type { AdminAccountStatus } from "@/lib/api/settings";

const STYLES: Record<AdminAccountStatus, { bg: string; color: string }> = {
  active: { bg: "#ECFDF3", color: "#027A48" },
  inactive: { bg: "#F2F4F7", color: "#344054" },
};

/** "Active" / "Inactive" chip in the Admin Management table and Details modal. */
export function AdminStatusPill({ status }: { status: AdminAccountStatus }) {
  const style = STYLES[status] ?? STYLES.inactive;
  return (
    <Box
      px={2.5}
      py={0.5}
      rounded="full"
      bg={style.bg}
      w="fit-content"
      flexShrink={0}
    >
      <Text fontSize="sm" color={style.color} fontWeight="medium">
        {status === "active" ? "Active" : "Inactive"}
      </Text>
    </Box>
  );
}
