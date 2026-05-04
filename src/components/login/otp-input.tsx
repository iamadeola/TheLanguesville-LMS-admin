"use client";

import { HStack, Input } from "@chakra-ui/react";
import { type ClipboardEvent, type KeyboardEvent, useRef } from "react";

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  autoFocus?: boolean;
  disabled?: boolean;
}

/**
 * 6-digit (configurable) OTP/2FA input. Each cell is a single-character
 * password input, masking the value as a dot. Supports auto-advance,
 * backspace navigation and pasting a full code.
 */
export function OtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  autoFocus = true,
  disabled,
}: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const setDigit = (index: number, digit: string) => {
    const chars = Array.from({ length }, (_, i) =>
      i === index ? digit : (value[i] ?? ""),
    );
    const filled = chars.join("");
    onChange(filled);
    const allFilled = chars.every((c) => c.length === 1);
    if (allFilled) {
      onComplete?.(filled);
    }
  };

  const focusAt = (index: number) => {
    const el = inputsRef.current[index];
    if (el) {
      el.focus();
      el.select();
    }
  };

  const handleChange = (index: number, raw: string) => {
    // Only keep the last typed digit
    const digit = raw.replace(/\D/g, "").slice(-1);
    setDigit(index, digit);
    if (digit && index < length - 1) {
      focusAt(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!value[index] && index > 0) {
        e.preventDefault();
        setDigit(index - 1, "");
        focusAt(index - 1);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusAt(index - 1);
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      focusAt(index + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    e.preventDefault();
    const next = pasted.slice(0, length).padEnd(length, "").slice(0, length);
    onChange(next);
    const lastFilled = Math.min(pasted.length, length) - 1;
    focusAt(Math.max(0, lastFilled));
    if (pasted.length >= length) onComplete?.(next);
  };

  return (
    <HStack gap={2} justify="center">
      {Array.from({ length }).map((_, index) => (
        <Input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type="password"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={value[index] ?? ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          autoFocus={autoFocus && index === 0}
          disabled={disabled}
          textAlign="center"
          fontSize="lg"
          fontWeight="bold"
          w="48px"
          h="48px"
          p={0}
          borderColor="gray.200"
          rounded="md"
          _focusVisible={{
            borderColor: "#2E2F6F",
            boxShadow: "0 0 0 1px #2E2F6F",
          }}
        />
      ))}
    </HStack>
  );
}
