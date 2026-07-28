"use client";

import { Box, Flex, HStack, Text } from "@chakra-ui/react";
import { Avatar } from "@/components/shared/avatar";
import type { RoleAdminSummary } from "@/lib/api/settings";

/**
 * The roles table's "Active Admins" cell: overlapping avatars, a "+N" chip for
 * the ones the API capped off, and a "—" placeholder when the role has none.
 * A single admin is named inline, which is how the design shows "(You) John Doe".
 */
export function AdminAvatarStack({
  admins,
  total,
  size = 30,
}: {
  admins: RoleAdminSummary[];
  total: number;
  size?: number;
}) {
  if (total === 0 || admins.length === 0) {
    return (
      <Flex
        w={`${size}px`}
        h={`${size}px`}
        rounded="full"
        bg="gray.100"
        align="center"
        justify="center"
        color="gray.400"
        fontSize="sm"
      >
        -
      </Flex>
    );
  }

  const overflow = total - admins.length;
  const single = total === 1 ? admins[0] : null;

  return (
    <HStack gap={single ? 2.5 : 0} minW={0}>
      <Flex align="center">
        {admins.map((admin, i) => (
          <Box
            key={admin.id}
            ml={i === 0 ? 0 : `-${Math.round(size * 0.3)}px`}
            borderWidth="2px"
            borderColor="white"
            rounded="full"
            title={admin.name}
          >
            <Avatar
              name={admin.name}
              src={admin.avatarUrl}
              initials={admin.initials}
              size={size}
            />
          </Box>
        ))}
        {overflow > 0 ? (
          <Flex
            ml={`-${Math.round(size * 0.3)}px`}
            w={`${size}px`}
            h={`${size}px`}
            rounded="full"
            bg="gray.100"
            borderWidth="2px"
            borderColor="white"
            align="center"
            justify="center"
            fontSize="xs"
            fontWeight="semibold"
            color="gray.600"
            flexShrink={0}
          >
            +{overflow}
          </Flex>
        ) : null}
      </Flex>

      {single ? (
        <Text fontSize="sm" color="gray.700" truncate>
          {single.isYou ? (
            <>
              <Text as="span" fontWeight="semibold" color="gray.900">
                (You)
              </Text>{" "}
            </>
          ) : null}
          {single.name}
        </Text>
      ) : null}
    </HStack>
  );
}
