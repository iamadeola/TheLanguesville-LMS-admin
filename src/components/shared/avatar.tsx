"use client";

import { Flex } from "@chakra-ui/react";

const AVATAR_COLORS = ["#F97461", "#6366F1", "#10B981", "#F59E0B", "#EC4899", "#3B82F6"];

export function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Deterministic colour from a name so a student keeps the same avatar tint. */
function colorFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const color = colorFor(name);
  return (
    <Flex
      w={`${size}px`}
      h={`${size}px`}
      rounded="full"
      bg={`${color}22`}
      color={color}
      align="center"
      justify="center"
      fontSize={size >= 48 ? "md" : "xs"}
      fontWeight="semibold"
      flexShrink={0}
    >
      {initials(name)}
    </Flex>
  );
}
