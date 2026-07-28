"use client";

import {
  Box,
  Button,
  Flex,
  Grid,
  HStack,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Eye, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/shared/confirm-modal";
import { getApiErrorMessage } from "@/lib/api/client";
import { type RoleListItem, deleteRole, listRoles } from "@/lib/api/settings";
import { formatDateShort } from "@/lib/format";
import { settingsPaths } from "@/lib/routes";
import { AdminAvatarStack } from "./admin-avatar-stack";

const COLS = "1.2fr 1.6fr 1.1fr 0.7fr";

function RowSkeleton() {
  return (
    <Grid
      templateColumns={COLS}
      gap={4}
      px={5}
      py={5}
      alignItems="center"
      borderTopWidth="1px"
      borderColor="gray.100"
    >
      <Skeleton h="14px" w="55%" rounded="md" />
      <HStack gap={2}>
        <Skeleton w="30px" h="30px" rounded="full" />
        <Skeleton h="14px" w="45%" rounded="md" />
      </HStack>
      <Skeleton h="14px" w="60%" rounded="md" />
      <Skeleton h="18px" w="52px" rounded="md" />
    </Grid>
  );
}

export function RolesTab() {
  const router = useRouter();
  const [roles, setRoles] = useState<RoleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<RoleListItem | null>(null);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    const result = await listRoles();
    if (result.success) {
      setRoles(result.data.roles);
    } else {
      toast.error(getApiErrorMessage(result, "Couldn't load roles"));
      setRoles([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Deferred a tick so the fetch's setState lands outside the effect body —
    // same pattern as the other list screens.
    const id = setTimeout(fetchRoles, 0);
    return () => clearTimeout(id);
  }, [fetchRoles]);

  const doDelete = async (role: RoleListItem) => {
    const result = await deleteRole(role.id);
    if (result.success) {
      setConfirmDelete(null);
      toast.success("Role deleted");
      fetchRoles();
    } else {
      // The API refuses when admins are still assigned and says how many —
      // surface that verbatim, it tells the user exactly what to do next.
      toast.error(getApiErrorMessage(result, "Couldn't delete this role"));
    }
  };

  return (
    <Box>
      <Flex justify="space-between" align="flex-start" gap={4} mb={7} wrap="wrap">
        <Stack gap={2}>
          <Text fontSize="2xl" fontWeight="bold" color="gray.900">
            Roles &amp; Permissions
          </Text>
          <Text fontSize="sm" color="gray.500">
            Manage roles and permissions
          </Text>
        </Stack>
        <Button
          bg="#2E2F6F"
          color="white"
          rounded="full"
          h="48px"
          px={6}
          fontWeight="medium"
          _hover={{ bg: "#262760" }}
          onClick={() => router.push(settingsPaths.newRole)}
        >
          <Plus size={18} />
          New role
        </Button>
      </Flex>

      <Box bg="white" rounded="xl" borderWidth="1px" borderColor="gray.200">
        <Grid
          templateColumns={COLS}
          gap={4}
          px={5}
          py={3.5}
          bg="#F6F7F9"
          roundedTop="xl"
        >
          {["Role", "Active Admins", "Last Updated", "Actions"].map((h) => (
            <Text key={h} fontSize="sm" color="#667085">
              {h}
            </Text>
          ))}
        </Grid>

        {loading ? (
          [...Array(4)].map((_, i) => <RowSkeleton key={i} />)
        ) : roles.length === 0 ? (
          <Flex
            direction="column"
            align="center"
            justify="center"
            py="80px"
            gap={2}
            color="gray.400"
          >
            <ShieldCheck size={32} />
            <Text fontSize="sm" fontWeight="medium" color="gray.600">
              No roles yet
            </Text>
            <Text fontSize="sm">Create a role to start assigning permissions</Text>
          </Flex>
        ) : (
          roles.map((role) => (
            <Grid
              key={role.id}
              templateColumns={COLS}
              gap={4}
              px={5}
              py={4}
              alignItems="center"
              borderTopWidth="1px"
              borderColor="gray.100"
            >
              <Text
                as="button"
                fontSize="sm"
                color="gray.900"
                textAlign="left"
                w="fit-content"
                cursor="pointer"
                _hover={{ color: "#2E2F6F", textDecoration: "underline" }}
                onClick={() => router.push(settingsPaths.roleDetail(role.id))}
              >
                {role.name}
              </Text>

              <AdminAvatarStack
                admins={role.activeAdmins}
                total={role.activeAdminsCount}
              />

              <Text fontSize="sm" color="gray.700">
                {formatDateShort(role.lastUpdated)}
              </Text>

              <HStack gap={4}>
                <Box
                  as="button"
                  onClick={() => router.push(settingsPaths.roleDetail(role.id))}
                  color="gray.800"
                  cursor="pointer"
                  _hover={{ color: "#2E2F6F" }}
                  display="flex"
                  aria-label={`View ${role.name}`}
                >
                  <Eye size={19} />
                </Box>
                {/* Built-in roles can't be deleted — the API rejects it too. */}
                {role.isSystem ? null : (
                  <Box
                    as="button"
                    onClick={() => setConfirmDelete(role)}
                    color="#DC2626"
                    cursor="pointer"
                    _hover={{ color: "#B91C1C" }}
                    display="flex"
                    aria-label={`Delete ${role.name}`}
                  >
                    <Trash2 size={19} />
                  </Box>
                )}
              </HStack>
            </Grid>
          ))
        )}
      </Box>

      {confirmDelete ? (
        <ConfirmModal
          tone="danger"
          title="Delete role?"
          body={
            <>
              Are you sure you want to delete{" "}
              <Text as="span" fontWeight="semibold" color="gray.900">
                {confirmDelete.name}
              </Text>
              ? This action cannot be undone
            </>
          }
          confirmLabel="Delete role"
          onConfirm={() => doDelete(confirmDelete)}
          onClose={() => setConfirmDelete(null)}
        />
      ) : null}
    </Box>
  );
}
