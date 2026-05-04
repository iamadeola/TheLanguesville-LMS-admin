"use client";

import { Heading, Stack, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminBadge } from "@/components/onboarding/admin-badge";
import { FormField } from "@/components/onboarding/form-field";
import { OnboardingCard } from "@/components/onboarding/onboarding-card";
import { ProgressSteps } from "@/components/onboarding/progress-steps";
import { AppButton } from "@/components/ui/app-button";

export default function PersonalDetailsPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canContinue = firstName.trim().length > 0 && lastName.trim().length > 0;

  const handleContinue = () => {
    if (!canContinue) return;
    setIsSubmitting(true);
    setTimeout(() => router.push("/onboarding/password"), 500);
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

        <ProgressSteps
          label="Personal details"
          currentStep={1}
          totalSteps={2}
        />

        <Stack gap={4}>
          <FormField
            label="Legal first name"
            placeholder="Tobi"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <FormField
            label="Legal last name"
            placeholder="Doe"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </Stack>

        <AppButton
          onClick={handleContinue}
          isLoading={isSubmitting}
          disabled={!canContinue}
          mt={2}
        >
          Continue
        </AppButton>
      </Stack>
    </OnboardingCard>
  );
}
