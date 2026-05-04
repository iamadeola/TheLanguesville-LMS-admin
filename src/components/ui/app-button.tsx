"use client";

import { Button, type ButtonProps } from "@chakra-ui/react";
import { forwardRef } from "react";

export interface AppButtonProps extends ButtonProps {
  isLoading?: boolean;
}

/**
 * Primary app button used across onboarding screens.
 * Wraps Chakra's Button with consistent styling + loading/disabled handling.
 */
export const AppButton = forwardRef<HTMLButtonElement, AppButtonProps>(
  function AppButton({ isLoading, disabled, children, ...rest }, ref) {
    return (
      <Button
        ref={ref}
        bg="#2E2F6F"
        color="white"
        rounded="full"
        h="48px"
        fontWeight="medium"
        w="full"
        _hover={{ bg: "#262760" }}
        _active={{ bg: "#1f204f" }}
        _disabled={{
          bg: "#E5E7EB",
          color: "#9CA3AF",
          cursor: "not-allowed",
          _hover: { bg: "#E5E7EB" },
        }}
        loading={isLoading}
        disabled={disabled}
        {...rest}
      >
        {children}
      </Button>
    );
  },
);
