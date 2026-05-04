"use client";

import { Button, HStack } from "@chakra-ui/react";

export interface SegmentedTab {
  value: string;
  label: string;
}

interface SegmentedTabsProps {
  tabs: SegmentedTab[];
  value: string;
  onChange: (value: string) => void;
}

/**
 * Pill-style segmented tabs (e.g. "12 months / 30 days / 7 days").
 */
export function SegmentedTabs({ tabs, value, onChange }: SegmentedTabsProps) {
  return (
    <HStack
      gap={0}
      borderWidth="1px"
      borderColor="gray.200"
      rounded="md"
      bg="white"
      p={1}
      display="inline-flex"
    >
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <Button
            key={tab.value}
            type="button"
            variant="plain"
            onClick={() => onChange(tab.value)}
            px={4}
            h="32px"
            fontSize="sm"
            rounded="sm"
            fontWeight="medium"
            color={active ? "gray.900" : "gray.500"}
            bg={active ? "gray.100" : "transparent"}
          >
            {tab.label}
          </Button>
        );
      })}
    </HStack>
  );
}
