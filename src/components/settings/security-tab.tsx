"use client";

import { Box, Button, Flex, Input, Stack, Text } from "@chakra-ui/react";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api/client";
import { changePassword } from "@/lib/api/settings";

function PasswordInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <Box position="relative">
      <Input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        h="48px"
        pr="44px"
        fontSize="sm"
        borderColor="gray.200"
        rounded="lg"
        _placeholder={{ color: "gray.400" }}
        _focus={{ borderColor: "#2E2F6F", outline: "none", boxShadow: "none" }}
      />
      <Box
        as="button"
        onClick={() => setShow((s) => !s)}
        position="absolute"
        top="50%"
        right="14px"
        transform="translateY(-50%)"
        color="gray.400"
        cursor="pointer"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </Box>
    </Box>
  );
}

export function SecurityTab() {
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [saving, setSaving] = useState(false);

  const valid =
    oldPw.length > 0 && newPw.length >= 8 && newPw === confirmPw;

  const handleSave = async () => {
    if (!valid || saving) return;
    setSaving(true);
    const result = await changePassword({
      oldPassword: oldPw,
      newPassword: newPw,
      confirmPassword: confirmPw,
    });
    if (result.success) {
      setOldPw("");
      setNewPw("");
      setConfirmPw("");
      toast.success(result.data.message || "Password changed successfully");
    } else {
      toast.error(getApiErrorMessage(result, "Couldn't change password"));
    }
    setSaving(false);
  };

  return (
    <Flex gap={16} align="flex-start" wrap="wrap">
      <Stack gap={2} flex="1" minW="260px" maxW="380px">
        <Text fontSize="2xl" fontWeight="bold" color="gray.900">
          Security
        </Text>
        <Text fontSize="sm" color="gray.500">
          Manage your account security, password, and login settings.
        </Text>
      </Stack>

      <Stack gap={5} flex="1.4" minW="380px">
        <Stack gap={2}>
          <Text fontSize="sm" color="gray.700">
            Old password
          </Text>
          <PasswordInput value={oldPw} onChange={setOldPw} placeholder="Enter old password" />
        </Stack>

        <Stack gap={1.5}>
          <Text fontSize="sm" color="gray.700">
            New Password
          </Text>
          <PasswordInput value={newPw} onChange={setNewPw} placeholder="Enter new password" />
          <Text fontSize="xs" color={newPw.length > 0 && newPw.length < 8 ? "#EF4444" : "gray.400"}>
            Must at least be 8 characters
          </Text>
        </Stack>

        <Stack gap={2}>
          <Text fontSize="sm" color="gray.700">
            Confirm password
          </Text>
          <PasswordInput value={confirmPw} onChange={setConfirmPw} placeholder="Re-enter password" />
        </Stack>

        <Button
          rounded="full"
          h="52px"
          fontWeight="medium"
          bg={valid ? "#2E2F6F" : "#E5E7EB"}
          color={valid ? "white" : "#9CA3AF"}
          _hover={valid ? { bg: "#262760" } : { bg: "#E5E7EB" }}
          cursor={valid ? "pointer" : "not-allowed"}
          disabled={!valid || saving}
          loading={saving}
          onClick={handleSave}
        >
          Save changes
        </Button>
      </Stack>
    </Flex>
  );
}
