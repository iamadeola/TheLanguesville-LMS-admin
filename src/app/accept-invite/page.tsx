"use client";

import { Box, Heading, Link, Stack, Text } from "@chakra-ui/react";
import { Check } from "lucide-react";
import NextLink from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { AdminBadge } from "@/components/onboarding/admin-badge";
import { FormField } from "@/components/onboarding/form-field";
import { OnboardingCard } from "@/components/onboarding/onboarding-card";
import { PasswordField } from "@/components/onboarding/password-field";
import { AppButton } from "@/components/ui/app-button";
import { acceptInvite } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/client";

const MIN_PASSWORD_LENGTH = 6;

function validatePassword(password: string): string | undefined {
  if (!password) return "Password is required";
  if (password.length < MIN_PASSWORD_LENGTH)
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  return undefined;
}

function validateConfirm(password: string, confirm: string): string | undefined {
  if (!confirm) return "Please confirm your password";
  if (confirm !== password) return "Passwords do not match";
  return undefined;
}

function InvalidLink() {
  return (
    <OnboardingCard>
      <Stack gap={5} align="center" textAlign="center">
        <AdminBadge />
        <Stack gap={2} align="center">
          <Heading as="h1" size="md" color="gray.900">
            Invalid invite link
          </Heading>
          <Text fontSize="sm" color="gray.600" maxW="320px">
            This invite link is missing or no longer valid. Ask an admin to
            resend your invitation.
          </Text>
        </Stack>
        <Link
          as={NextLink}
          href="/login"
          color="#2E2F6F"
          fontWeight="semibold"
          fontSize="sm"
          _hover={{ textDecoration: "underline" }}
        >
          Go to login
        </Link>
      </Stack>
    </OnboardingCard>
  );
}

function AcceptedConfirmation() {
  return (
    <OnboardingCard>
      <Stack gap={5} align="center" textAlign="center">
        <Box
          w="56px"
          h="56px"
          rounded="full"
          bg="#DCFCE7"
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="#16A34A"
        >
          <Check size={28} strokeWidth={2.5} />
        </Box>
        <Stack gap={1}>
          <Heading as="h1" size="md" color="gray.900">
            You&apos;re all set 🎉
          </Heading>
          <Text fontSize="sm" color="gray.600" maxW="320px">
            Your account is ready. Redirecting you to login…
          </Text>
        </Stack>
        <Link
          as={NextLink}
          href="/login"
          color="#2E2F6F"
          fontWeight="semibold"
          fontSize="sm"
          _hover={{ textDecoration: "underline" }}
        >
          Go to login now
        </Link>
      </Stack>
    </OnboardingCard>
  );
}

function AcceptInviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    password: false,
    confirm: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (!token) return <InvalidLink />;
  if (done) return <AcceptedConfirmation />;

  const firstNameError = firstName.trim() ? undefined : "First name is required";
  const lastNameError = lastName.trim() ? undefined : "Last name is required";
  const passwordError = validatePassword(password);
  const confirmError = validateConfirm(password, confirm);

  const show = (
    field: keyof typeof touched,
    error: string | undefined,
  ): string | undefined =>
    (touched[field] || submitted) && error ? error : undefined;

  const handleSubmit = async () => {
    setSubmitted(true);
    if (firstNameError || lastNameError || passwordError || confirmError) return;

    setIsSubmitting(true);
    const result = await acceptInvite({
      token,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      password,
    });

    if (result.success) {
      setDone(true);
      toast.success("Account created! Please log in.");
      setTimeout(() => router.replace("/login"), 1800);
    } else {
      setIsSubmitting(false);
      toast.error(
        getApiErrorMessage(
          result,
          "This invite link is no longer valid — ask an admin to resend it.",
        ),
      );
    }
  };

  return (
    <OnboardingCard>
      <Stack gap={6}>
        <Stack gap={3} align="center" textAlign="center">
          <AdminBadge />
          <Stack gap={0.5}>
            <Heading as="h1" size="md" color="gray.900">
              Set up your account
            </Heading>
            <Text fontSize="sm" color="gray.600">
              Complete your details to finish your invite.
            </Text>
          </Stack>
        </Stack>

        <Stack gap={4}>
          <FormField
            label="First name"
            placeholder="Tobi"
            value={firstName}
            error={show("firstName", firstNameError)}
            onChange={(e) => setFirstName(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, firstName: true }))}
          />
          <FormField
            label="Last name"
            placeholder="Doe"
            value={lastName}
            error={show("lastName", lastNameError)}
            onChange={(e) => setLastName(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, lastName: true }))}
          />
          <PasswordField
            label="Password"
            helperText={`Must be at least ${MIN_PASSWORD_LENGTH} characters`}
            value={password}
            error={show("password", passwordError)}
            onChange={setPassword}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          />
          <PasswordField
            label="Confirm password"
            value={confirm}
            error={show("confirm", confirmError)}
            onChange={setConfirm}
            onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
          />
        </Stack>

        <AppButton onClick={handleSubmit} isLoading={isSubmitting} mt={2}>
          Create account
        </AppButton>
      </Stack>
    </OnboardingCard>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense>
      <AcceptInviteForm />
    </Suspense>
  );
}
