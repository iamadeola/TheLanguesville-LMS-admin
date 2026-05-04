"use client";

import { Box, Heading, Stack, Text } from "@chakra-ui/react";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { OnboardingCard } from "@/components/onboarding/onboarding-card";
import { AppButton } from "@/components/ui/app-button";

export default function OnboardingCompletePage() {
  const router = useRouter();
  const [isContinuing, setIsContinuing] = useState(false);

  const handleContinue = () => {
    setIsContinuing(true);
    // In a real app this would route to the dashboard / login.
    setTimeout(() => router.push("/"), 600);
  };

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
            Your Admin account is ready. You can now log in and start managing.
          </Text>
        </Stack>

        <AppButton onClick={handleContinue} isLoading={isContinuing}>
          Continue
        </AppButton>
      </Stack>
    </OnboardingCard>
  );
}
