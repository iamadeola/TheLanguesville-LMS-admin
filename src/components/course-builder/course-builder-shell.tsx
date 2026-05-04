"use client";

import {
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  IconButton,
  Text,
} from "@chakra-ui/react";
import { CheckCircle2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { StepRail } from "./step-rail";

interface CourseBuilderShellProps {
  children: ReactNode;
  // Footer config
  primaryLabel?: string;
  primaryDisabled?: boolean;
  onPrimary?: () => void;
  onPrevious?: () => void;
  hidePrevious?: boolean;
}

export function CourseBuilderShell({
  children,
  primaryLabel = "Proceed",
  primaryDisabled = false,
  onPrimary,
  onPrevious,
  hidePrevious = false,
}: CourseBuilderShellProps) {
  const router = useRouter();

  return (
    <Box
      position="fixed"
      inset={0}
      bg="white"
      zIndex={50}
      display="flex"
      flexDirection="column"
    >
      {/* Top header */}
      <Flex
        h="64px"
        align="center"
        justify="space-between"
        px={6}
        borderBottomWidth="1px"
        borderColor="gray.200"
        flexShrink={0}
      >
        <HStack gap={4}>
          <HStack gap={2}>
            <Box
              w="32px"
              h="32px"
              rounded="md"
              bg="#E8E9F5"
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="#2E2F6F"
              fontWeight="bold"
            >
              L
            </Box>
            <Text fontSize="xs" color="gray.500" lineHeight="1">
              The
              <br />
              Languesville
            </Text>
          </HStack>
          <Box w="1px" h="24px" bg="gray.200" />
          <Heading as="h1" size="md" color="gray.900">
            New Course
          </Heading>
        </HStack>

        <IconButton
          aria-label="Close course builder"
          variant="outline"
          rounded="full"
          size="sm"
          onClick={() => router.push("/courses")}
        >
          <X size={16} />
        </IconButton>
      </Flex>

      {/* Body: rail + content */}
      <Flex flex="1" overflow="hidden">
        <Box
          w="280px"
          borderRightWidth="1px"
          borderColor="gray.200"
          px={6}
          py={6}
          flexShrink={0}
          overflowY="auto"
        >
          <StepRail />
        </Box>

        <Box flex="1" overflowY="auto" px={8} py={6}>
          <Box maxW="640px" mx="auto">
            {children}
          </Box>
        </Box>
      </Flex>

      {/* Footer */}
      <Flex
        h="64px"
        align="center"
        justify="space-between"
        px={6}
        borderTopWidth="1px"
        borderColor="gray.200"
        flexShrink={0}
        bg="white"
      >
        <HStack gap={2} color="#16A34A">
          <CheckCircle2 size={16} />
          <Text fontSize="sm">Auto-saved</Text>
        </HStack>

        <HStack gap={3}>
          {!hidePrevious ? (
            <Button
              variant="outline"
              rounded="full"
              h="40px"
              px={6}
              fontWeight="medium"
              fontSize="sm"
              onClick={onPrevious}
              disabled={!onPrevious}
            >
              Previous
            </Button>
          ) : null}
          <Button
            bg="#2E2F6F"
            color="white"
            rounded="full"
            h="40px"
            px={6}
            fontWeight="medium"
            fontSize="sm"
            _hover={{ bg: "#262760" }}
            _disabled={{
              bg: "#E5E7EB",
              color: "#9CA3AF",
              cursor: "not-allowed",
              _hover: { bg: "#E5E7EB" },
            }}
            disabled={primaryDisabled}
            onClick={onPrimary}
          >
            {primaryLabel}
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
}
