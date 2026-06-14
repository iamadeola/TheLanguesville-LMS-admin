"use client";

import { Box, Button, Heading, Portal, Stack } from "@chakra-ui/react";
import type { ReactNode } from "react";

interface SettingsModalProps {
  title: string;
  children: ReactNode;
  onSave: () => void;
  onClose: () => void;
  saveLabel?: string;
}

export function SettingsModal({
  title,
  children,
  onSave,
  onClose,
  saveLabel = "Save",
}: SettingsModalProps) {
  return (
    <Portal>
      <Box
        position="fixed"
        inset={0}
        bg="blackAlpha.600"
        zIndex={200}
        display="flex"
        alignItems="center"
        justifyContent="center"
        px={4}
        onClick={onClose}
      >
        <Box
          bg="white"
          rounded="2xl"
          p={7}
          w="full"
          maxW="460px"
          boxShadow="2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <Heading as="h3" size="md" color="gray.900" mb={5}>
            {title}
          </Heading>
          <Stack gap={5}>
            {children}
            <Stack gap={3}>
              <Button
                bg="#2E2F6F"
                color="white"
                rounded="full"
                h="48px"
                fontSize="sm"
                fontWeight="semibold"
                _hover={{ bg: "#262760" }}
                onClick={onSave}
              >
                {saveLabel}
              </Button>
              <Button
                variant="outline"
                rounded="full"
                h="48px"
                fontSize="sm"
                fontWeight="medium"
                onClick={onClose}
              >
                Cancel
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Portal>
  );
}
