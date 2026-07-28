"use client";

import { Box, HStack, Heading, Stack, Text } from "@chakra-ui/react";
import { ArrowDown, ArrowUp, Info } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  /**
   * null means there is no honest period-over-period figure — a zero baseline,
   * or a current-state metric the backend never snapshots. Render nothing
   * rather than implying a flat 0%.
   */
  changePercent: number | null;
  /** Shown as helper text when the metric isn't recorded at all. */
  unavailableReason?: string;
}

export function StatCard({
  label,
  value,
  changePercent,
  unavailableReason,
}: StatCardProps) {
  const isUp = changePercent !== null && changePercent >= 0;
  const color = isUp ? "#16A34A" : "#EF4444";
  const Icon = isUp ? ArrowUp : ArrowDown;

  return (
    <Box
      bg="white"
      rounded="lg"
      borderWidth="1px"
      borderColor="gray.200"
      p={5}
      flex="1"
      minW="0"
    >
      <Stack gap={3}>
        <Text fontSize="sm" color="gray.700" fontWeight="medium">
          {label}
        </Text>
        <Heading as="p" size="2xl" color="gray.900" fontWeight="semibold">
          {value}
        </Heading>

        {changePercent !== null ? (
          <HStack gap={1}>
            <Icon size={14} color={color} />
            <Text fontSize="xs" color={color} fontWeight="medium">
              {Math.abs(changePercent)}%
            </Text>
          </HStack>
        ) : unavailableReason ? (
          <HStack gap={1.5} align="flex-start" title={unavailableReason}>
            <Box color="gray.400" mt="1px" flexShrink={0}>
              <Info size={13} />
            </Box>
            <Text fontSize="xs" color="gray.400" lineClamp={2}>
              Not measured yet
            </Text>
          </HStack>
        ) : (
          // Keep the row's height so cards in a grid stay aligned.
          <Box h="18px" />
        )}
      </Stack>
    </Box>
  );
}
