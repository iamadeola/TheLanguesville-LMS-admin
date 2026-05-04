"use client";

import { Heading, Stack, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminBadge } from "@/components/onboarding/admin-badge";
import { OnboardingCard } from "@/components/onboarding/onboarding-card";
import { PasswordField } from "@/components/onboarding/password-field";
import { ProgressSteps } from "@/components/onboarding/progress-steps";
import { AppButton } from "@/components/ui/app-button";

function validatePassword(password: string): string | undefined {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  return undefined;
}

function validateConfirm(
  password: string,
  confirm: string,
): string | undefined {
  if (!confirm) return "Please confirm your password";
  if (confirm !== password) return "Passwords do not match";
  return undefined;
}

export default function PasswordSetupPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [touched, setTouched] = useState({ password: false, confirm: false });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordError = validatePassword(password);
  const confirmError = validateConfirm(password, confirm);

  // Show errors only after the field has been blurred or after a submit attempt
  const showPasswordError =
    (touched.password || submitted) && passwordError
      ? passwordError
      : undefined;
  const showConfirmError =
    (touched.confirm || submitted) && confirmError ? confirmError : undefined;

  const handleContinue = () => {
    setSubmitted(true);
    if (passwordError || confirmError) return;
    setIsSubmitting(true);
    setTimeout(() => router.push("/onboarding/complete"), 600);
  };

  return (
    <OnboardingCard>
      <Stack gap={6}>
        <Stack gap={3} align="center" textAlign="center">
          <AdminBadge />
          <Stack gap={0.5}>
            <Heading as="h1" size="md" color="gray.900">
              Welcome to TheLanguesville admin
            </Heading>
            <Text fontSize="sm" color="gray.600">
              Let&apos;s get you set up
            </Text>
          </Stack>
        </Stack>

        <ProgressSteps label="Password" currentStep={2} totalSteps={2} />

        <Stack gap={4}>
          <PasswordField
            label="Password"
            helperText="Must at least be 8 characters"
            error={showPasswordError}
            value={password}
            onChange={setPassword}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          />
          <PasswordField
            label="Confirm password"
            error={showConfirmError}
            value={confirm}
            onChange={setConfirm}
            onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
          />
        </Stack>

        <AppButton onClick={handleContinue} isLoading={isSubmitting} mt={2}>
          Continue
        </AppButton>
      </Stack>
    </OnboardingCard>
  );
}
