"use client";

import {
  Box,
  Button,
  Flex,
  HStack,
  Image,
  Input,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Eye, EyeOff, Pencil, UserCircle2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api/client";
import {
  type SettingsProfile,
  changePassword,
  getProfile,
  updateProfile,
} from "@/lib/api/settings";
import { uploadFile } from "@/lib/api/uploads";
import { SettingsModal } from "./settings-modal";

/** Enforced client-side per the design's "under 10MB" copy. */
const MAX_AVATAR_BYTES = 10 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ["image/png", "image/jpeg", "image/gif"];

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
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <Input
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
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </Box>
    </Box>
  );
}

/** One row of the personal-information card. */
function InfoRow({
  label,
  value,
  onEdit,
  last,
}: {
  label: string;
  value: string;
  onEdit?: () => void;
  last?: boolean;
}) {
  return (
    <Flex
      justify="space-between"
      align="center"
      gap={4}
      py={4}
      borderBottomWidth={last ? "0" : "1px"}
      borderColor="gray.100"
    >
      <Text fontSize="sm" color="gray.500" flexShrink={0}>
        {label}
      </Text>
      <HStack gap={2} minW={0}>
        <Text fontSize="sm" color="gray.900" fontWeight="medium" truncate>
          {value || "—"}
        </Text>
        {onEdit ? (
          <Box
            as="button"
            onClick={onEdit}
            color="gray.400"
            cursor="pointer"
            display="flex"
            flexShrink={0}
            _hover={{ color: "#2E2F6F" }}
            aria-label={`Edit ${label}`}
          >
            <Pencil size={14} />
          </Box>
        ) : null}
      </HStack>
    </Flex>
  );
}

function SectionIntro({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <Stack gap={2} flex="1" minW="240px" maxW="380px">
      <Text fontSize="2xl" fontWeight="bold" color="gray.900">
        {title}
      </Text>
      <Text fontSize="sm" color="gray.500">
        {subtitle}
      </Text>
    </Stack>
  );
}

function ProfileSkeleton() {
  return (
    <Stack gap={6} flex="1.4" minW="360px" maxW="520px">
      <HStack gap={4}>
        <Skeleton w="56px" h="56px" rounded="full" />
        <Stack gap={2}>
          <Skeleton h="16px" w="140px" rounded="md" />
          <Skeleton h="14px" w="260px" rounded="md" />
        </Stack>
      </HStack>
      <Skeleton h="190px" rounded="xl" />
    </Stack>
  );
}

