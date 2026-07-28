"use client";

import { Box, Flex, Grid, HStack, Skeleton, Stack, Text } from "@chakra-ui/react";
import { Check } from "lucide-react";
import type { Permission, PermissionGroup } from "@/lib/api/settings";

const CHECKED_GREEN = "#00AE50";

/** Small square checkbox — filled green with a white tick when checked. */
function PermissionBox({
  checked,
  disabled,
}: {
  checked: boolean;
  disabled?: boolean;
}) {
  return (
    <Flex
      w="18px"
      h="18px"
      rounded="4px"
      flexShrink={0}
      align="center"
      justify="center"
      bg={checked ? CHECKED_GREEN : "white"}
      borderWidth={checked ? "0" : "1px"}
      borderColor="#D1D1DB"
      color="white"
      opacity={disabled ? 0.55 : 1}
    >
      {checked ? <Check size={13} strokeWidth={3} /> : null}
    </Flex>
  );
}

/** "Permissions [6]" heading with the live count of ticked boxes. */
export function PermissionCountHeading({
  count,
  subtitle = "Add permissions to this admin.",
}: {
  count: number;
  subtitle?: string;
}) {
  return (
    <Stack gap={1}>
      <HStack gap={2.5}>
        <Text fontSize="xl" fontWeight="bold" color="gray.900">
          Permissions
        </Text>
        <Flex
          minW="22px"
          h="22px"
          px={1.5}
          rounded="6px"
          bg="#E36A5C"
          color="white"
          fontSize="xs"
          fontWeight="semibold"
          align="center"
          justify="center"
        >
          {count}
        </Flex>
      </HStack>
      <Text fontSize="sm" color="gray.500">
        {subtitle}
      </Text>
    </Stack>
  );
}

export function PermissionChecklistSkeleton() {
  return (
    <Stack gap={9}>
      {[4, 3, 3, 2, 2].map((rows, i) => (
        <Grid key={i} templateColumns="minmax(180px, 300px) 1fr" gap={8}>
          <HStack gap={4} align="center" h="24px">
            <Skeleton h="14px" w="90px" rounded="md" />
            <Box flex="1" h="1px" bg="gray.200" />
          </HStack>
          <Stack gap={2.5}>
            {[...Array(rows)].map((_, r) => (
              <Skeleton key={r} h="18px" w="180px" rounded="md" />
            ))}
          </Stack>
        </Grid>
      ))}
    </Stack>
  );
}

interface PermissionChecklistProps {
  groups: PermissionGroup[];
  /** The currently ticked keys. */
  selected: Set<Permission>;
  /** Omit to render a read-only list (e.g. the Super Admin role). */
  onToggle?: (permission: Permission) => void;
  disabled?: boolean;
}

/**
 * The grouped checkbox list shared by "Add new role" and the role detail page.
 * Groups and labels come from `GET /settings/permissions` so they're never
 * hardcoded here — the API is the single source of truth for the catalog.
 */
export function PermissionChecklist({
  groups,
  selected,
  onToggle,
  disabled,
}: PermissionChecklistProps) {
  const interactive = Boolean(onToggle) && !disabled;

  return (
    <Stack gap={9}>
      {groups.map((group) => (
        <Grid
          key={group.key}
          templateColumns="minmax(180px, 300px) 1fr"
          gap={8}
          alignItems="start"
        >
          <HStack gap={4} align="center" h="24px">
            <Text fontSize="sm" fontWeight="medium" color="gray.900" flexShrink={0}>
              {group.label}
            </Text>
            <Box flex="1" h="1px" bg="gray.200" />
          </HStack>

          <Stack gap={2.5}>
            {group.permissions.map((permission) => {
              const checked = selected.has(permission.key);
              return (
                <HStack
                  key={permission.key}
                  as={interactive ? "button" : "div"}
                  onClick={
                    interactive ? () => onToggle?.(permission.key) : undefined
                  }
                  gap={3}
                  w="fit-content"
                  cursor={interactive ? "pointer" : "default"}
                  textAlign="left"
                  aria-pressed={interactive ? checked : undefined}
                >
                  <PermissionBox checked={checked} disabled={disabled} />
                  <Text fontSize="sm" color="gray.800">
                    {permission.label}
                  </Text>
                </HStack>
              );
            })}
          </Stack>
        </Grid>
      ))}
    </Stack>
  );
}
