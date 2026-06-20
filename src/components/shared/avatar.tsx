"use client";

import { Flex, Image } from "@chakra-ui/react";

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

/**
 * Circular student avatar. Renders `src` (the API's `avatarUrl`) as a photo
 * when present; otherwise falls back to coloured initials. `initials` lets the
 * caller pass the server-provided value instead of deriving it from `name`.
 */
export function Avatar({
  name,
  src,
  initials: initialsOverride,
  size = 32,
}: {
  name: string;
  src?: string | null;
  initials?: string;
  size?: number;
}) {
  const color = colorFor(name);
  const label = initialsOverride || initials(name);

  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        w={`${size}px`}
        h={`${size}px`}
        rounded="full"
        objectFit="cover"
        flexShrink={0}
      />
    );
  }

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
      {label}
    </Flex>
  );
}
