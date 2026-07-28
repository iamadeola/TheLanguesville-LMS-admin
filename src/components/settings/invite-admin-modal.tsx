"use client";

import {
  Box,
  Button,
  Flex,
  Grid,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Check, ChevronDown, ChevronUp, CircleCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { InviteOverlay } from "@/components/invitations/invite-shell";
import { getApiErrorMessage } from "@/lib/api/client";
import {
  type RoleListItem,
  inviteAdminAccount,
  listRoles,
} from "@/lib/api/settings";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text fontSize="sm" color="gray.700" mb={2}>
      {children}
    </Text>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <Input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      h="48px"
      fontSize="sm"
      borderColor="gray.200"
      rounded="lg"
      _placeholder={{ color: "gray.400" }}
      _focus={{ borderColor: "#2E2F6F", outline: "none", boxShadow: "none" }}
    />
  );
}

/** "Invitation sent successfully" — the design's confirmation step. */
function InviteSentModal({ onDone }: { onDone: () => void }) {
  return (
    <InviteOverlay onClose={onDone} maxW="420px">
      <Stack gap={5} align="center" textAlign="center" pt={2}>
        <Flex
          w="56px"
          h="56px"
          rounded="full"
          bg="#DCFCE7"
          align="center"
          justify="center"
          color="#16A34A"
        >
          <CircleCheck size={28} />
        </Flex>
        <Stack gap={2}>
          <Text fontSize="lg" fontWeight="semibold" color="gray.900">
            Invitation sent successfully
          </Text>
          <Text fontSize="sm" color="gray.500">
            An invitation email with a secure password setup link should be sent
            to the provided email, and when clicked, the invited admin should
            complete their setup password.
          </Text>
        </Stack>
        <Button
          bg="#2E2F6F"
          color="white"
          rounded="full"
          h="48px"
          w="full"
          fontWeight="medium"
          _hover={{ bg: "#262760" }}
          onClick={onDone}
        >
          Done
        </Button>
      </Stack>
    </InviteOverlay>
  );
}

/**
 * "Invite New Admin". The role dropdown is fed by `GET /settings/roles`; the
 * chosen role rides on the invite and is applied when the account is created,
 * so the invitee lands with the right permissions on first login.
 */
export function InviteAdminModal({
  onClose,
  onSent,
}: {
  onClose: () => void;
  /** Called after a successful invite so the caller can refresh its list. */
  onSent: () => void;
}) {
  const [roles, setRoles] = useState<RoleListItem[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [roleOpen, setRoleOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    listRoles().then((result) => {
      if (result.success) {
        setRoles(result.data.roles);
      } else {
        toast.error(getApiErrorMessage(result, "Couldn't load roles"));
      }
    });
  }, []);

  const valid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    EMAIL_RE.test(email.trim()) &&
    roleId.length > 0;

  const submit = async () => {
    if (!valid || sending) return;
    setSending(true);
    const result = await inviteAdminAccount({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      roleId,
    });
    if (result.success) {
      setSent(true);
      onSent();
    } else {
      toast.error(getApiErrorMessage(result, "Couldn't send this invitation"));
    }
    setSending(false);
  };

  if (sent) {
    return <InviteSentModal onDone={onClose} />;
  }

  const selectedRole = roles.find((role) => role.id === roleId);

  return (
    <InviteOverlay onClose={sending ? undefined : onClose} maxW="460px">
      <Stack gap={5}>
        <Stack gap={1}>
          <Text fontSize="xl" fontWeight="bold" color="gray.900">
            Invite New Admin
          </Text>
          <Text fontSize="sm" color="gray.500">
            Add a new admin profile.
          </Text>
        </Stack>

        <Grid templateColumns="1fr 1fr" gap={4}>
          <Box>
            <FieldLabel>First Name</FieldLabel>
            <TextInput
              value={firstName}
              onChange={setFirstName}
              placeholder="Enter first name"
            />
          </Box>
          <Box>
            <FieldLabel>Last Name</FieldLabel>
            <TextInput
              value={lastName}
              onChange={setLastName}
              placeholder="Enter last name"
            />
          </Box>
        </Grid>

        <Box>
          <FieldLabel>Email Address</FieldLabel>
          <TextInput
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="Enter email address"
          />
        </Box>

        <Box>
          <FieldLabel>Role</FieldLabel>
          <Box position="relative">
            <Flex
              as="button"
              onClick={() => setRoleOpen((open) => !open)}
              w="full"
              h="48px"
              px={4}
              align="center"
              justify="space-between"
              borderWidth="1px"
              borderColor="gray.200"
              rounded="lg"
              bg="white"
              cursor="pointer"
            >
              <Text
                fontSize="sm"
                color={selectedRole ? "gray.900" : "gray.400"}
              >
                {selectedRole?.name ?? "Select role"}
              </Text>
              {roleOpen ? (
                <ChevronUp size={18} color="#9CA3AF" />
              ) : (
                <ChevronDown size={18} color="#9CA3AF" />
              )}
            </Flex>

            {roleOpen ? (
              <Box
                position="absolute"
                top="52px"
                left={0}
                w="full"
                maxH="220px"
                overflowY="auto"
                bg="white"
                borderWidth="1px"
                borderColor="gray.200"
                rounded="lg"
                boxShadow="lg"
                zIndex={20}
              >
                {roles.length === 0 ? (
                  <Text fontSize="sm" color="gray.500" px={4} py={3}>
                    No roles available
                  </Text>
                ) : (
                  roles.map((role) => {
                    const active = role.id === roleId;
                    return (
                      <Flex
                        key={role.id}
                        as="button"
                        w="full"
                        px={4}
                        py={2.5}
                        align="center"
                        justify="space-between"
                        cursor="pointer"
                        bg={active ? "gray.50" : "white"}
                        _hover={{ bg: "gray.50" }}
                        onClick={() => {
                          setRoleId(role.id);
                          setRoleOpen(false);
                        }}
                      >
                        <Text fontSize="sm" color="gray.800">
                          {role.name}
                        </Text>
                        {active ? <Check size={15} color="#6366F1" /> : null}
                      </Flex>
                    );
                  })
                )}
              </Box>
            ) : null}
          </Box>
        </Box>

        <Stack gap={3} mt={1}>
          <Button
            rounded="full"
            h="48px"
            fontWeight="medium"
            bg={valid ? "#2E2F6F" : "#E5E7EB"}
            color={valid ? "white" : "#9CA3AF"}
            _hover={valid ? { bg: "#262760" } : { bg: "#E5E7EB" }}
            cursor={valid ? "pointer" : "not-allowed"}
            loading={sending}
            disabled={!valid || sending}
            onClick={submit}
          >
            Invite admin
          </Button>
          <Button
            variant="outline"
            rounded="full"
            h="48px"
            fontWeight="medium"
            disabled={sending}
            onClick={onClose}
          >
            Cancel
          </Button>
        </Stack>
      </Stack>
    </InviteOverlay>
  );
}
