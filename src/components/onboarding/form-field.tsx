"use client";

import { Box, Input, type InputProps, Text } from "@chakra-ui/react";
import { forwardRef, type ReactNode } from "react";

interface FormFieldProps extends Omit<InputProps, "size"> {
  label: string;
  helperText?: string;
  error?: string;
  rightElement?: ReactNode;
}

/**
 * Labeled input field. Supports an optional right-side adornment
 * (used for the password visibility toggle).
 */
export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  function FormField(
    { label, helperText, error, rightElement, ...inputProps },
    ref,
  ) {
    const hasError = Boolean(error);
    const borderColor = hasError ? "#DC2626" : "gray.200";
    const focusColor = hasError ? "#DC2626" : "#2E2F6F";
    return (
      <Box w="full">
        <Text
          as="label"
          display="block"
          mb={1.5}
          fontSize="sm"
          color="gray.800"
          fontWeight="medium"
        >
          {label}
        </Text>
        <Box position="relative">
          <Input
            ref={ref}
            variant="outline"
            h="44px"
            borderColor={borderColor}
            rounded="md"
            fontSize="sm"
            pr={rightElement ? "44px" : undefined}
            aria-invalid={hasError}
            _focusVisible={{
              borderColor: focusColor,
              boxShadow: `0 0 0 1px ${focusColor}`,
            }}
            {...inputProps}
          />
          {rightElement ? (
            <Box
              position="absolute"
              right="8px"
              top="50%"
              transform="translateY(-50%)"
              zIndex={2}
            >
              {rightElement}
            </Box>
          ) : null}
        </Box>
        {hasError ? (
          <Text mt={1.5} fontSize="xs" color="#DC2626">
            {error}
          </Text>
        ) : helperText ? (
          <Text mt={1.5} fontSize="xs" color="gray.500">
            {helperText}
          </Text>
        ) : null}
      </Box>
    );
  },
);
