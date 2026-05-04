"use client";

import { Box, HStack, Heading, Stack, Text } from "@chakra-ui/react";
import { ArrowDown, ArrowUp } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  changePercent: number;
}

export function StatCard({ label, value, changePercent }: StatCardProps) {
  const isUp = changePercent >= 0;
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
        <HStack gap={1}>
          <Icon size={14} color={color} />
          <Text fontSize="xs" color={color} fontWeight="medium">
            {Math.abs(changePercent)}%
          </Text>
        </HStack>
      </Stack>
    </Box>
  );
}
