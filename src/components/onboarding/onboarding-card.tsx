"use client";

import { Box, Flex, type BoxProps } from "@chakra-ui/react";
import type { ReactNode } from "react";

interface OnboardingCardProps extends BoxProps {
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Centered white card used as the layout for every onboarding screen.
 * Optionally renders a footer (used on the invite screen for the expiry note).
 */
export function OnboardingCard({
  children,
  footer,
  ...rest
}: OnboardingCardProps) {
  return (
    <Flex
      minH="100dvh"
      w="full"
      align="center"
      justify="center"
      px={4}
      py={10}
      bg="#2E2F6F"
    >
      <Box
        w="full"
        maxW="460px"
        bg="white"
        rounded="xl"
        shadow="xl"
        overflow="hidden"
        color="gray.900"
        {...rest}
      >
        <Box px={{ base: 6, md: 10 }} py={{ base: 8, md: 10 }}>
          {children}
        </Box>
        {footer ? (
          <Box bg="gray.50" px={{ base: 6, md: 10 }} py={4} textAlign="center">
            {footer}
          </Box>
        ) : null}
      </Box>
    </Flex>
  );
}
