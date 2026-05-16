"use client";

import { Box, Button, Flex, HStack, IconButton, Text } from "@chakra-ui/react";
import { FileText, Link2, Trash2, Video, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { BlockType } from "../course-builder-context";

const BLOCK_META: Record<BlockType, { label: string; icon: LucideIcon }> = {
  text: { label: "Text", icon: FileText },
  video: { label: "Video", icon: Video },
  file: { label: "File", icon: Link2 },
};

interface BlockWrapperProps {
  type: BlockType;
  index: number;
  children: ReactNode;
  onSave: () => void;
  onRemove: () => void;
}

export function BlockWrapper({
  type,
  index,
  children,
  onSave,
  onRemove,
}: BlockWrapperProps) {
  const meta = BLOCK_META[type];
  const Icon = meta.icon;

  return (
    <Box
      borderWidth="1px"
      borderColor="gray.200"
      rounded="lg"
      bg="white"
      overflow="hidden"
    >
      <Flex
        align="center"
        justify="space-between"
        px={4}
        py={2.5}
        borderBottomWidth="1px"
        borderColor="gray.100"
      >
        <HStack gap={2} color="gray.600">
          <Icon size={14} />
          <Text fontSize="xs" fontWeight="medium" color="gray.700">
            Block {String(index + 1).padStart(2, "0")}
          </Text>
          <Text fontSize="xs" color="gray.400">
            ·
          </Text>
          <Text fontSize="xs" fontWeight="medium" color="gray.700">
            {meta.label}
          </Text>
        </HStack>
        <HStack gap={1}>
          <Button
            size="xs"
            bg="#2E2F6F"
            color="white"
            rounded="md"
            px={3}
            h="24px"
            fontSize="xs"
            fontWeight="medium"
            _hover={{ bg: "#262760" }}
            onClick={onSave}
          >
            Save
          </Button>
          <IconButton
            aria-label={`Delete block ${index + 1}`}
            variant="ghost"
            size="xs"
            color="#DC2626"
            onClick={onRemove}
          >
            <Trash2 size={14} />
          </IconButton>
        </HStack>
      </Flex>
      <Box p={4}>{children}</Box>
    </Box>
  );
}
