"use client";

import { Button, Heading, Stack, Text } from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AdminBadge } from "@/components/onboarding/admin-badge";
import { OnboardingCard } from "@/components/onboarding/onboarding-card";
import { OtpInput } from "@/components/login/otp-input";
import { toast } from "sonner";
import { verifyOtp } from "@/lib/api/auth";

const RESEND_SECONDS = 59;
const CODE_LENGTH = 6;

function formatMmSs(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [code, setCode] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (!email) {
      toast.error("Session expired. Please log in again.");
      router.replace("/login");
    }
  }, [email, router]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  const handleComplete = async (fullCode: string) => {
    setIsVerifying(true);

    const result = await verifyOtp(email, fullCode);

    if (result.success) {
      toast.success("Verified! Redirecting to dashboard…");
      router.push("/dashboard");
    } else {
      setIsVerifying(false);
      toast.error(result.message || "Invalid code. Please try again.");
    }
  };

  const handleResend = () => {
    setCode("");
    setSecondsLeft(RESEND_SECONDS);
  };

  return (
    <OnboardingCard
      footer={
        <Text fontSize="xs" color="gray.600">
          {secondsLeft > 0 ? (
            <>
              Don&apos;t receive code?{" "}
              <Text as="span" color="#EF4444" fontWeight="semibold">
                {formatMmSs(secondsLeft)}
              </Text>
            </>
          ) : (
            <Button
              variant="plain"
              size="xs"
              type="button"
              onClick={handleResend}
              color="#EF4444"
              fontWeight="semibold"
              p={0}
              h="auto"
              minH={0}
              _hover={{ textDecoration: "underline" }}
            >
              Resend code
            </Button>
          )}
        </Text>
      }
    >
      <Stack gap={6}>
        <Stack gap={3} align="center" textAlign="center">
          <AdminBadge />
          <Stack gap={0.5}>
            <Heading as="h1" size="md" color="gray.900">
              Verify your email
            </Heading>
            <Text fontSize="sm" color="gray.600">
              Please enter the code we sent you below.
            </Text>
          </Stack>
        </Stack>

        <OtpInput
          length={CODE_LENGTH}
          value={code}
          onChange={setCode}
          onComplete={handleComplete}
          disabled={isVerifying}
        />
      </Stack>
    </OnboardingCard>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailForm />
    </Suspense>
  );
}
