"use client";

import { Box, Button, Flex, Stack, Text } from "@chakra-ui/react";
import { Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { FormField } from "@/components/onboarding/form-field";
import { AppButton } from "@/components/ui/app-button";
import { inviteInstructor } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/client";
import type { TeachingLevel } from "@/lib/api/instructors";
import { createInvitation } from "@/lib/api/invitations";
import {
  BackLink,
  InviteOverlay,
  StepHeading,
  WizardHeader,
  WizardProgress,
} from "./invite-shell";
import { InviteSuccessModal } from "./invite-success-modal";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LEVELS: Array<{ value: TeachingLevel; label: string; description: string }> = [
  { value: "beginner", label: "Beginner", description: "Teach foundational concepts." },
  { value: "intermediate", label: "Intermediate", description: "Teach basic understanding." },
  { value: "advanced", label: "Advanced", description: "Teach advanced learners." },
];

interface InviteInstructorModalProps {
  onClose: () => void;
  /** Fired after every successful send so the parent can refresh its lists. */
  onSent?: () => void;
  /** Success-modal primary action ("View instructor list"). */
  viewListLabel: string;
  onViewList: () => void;
  /**
   * Which documented endpoint to use — the Instructors screen keeps calling
   * POST /admin/invite; the Invitations screen uses the generic
   * POST /invitations. Both land in the same invitations list.
   */
  via?: "admin" | "invitations";
}

export function InviteInstructorModal({
  onClose,
  onSent,
  viewListLabel,
  onViewList,
  via = "admin",
}: InviteInstructorModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [level, setLevel] = useState<TeachingLevel | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<{ name: string; email: string; expiresAt: string } | null>(null);

  const validateInfo = () => {
    const next: Record<string, string | undefined> = {};
    if (!firstName.trim()) next.firstName = "First name is required";
    if (!lastName.trim()) next.lastName = "Last name is required";
    if (!EMAIL_RE.test(email.trim())) next.email = "Please enter a valid email address";
    setErrors(next);
    return Object.values(next).every((v) => !v);
  };

  const send = async () => {
    if (!level || sending) return;
    setSending(true);
    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      teachingLevel: level,
    };
    const result =
      via === "admin"
        ? await inviteInstructor(payload)
        : await createInvitation({ role: "instructor", ...payload });
    setSending(false);

    if (result.success) {
      setSent({
        name: `${payload.firstName} ${payload.lastName}`,
        email: payload.email,
        expiresAt: result.data.expiresAt,
      });
      onSent?.();
    } else {
      toast.error(getApiErrorMessage(result, "Couldn't send the invitation"));
    }
  };

  const reset = () => {
    setStep(1);
    setFirstName("");
    setLastName("");
    setEmail("");
    setErrors({});
    setLevel(null);
    setSent(null);
  };

  if (sent) {
    return (
      <InviteSuccessModal
        name={sent.name}
        email={sent.email}
        roleLabel="Instructor"
        description="The instructor will receive an email to join the platform."
        expiresAt={sent.expiresAt}
        primaryLabel={viewListLabel}
        onPrimary={onViewList}
        secondaryLabel="Invite another instructor"
        onSecondary={reset}
        onClose={onClose}
      />
    );
  }

  return (
    <InviteOverlay onClose={onClose}>
      <WizardHeader title="Invite Instructor" subtitle="Send a join link to a new instructor" />
      <WizardProgress step={step} total={2} />

      {step === 1 ? (
        <>
          <StepHeading title="Instructor’s Info" subtitle="Enter the instructor’s details to send an invitation." />
          <Stack gap={4} mb={6}>
            <FormField
              label="First Name"
              placeholder="John"
              value={firstName}
              error={errors.firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                if (errors.firstName) setErrors((p) => ({ ...p, firstName: undefined }));
              }}
            />
            <FormField
              label="Last Name"
              placeholder="Doe"
              value={lastName}
              error={errors.lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                if (errors.lastName) setErrors((p) => ({ ...p, lastName: undefined }));
              }}
            />
            <FormField
              label="Email Address"
              type="email"
              placeholder="johndoe@email.fr"
              value={email}
              error={errors.email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
              }}
            />
          </Stack>
          <Stack gap={3}>
            <AppButton onClick={() => validateInfo() && setStep(2)}>Continue</AppButton>
            <Button variant="outline" rounded="full" h="48px" fontWeight="medium" onClick={onClose}>
              Cancel
            </Button>
          </Stack>
        </>
      ) : (
        <>
          <StepHeading title="Work Experience" subtitle="Select instructors teaching level" />
          <Stack gap={3} mb={6}>
            {LEVELS.map((option) => {
              const selected = level === option.value;
              return (
                <Flex
                  key={option.value}
                  as="button"
                  onClick={() => setLevel(option.value)}
                  align="center"
                  gap={3}
                  px={4}
                  py={3.5}
                  rounded="xl"
                  borderWidth="1px"
                  borderColor={selected ? "#F97461" : "gray.200"}
                  bg={selected ? "#FEF3F1" : "white"}
                  cursor="pointer"
                  textAlign="left"
                  transition="all 0.15s"
                  _hover={selected ? undefined : { borderColor: "gray.300" }}
                >
                  {selected ? (
                    <Flex w="20px" h="20px" rounded="full" bg="#F97461" align="center" justify="center" flexShrink={0}>
                      <Check size={12} color="white" strokeWidth={3} />
                    </Flex>
                  ) : (
                    <Box w="20px" h="20px" rounded="full" borderWidth="1.5px" borderColor="gray.300" flexShrink={0} />
                  )}
                  <Stack gap={0}>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                      {option.label}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      {option.description}
                    </Text>
                  </Stack>
                </Flex>
              );
            })}
          </Stack>
          <BackLink label="Back to instructor’s info" onClick={() => setStep(1)} />
          <Stack gap={3}>
            <AppButton onClick={send} isLoading={sending} disabled={!level}>
              Send invitation
            </AppButton>
            <Button variant="outline" rounded="full" h="48px" fontWeight="medium" onClick={onClose} disabled={sending}>
              Cancel
            </Button>
          </Stack>
        </>
      )}
    </InviteOverlay>
  );
}
