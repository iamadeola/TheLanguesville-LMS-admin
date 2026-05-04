"use client";

import { Box } from "@chakra-ui/react";

export function AdminBadge({ label = "Admin" }: { label?: string }) {
  return (
    <Box
      display="inline-block"
      bg="#E8E9F5"
      color="#2E2F6F"
      px={3}
      py={1}
      rounded="full"
      fontSize="xs"
      fontWeight="medium"
    >
      {label}
    </Box>
  );
}
