"use client";

import {
  Box,
  Button,
  Flex,
  HStack,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { Check, ChevronDown, ChevronUp, Pencil, UserCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { TextField } from "@/components/assignment/wizard/wizard-bits";
import { SettingsModal } from "./settings-modal";

const TITLE_OPTIONS = ["Lecturer", "Instructor", "Professor", "Trainer", "Mentor", "Other"];

interface Profile {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  title: string;
  department: string;
  bio: string;
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
          {value}
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

export function ProfileTab() {
  const [profile, setProfile] = useState<Profile>({
    firstName: "John",
    middleName: "",
    lastName: "Doe",
    email: "johndoe@gmail.com",
    title: "Professor",
    department: "French Literature",
    bio: "Tenured professor of French language, specialized in contemporary literature and pedagogy.",
  });

  const [editing, setEditing] = useState<null | "name" | "title" | "department">(null);

  // local modal drafts
  const [nameDraft, setNameDraft] = useState({ firstName: "", middleName: "", lastName: "" });
  const [titleDraft, setTitleDraft] = useState("");
  const [titleOther, setTitleOther] = useState("");
  const [titleOpen, setTitleOpen] = useState(false);
  const [deptDraft, setDeptDraft] = useState("");

  const fullName = `${profile.firstName} ${profile.lastName}`.trim();

  const openName = () => {
    setNameDraft({
      firstName: profile.firstName,
      middleName: profile.middleName,
      lastName: profile.lastName,
    });
    setEditing("name");
  };
  const openTitle = () => {
    const known = TITLE_OPTIONS.includes(profile.title);
    setTitleDraft(known ? profile.title : "Other");
    setTitleOther(known ? "" : profile.title);
    setTitleOpen(false);
    setEditing("title");
  };
  const openDept = () => {
    setDeptDraft(profile.department);
    setEditing("department");
  };

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
            <UserCircle2 size={72} color="#CBD5E1" strokeWidth={1.25} />
            <Flex position="absolute" bottom="0" right="0" w="24px" h="24px" rounded="full" bg="white" borderWidth="1px" borderColor="gray.200" align="center" justify="center" color="gray.500">
              <Pencil size={12} />
            </Flex>
          </Box>
          <Stack gap={0.5}>
            <Text fontSize="lg" fontWeight="semibold" color="gray.900">
              {fullName}
            </Text>
            <Text fontSize="sm" color="gray.500">
              Senior Instructor • {profile.department}
            </Text>
            <Text fontSize="sm" color="gray.400">
              {profile.firstName.toLowerCase()}doe@email.com
            </Text>
          </Stack>
        </HStack>

        <Box borderWidth="1px" borderColor="gray.200" rounded="xl" px={5} py={1}>
          <EditableRow label="Full Name" value={fullName} onEdit={openName} />
          <EditableRow label="Email" value={profile.email} />
          <EditableRow label="Professional Title" value={profile.title} onEdit={openTitle} />
          <EditableRow label="Department" value={profile.department} onEdit={openDept} last />
        </Box>

        <Stack gap={2}>
          <Text fontSize="sm" color="gray.700">
            Bio
          </Text>
          <Textarea
            value={profile.bio}
            maxLength={200}
            onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
            minH="120px"
            resize="none"
            fontSize="sm"
            borderColor="gray.200"
            rounded="lg"
            _focus={{ borderColor: "#2E2F6F", outline: "none", boxShadow: "none" }}
          />
          <Text fontSize="xs" color="gray.400" textAlign="right">
            {profile.bio.length}/200
          </Text>
        </Stack>

        <Button
          bg="#2E2F6F"
          color="white"
          rounded="full"
          h="52px"
          fontWeight="medium"
          _hover={{ bg: "#262760" }}
          onClick={() => toast.success("Changes saved")}
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
            setProfile((p) => ({ ...p, ...nameDraft }));
            setEditing(null);
            toast.success("Name updated");
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
            const finalTitle = titleDraft === "Other" ? titleOther.trim() || "Other" : titleDraft;
            setProfile((p) => ({ ...p, title: finalTitle }));
            setEditing(null);
            toast.success("Professional title updated");
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
            setProfile((p) => ({ ...p, department: deptDraft }));
            setEditing(null);
            toast.success("Department updated");
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
