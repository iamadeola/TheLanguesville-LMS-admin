"use client";

import { Box, Input, Stack, Text, Textarea } from "@chakra-ui/react";
import type { ReactNode } from "react";

export function StepHeading({ title, subtitle, optional }: { title: string; subtitle: string; optional?: boolean }) {
  return (
    <Stack gap={1} mb={6}>
      <Text fontSize="xl" fontWeight="bold" color="gray.900">
        {title}
        {optional ? (
          <Box as="span" ml={2} fontSize="xs" fontWeight="medium" color="#4338CA" bg="#EEF0FB" px={2} py={1} rounded="full" verticalAlign="middle">
            optional
          </Box>
        ) : null}
      </Text>
      <Text fontSize="sm" color="gray.500">
        {subtitle}
      </Text>
    </Stack>
  );
}

export function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <Box bg="white" borderWidth="1px" borderColor="gray.200" rounded="xl" p={6}>
      {title ? (
        <Text fontWeight="semibold" color="gray.900" mb={4}>
          {title}
        </Text>
      ) : null}
      {children}
    </Box>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <Text fontSize="sm" color="gray.700" mb={2}>
      {children}
    </Text>
  );
}

const inputStyles = {
  borderColor: "gray.200",
  rounded: "lg",
  fontSize: "sm",
  _placeholder: { color: "gray.400" },
  _focus: { borderColor: "#2E2F6F", outline: "none", boxShadow: "none" },
} as const;

export function TextField(props: React.ComponentProps<typeof Input>) {
  return <Input h="48px" {...inputStyles} {...props} />;
}

export function TextAreaField(props: React.ComponentProps<typeof Textarea>) {
  return <Textarea minH="120px" resize="none" {...inputStyles} {...props} />;
}
