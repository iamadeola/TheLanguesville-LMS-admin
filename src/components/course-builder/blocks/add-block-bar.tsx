"use client";

import { Box, Flex, HStack, IconButton, Text } from "@chakra-ui/react";
import { FileText, Link2, Plus, Video, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import type { BlockType } from "../course-builder-context";

interface AddBlockBarProps {
  onAdd: (type: BlockType) => void;
}

interface InsertOption {
  type: BlockType;
  label: string;
  icon: LucideIcon;
}

const OPTIONS: InsertOption[] = [
  { type: "text", label: "Text", icon: FileText },
  { type: "video", label: "Video", icon: Video },
  { type: "file", label: "File", icon: Link2 },
];

/**
 * Dual-mode add-block control:
 * - Collapsed: dashed "+ Add content block" button
 * - Expanded: horizontal "Insert: [Text] [Video] [File] (x)" bar
 */
export function AddBlockBar({ onAdd }: AddBlockBarProps) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Box
        onClick={() => setOpen(true)}
        borderWidth="1px"
        borderStyle="dashed"
        borderColor="gray.300"
        rounded="md"
        py={3}
        cursor="pointer"
        _hover={{ borderColor: "#2E2F6F", bg: "gray.50" }}
        transition="border-color 0.15s"
      >
        <HStack gap={2} justify="center" color="#2E2F6F">
          <Plus size={16} />
          <Text fontSize="sm" fontWeight="medium">
            Add content block
          </Text>
        </HStack>
      </Box>
    );
  }

  return (
    <Flex
      align="center"
      justify="space-between"
      borderWidth="1px"
      borderColor="gray.200"
      rounded="md"
      bg="white"
      px={3}
      py={2}
      gap={3}
      boxShadow="sm"
    >
      <HStack gap={2}>
        <Text fontSize="xs" color="gray.500" fontWeight="medium">
          Insert:
        </Text>
        {OPTIONS.map((opt) => {
          const Icon = opt.icon;
          return (
            <HStack
              key={opt.type}
              onClick={() => {
                onAdd(opt.type);
                setOpen(false);
              }}
              gap={1.5}
              px={2.5}
              py={1}
              borderWidth="1px"
              borderColor="gray.200"
              rounded="md"
              cursor="pointer"
              fontSize="xs"
              color="gray.700"
              fontWeight="medium"
              _hover={{ borderColor: "#2E2F6F", color: "#2E2F6F" }}
              transition="all 0.15s"
            >
              <Icon size={12} />
              <Text>{opt.label}</Text>
            </HStack>
          );
        })}
      </HStack>

      <IconButton
        aria-label="Close insert bar"
        variant="ghost"
        size="xs"
        color="gray.500"
        onClick={() => setOpen(false)}
      >
        <X size={14} />
      </IconButton>
    </Flex>
  );
}
