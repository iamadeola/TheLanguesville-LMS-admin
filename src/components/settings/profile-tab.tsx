"use client";

import {
  Box,
  Button,
  Flex,
  HStack,
  Image,
  Skeleton,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { Check, ChevronDown, ChevronUp, Pencil, UserCircle2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { TextField } from "@/components/assignment/wizard/wizard-bits";
import { getApiErrorMessage } from "@/lib/api/client";
import {
  type SettingsProfile,
  type UpdateProfilePayload,
  getProfile,
  updateProfile,
} from "@/lib/api/settings";
import { uploadFile } from "@/lib/api/uploads";
import { SettingsModal } from "./settings-modal";

const TITLE_OPTIONS = ["Lecturer", "Instructor", "Professor", "Trainer", "Mentor", "Other"];

/** The locally-editable slice of the profile. */
interface ProfileDraft {
  firstName: string;
  middleName: string;
  lastName: string;
  professionalTitle: string;
  department: string;
  bio: string;
  avatarUrl: string;
}

function toDraft(p: SettingsProfile): ProfileDraft {
  return {
    firstName: p.firstName ?? "",
    middleName: p.middleName ?? "",
    lastName: p.lastName ?? "",
    professionalTitle: p.professionalTitle ?? "",
    department: p.department ?? "",
    bio: p.bio ?? "",
    avatarUrl: p.avatarUrl ?? "",
  };
}

function EditableRow({
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
      py={4}
      borderBottomWidth={last ? "0" : "1px"}
      borderColor="gray.100"
    >
      <Text fontSize="sm" color="gray.500">
        {label}
      </Text>
      <HStack gap={2}>
        <Text fontSize="sm" color="gray.900" fontWeight="medium">
          {value || "—"}
        </Text>
        {onEdit ? (
          <Box as="button" onClick={onEdit} color="gray.400" cursor="pointer" _hover={{ color: "#2E2F6F" }} display="flex">
            <Pencil size={14} />
          </Box>
        ) : null}
      </HStack>
    </Flex>
  );
}

function ProfileSkeleton() {
  return (
    <Stack gap={6} flex="1.4" minW="380px">
      <HStack gap={4}>
        <Skeleton w="72px" h="72px" rounded="full" />
        <Stack gap={2}>
          <Skeleton h="18px" w="160px" rounded="md" />
          <Skeleton h="14px" w="220px" rounded="md" />
        </Stack>
      </HStack>
      <Skeleton h="200px" rounded="xl" />
      <Skeleton h="120px" rounded="lg" />
      <Skeleton h="52px" rounded="full" />
    </Stack>
  );
}

export function ProfileTab() {
  const [profile, setProfile] = useState<SettingsProfile | null>(null);
  const [draft, setDraft] = useState<ProfileDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState<null | "name" | "title" | "department">(null);
  const [nameDraft, setNameDraft] = useState({ firstName: "", middleName: "", lastName: "" });
  const [titleDraft, setTitleDraft] = useState("");
  const [titleOther, setTitleOther] = useState("");
  const [titleOpen, setTitleOpen] = useState(false);
  const [deptDraft, setDeptDraft] = useState("");

  useEffect(() => {
    getProfile().then((result) => {
      if (result.success) {
        setProfile(result.data);
        setDraft(toDraft(result.data));
      } else {
        toast.error(getApiErrorMessage(result, "Couldn't load your profile"));
      }
      setLoading(false);
    });
  }, []);

  if (loading || !draft || !profile) {
    return (
      <Flex gap={16} align="flex-start" wrap="wrap">
        <Stack gap={2} flex="1" minW="260px" maxW="380px">
          <Text fontSize="2xl" fontWeight="bold" color="gray.900">
            Personal Information
          </Text>
          <Text fontSize="sm" color="gray.500">
            Manage your profile details and information visible to students.
          </Text>
        </Stack>
        <ProfileSkeleton />
      </Flex>
    );
  }

  const fullName = `${draft.firstName} ${draft.lastName}`.trim();

  const openName = () => {
    setNameDraft({
      firstName: draft.firstName,
      middleName: draft.middleName,
      lastName: draft.lastName,
    });
    setEditing("name");
  };
  const openTitle = () => {
    const known = TITLE_OPTIONS.includes(draft.professionalTitle);
    setTitleDraft(draft.professionalTitle ? (known ? draft.professionalTitle : "Other") : "");
    setTitleOther(known || !draft.professionalTitle ? "" : draft.professionalTitle);
    setTitleOpen(false);
    setEditing("title");
  };
  const openDept = () => {
    setDeptDraft(draft.department);
    setEditing("department");
  };

  const handleAvatar = async (file: File | undefined) => {
    if (!file) return;
    setUploadingAvatar(true);
    const result = await uploadFile(file);
    if (result.success) {
      setDraft((d) => (d ? { ...d, avatarUrl: result.data.url } : d));
      toast.success("Photo ready — Save changes to apply");
    } else {
      toast.error(getApiErrorMessage(result, "Couldn't upload photo"));
    }
    setUploadingAvatar(false);
  };

  const handleSave = async () => {
    if (saving) return;
    if (!draft.firstName.trim() || !draft.lastName.trim()) {
      toast.error("First and last name are required");
      return;
    }
    setSaving(true);
    // Send only the editable slice (email/role are read-only).
    const payload: UpdateProfilePayload = {
      firstName: draft.firstName.trim(),
      middleName: draft.middleName.trim(),
      lastName: draft.lastName.trim(),
      professionalTitle: draft.professionalTitle.trim(),
      department: draft.department.trim(),
      bio: draft.bio,
      ...(draft.avatarUrl ? { avatarUrl: draft.avatarUrl } : {}),
    };
    const result = await updateProfile(payload);
    if (result.success) {
      setProfile(result.data);
      setDraft(toDraft(result.data));
      toast.success(result.message || "Profile updated successfully");
    } else {
      toast.error(getApiErrorMessage(result, "Couldn't update profile"));
    }
    setSaving(false);
  };

  const subtitle = [draft.professionalTitle, draft.department]
    .filter(Boolean)
    .join(" • ");

  return (
    <Flex gap={16} align="flex-start" wrap="wrap">
      {/* Left description */}
      <Stack gap={2} flex="1" minW="260px" maxW="380px">
        <Text fontSize="2xl" fontWeight="bold" color="gray.900">
          Personal Information
        </Text>
        <Text fontSize="sm" color="gray.500">
          Manage your profile details and information visible to students.
        </Text>
      </Stack>

      {/* Right form */}
      <Stack gap={6} flex="1.4" minW="380px">
        <HStack gap={4}>
          <Box position="relative">
            {draft.avatarUrl ? (
              <Image
                src={draft.avatarUrl}
                alt={fullName}
                w="72px"
                h="72px"
                rounded="full"
                objectFit="cover"
                opacity={uploadingAvatar ? 0.5 : 1}
              />
            ) : (
              <UserCircle2 size={72} color="#CBD5E1" strokeWidth={1.25} />
            )}
            <input
              ref={avatarRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handleAvatar(e.target.files?.[0])}
            />
            <Flex
              as="button"
              onClick={() => avatarRef.current?.click()}
              position="absolute"
              bottom="0"
              right="0"
              w="24px"
              h="24px"
              rounded="full"
              bg="white"
              borderWidth="1px"
              borderColor="gray.200"
              align="center"
              justify="center"
              color="gray.500"
              cursor="pointer"
              _hover={{ color: "#2E2F6F" }}
            >
              <Pencil size={12} />
            </Flex>
          </Box>
          <Stack gap={0.5}>
            <Text fontSize="lg" fontWeight="semibold" color="gray.900">
              {fullName || "—"}
            </Text>
            {subtitle ? (
              <Text fontSize="sm" color="gray.500">
                {subtitle}
              </Text>
            ) : null}
            <Text fontSize="sm" color="gray.400">
              {profile.email}
            </Text>
          </Stack>
        </HStack>

        <Box borderWidth="1px" borderColor="gray.200" rounded="xl" px={5} py={1}>
          <EditableRow label="Full Name" value={fullName} onEdit={openName} />
          <EditableRow label="Email" value={profile.email} />
          <EditableRow label="Professional Title" value={draft.professionalTitle} onEdit={openTitle} />
          <EditableRow label="Department" value={draft.department} onEdit={openDept} last />
        </Box>

        <Stack gap={2}>
          <Text fontSize="sm" color="gray.700">
            Bio
          </Text>
          <Textarea
            value={draft.bio}
            maxLength={200}
            onChange={(e) => setDraft((d) => (d ? { ...d, bio: e.target.value } : d))}
            minH="120px"
            resize="none"
            fontSize="sm"
            borderColor="gray.200"
            rounded="lg"
            _focus={{ borderColor: "#2E2F6F", outline: "none", boxShadow: "none" }}
          />
          <Text fontSize="xs" color="gray.400" textAlign="right">
            {draft.bio.length}/200
          </Text>
        </Stack>

        <Button
          bg="#2E2F6F"
          color="white"
          rounded="full"
          h="52px"
          fontWeight="medium"
          _hover={{ bg: "#262760" }}
          loading={saving}
          disabled={saving}
          onClick={handleSave}
        >
          Save changes
        </Button>
      </Stack>

      {/* Edit Name modal */}
      {editing === "name" ? (
        <SettingsModal
          title="Edit Name"
          onClose={() => setEditing(null)}
          onSave={() => {
            setDraft((d) => (d ? { ...d, ...nameDraft } : d));
            setEditing(null);
          }}
        >
          <Stack gap={0}>
            <Text fontSize="sm" color="gray.700" mb={2}>First Name</Text>
            <TextField value={nameDraft.firstName} onChange={(e) => setNameDraft((d) => ({ ...d, firstName: e.target.value }))} />
          </Stack>
          <Stack gap={0}>
            <Text fontSize="sm" color="gray.700" mb={2}>
              Middle Name <Text as="span" color="gray.400">(optional)</Text>
            </Text>
            <TextField placeholder="Enter middle name" value={nameDraft.middleName} onChange={(e) => setNameDraft((d) => ({ ...d, middleName: e.target.value }))} />
          </Stack>
          <Stack gap={0}>
            <Text fontSize="sm" color="gray.700" mb={2}>Last Name</Text>
            <TextField value={nameDraft.lastName} onChange={(e) => setNameDraft((d) => ({ ...d, lastName: e.target.value }))} />
          </Stack>
        </SettingsModal>
      ) : null}

      {/* Edit Professional Title modal */}
      {editing === "title" ? (
        <SettingsModal
          title="Edit Professional Title"
          onClose={() => setEditing(null)}
          onSave={() => {
            const finalTitle = titleDraft === "Other" ? titleOther.trim() : titleDraft;
            setDraft((d) => (d ? { ...d, professionalTitle: finalTitle } : d));
            setEditing(null);
          }}
        >
          <Stack gap={0}>
            <Text fontSize="sm" color="gray.700" mb={2}>Professional Title</Text>
            <Box position="relative">
              <Flex
                as="button"
                onClick={() => setTitleOpen((o) => !o)}
                w="full"
                h="48px"
                px={4}
                align="center"
                justify="space-between"
                borderWidth="1px"
                borderColor="gray.200"
                rounded="lg"
                cursor="pointer"
              >
                <Text fontSize="sm" color="gray.900">{titleDraft || "Select title"}</Text>
                {titleOpen ? <ChevronUp size={18} color="#9CA3AF" /> : <ChevronDown size={18} color="#9CA3AF" />}
              </Flex>
              {titleOpen ? (
                <Box mt={2} borderWidth="1px" borderColor="gray.200" rounded="lg" overflow="hidden">
                  {TITLE_OPTIONS.map((opt) => {
                    const active = titleDraft === opt;
                    return (
                      <Flex
                        key={opt}
                        as="button"
                        onClick={() => {
                          setTitleDraft(opt);
                          setTitleOpen(false);
                        }}
                        w="full"
                        px={4}
                        py={2.5}
                        align="center"
                        justify="space-between"
                        bg={active ? "gray.50" : "white"}
                        cursor="pointer"
                        _hover={{ bg: "gray.50" }}
                      >
                        <Text fontSize="sm" color="gray.800">{opt}</Text>
                        {active ? <Check size={16} color="#6366F1" /> : null}
                      </Flex>
                    );
                  })}
                </Box>
              ) : null}
            </Box>
            {titleDraft === "Other" ? (
              <Box mt={3}>
                <TextField placeholder="Enter professional title" value={titleOther} onChange={(e) => setTitleOther(e.target.value)} />
              </Box>
            ) : null}
          </Stack>
        </SettingsModal>
      ) : null}

      {/* Edit Department modal */}
      {editing === "department" ? (
        <SettingsModal
          title="Edit Department"
          onClose={() => setEditing(null)}
          onSave={() => {
            setDraft((d) => (d ? { ...d, department: deptDraft } : d));
            setEditing(null);
          }}
        >
          <Stack gap={0}>
            <Text fontSize="sm" color="gray.700" mb={2}>Department</Text>
            <TextField value={deptDraft} onChange={(e) => setDeptDraft(e.target.value)} />
          </Stack>
        </SettingsModal>
      ) : null}
    </Flex>
  );
}
