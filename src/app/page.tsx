"use client";

import { Heading, Stack, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminBadge } from "@/components/onboarding/admin-badge";
import { OnboardingCard } from "@/components/onboarding/onboarding-card";
import { AppButton } from "@/components/ui/app-button";

const INVITE_SECONDS = 48 * 60 * 60 - 1; // 47:59:59

function formatCountdown(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

export default function AcceptInvitePage() {
  const router = useRouter();
  const [isAccepting, setIsAccepting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(INVITE_SECONDS);

  useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const handleAccept = () => {
    setIsAccepting(true);
    // Simulate async accept then navigate to the first onboarding step
    setTimeout(() => {
      router.push("/onboarding/personal-details");
    }, 600);
  };

  return (
    <OnboardingCard
      footer={
        <Text fontSize="xs" color="gray.600">
          This link will expire in{" "}
          <Text as="span" color="#EF4444" fontWeight="semibold">
            {formatCountdown(secondsLeft)}
          </Text>
        </Text>
      }
    >
      <Stack gap={5} align="center" textAlign="center">
        <AdminBadge />
        <Stack gap={2} align="center">
          <Heading as="h1" size="md" color="gray.900" lineHeight="1.3">
            You&apos;ve been invited to join
            <br />
            TheLanguesville Admin
          </Heading>
          <Text fontSize="sm" color="gray.600" maxW="320px">
            You&apos;ve been invited to join Thelanguesville Admin. Click below
            to set up your account.
          </Text>
        </Stack>
        <AppButton
          onClick={handleAccept}
          isLoading={isAccepting}
          disabled={secondsLeft === 0}
        >
          Accept invite
        </AppButton>
      </Stack>
    </OnboardingCard>
  );
}