export function ProfileTab() {
  const [profile, setProfile] = useState<SettingsProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);

  const [editingName, setEditingName] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [nameDraft, setNameDraft] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
  });

  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    getProfile().then((result) => {
      if (result.success) {
        setProfile(result.data);
      } else {
        toast.error(getApiErrorMessage(result, "Couldn't load your profile"));
      }
      setLoading(false);
    });
  }, []);

  const openNameModal = () => {
    if (!profile) return;
    setNameDraft({
      firstName: profile.firstName ?? "",
      middleName: profile.middleName ?? "",
      lastName: profile.lastName ?? "",
    });
    setEditingName(true);
  };

  const saveName = async () => {
    if (savingName) return;
    if (!nameDraft.firstName.trim() || !nameDraft.lastName.trim()) {
      toast.error("First and last name are required");
      return;
    }
    setSavingName(true);
    const result = await updateProfile({
      firstName: nameDraft.firstName.trim(),
      middleName: nameDraft.middleName.trim(),
      lastName: nameDraft.lastName.trim(),
    });
    if (result.success) {
      setProfile(result.data);
      setEditingName(false);
      toast.success(result.message || "Profile updated successfully");
    } else {
      toast.error(getApiErrorMessage(result, "Couldn't update your name"));
    }
    setSavingName(false);
  };

  const handleAvatar = async (file: File | undefined) => {
    if (!file) return;
    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      toast.error("Only PNGs, JPEGs and GIFs are allowed");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error("Image must be under 10MB");
      return;
    }

    setUploadingAvatar(true);
    // Two steps by design: store the bytes, then point the profile at the URL.
    const upload = await uploadFile(file);
    if (!upload.success) {
      toast.error(getApiErrorMessage(upload, "Couldn't upload photo"));
      setUploadingAvatar(false);
      return;
    }
    const result = await updateProfile({ avatarUrl: upload.data.url });
    if (result.success) {
      setProfile(result.data);
      toast.success("Profile picture updated");
    } else {
      toast.error(getApiErrorMessage(result, "Couldn't save your photo"));
    }
    setUploadingAvatar(false);
  };

  const passwordValid =
    oldPw.length > 0 && newPw.length >= 8 && newPw === confirmPw;

  const savePassword = async () => {
    if (!passwordValid || savingPw) return;
    setSavingPw(true);
    const result = await changePassword({
      oldPassword: oldPw,
      newPassword: newPw,
      confirmPassword: confirmPw,
    });
    if (result.success) {
      setOldPw("");
      setNewPw("");
      setConfirmPw("");
      toast.success(result.message || "Password changed successfully");
    } else {
      toast.error(getApiErrorMessage(result, "Couldn't change password"));
    }
    setSavingPw(false);
  };

  return (
    <Stack gap={16}>
      {/* ---------------- Personal information ---------------- */}
      <Flex gap={16} align="flex-start" wrap="wrap">
        <SectionIntro
          title="Personal Information"
          subtitle="Your personal information"
        />

        {loading || !profile ? (
          <ProfileSkeleton />
        ) : (
          <Stack gap={6} flex="1.4" minW="360px" maxW="520px">
            <HStack gap={4}>
              <Box position="relative" flexShrink={0}>
                {profile.avatarUrl ? (
                  <Image
                    src={profile.avatarUrl}
                    alt={profile.fullName}
                    w="56px"
                    h="56px"
                    rounded="full"
                    objectFit="cover"
                    opacity={uploadingAvatar ? 0.5 : 1}
                  />
                ) : (
                  <UserCircle2 size={56} color="#CBD5E1" strokeWidth={1.25} />
                )}
                <input
                  ref={avatarRef}
                  type="file"
                  accept="image/png,image/jpeg,image/gif"
                  hidden
                  onChange={(e) => {
                    handleAvatar(e.target.files?.[0]);
                    // Let the same file be re-picked after a failed attempt.
                    e.target.value = "";
                  }}
                />
                <Flex
                  as="button"
                  onClick={
                    uploadingAvatar ? undefined : () => avatarRef.current?.click()
                  }
                  position="absolute"
                  bottom="-2px"
                  right="-2px"
                  w="22px"
                  h="22px"
                  rounded="full"
                  bg="white"
                  borderWidth="1px"
                  borderColor="gray.200"
                  align="center"
                  justify="center"
                  color="gray.500"
                  cursor={uploadingAvatar ? "wait" : "pointer"}
                  _hover={{ color: "#2E2F6F" }}
                  aria-label="Change profile picture"
                >
                  <Pencil size={11} />
                </Flex>
              </Box>
              <Stack gap={0.5}>
                <Text fontSize="md" fontWeight="semibold" color="gray.900">
                  Profile Picture
                </Text>
                <Text fontSize="sm" color="gray.500">
                  PNGs, JPEGs and GIFs under 10MB are allowed
                </Text>
              </Stack>
            </HStack>

            <Box borderWidth="1px" borderColor="gray.200" rounded="xl" px={5} py={1}>
              <InfoRow
                label="Full Name"
                value={profile.fullName}
                onEdit={openNameModal}
              />
              <InfoRow label="Email" value={profile.email} />
              {/* Read-only here — an admin's role is changed from Admin Management. */}
              <InfoRow label="Role" value={profile.roleName} last />
            </Box>
          </Stack>
        )}
      </Flex>

      {/* ---------------- Password ---------------- */}
      <Flex gap={16} align="flex-start" wrap="wrap">
        <SectionIntro
          title="Password"
          subtitle="Manage your account security, password settings."
        />

        <Stack gap={5} flex="1.4" minW="360px" maxW="520px">
          <Box>
            <FieldLabel>Old password</FieldLabel>
            <PasswordInput
              value={oldPw}
              onChange={setOldPw}
              placeholder="Enter old password"
            />
          </Box>

          <Box>
            <FieldLabel>New Password</FieldLabel>
            <PasswordInput
              value={newPw}
              onChange={setNewPw}
              placeholder="Enter new password"
            />
            <Text
              fontSize="xs"
              mt={1.5}
              color={newPw.length > 0 && newPw.length < 8 ? "#EF4444" : "gray.400"}
            >
              Must at least be 8 characters
            </Text>
          </Box>

          <Box>
            <FieldLabel>Confirm password</FieldLabel>
            <PasswordInput
              value={confirmPw}
              onChange={setConfirmPw}
              placeholder="Re-enter password"
            />
            {confirmPw.length > 0 && newPw !== confirmPw ? (
              <Text fontSize="xs" mt={1.5} color="#EF4444">
                Passwords do not match
              </Text>
            ) : null}
          </Box>

          <Button
            rounded="full"
            h="52px"
            mt={1}
            fontWeight="medium"
            bg={passwordValid ? "#2E2F6F" : "#E5E7EB"}
            color={passwordValid ? "white" : "#9CA3AF"}
            _hover={passwordValid ? { bg: "#262760" } : { bg: "#E5E7EB" }}
            cursor={passwordValid ? "pointer" : "not-allowed"}
            disabled={!passwordValid || savingPw}
            loading={savingPw}
            onClick={savePassword}
          >
            Save changes
          </Button>
        </Stack>
      </Flex>

      {/* ---------------- "Edit Name" modal ---------------- */}
      {editingName ? (
        <SettingsModal
          title="Edit Name"
          saving={savingName}
          onSave={saveName}
          onClose={() => setEditingName(false)}
        >
          <Box>
            <FieldLabel>First Name</FieldLabel>
            <TextInput
              value={nameDraft.firstName}
              placeholder="Enter first name"
              onChange={(v) => setNameDraft((d) => ({ ...d, firstName: v }))}
            />
          </Box>
          <Box>
            <FieldLabel>
              Middle Name{" "}
              <Text as="span" color="gray.400">
                (optional)
              </Text>
            </FieldLabel>
            <TextInput
              value={nameDraft.middleName}
              placeholder="Enter middle name"
              onChange={(v) => setNameDraft((d) => ({ ...d, middleName: v }))}
            />
          </Box>
          <Box>
            <FieldLabel>Last Name</FieldLabel>
            <TextInput
              value={nameDraft.lastName}
              placeholder="Enter last name"
              onChange={(v) => setNameDraft((d) => ({ ...d, lastName: v }))}
            />
          </Box>
        </SettingsModal>
      ) : null}
    </Stack>
  );
}
