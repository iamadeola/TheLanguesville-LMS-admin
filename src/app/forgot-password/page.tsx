"use client";

import { Box, Button, Heading, Link, Stack, Text } from "@chakra-ui/react";
import { Check } from "lucide-react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminBadge } from "@/components/onboarding/admin-badge";
import { FormField } from "@/components/onboarding/form-field";
import { OnboardingCard } from "@/components/onboarding/onboarding-card";
import { PasswordField } from "@/components/onboarding/password-field";
import { OtpInput } from "@/components/login/otp-input";
import { AppButton } from "@/components/ui/app-button";
import { forgotPassword, resetPassword, verifyResetOtp } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/client";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_LENGTH = 6;
const RESEND_SECONDS = 59;
// Matches the backend rule shared with the settings "change password" tab.
const MIN_PASSWORD_LENGTH = 8;

function validateEmail(email: string): string | undefined {
  if (!email) return "Email is required";
  if (!EMAIL_RE.test(email)) return "Please enter a valid email address";
  return undefined;
}

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

function formatMmSs(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function BackToLogin() {
  return (
    <Text fontSize="xs" color="gray.600">
      Remembered it?{" "}
      <Link
        as={NextLink}
        href="/login"
        color="#EF4444"
        fontWeight="semibold"
        _hover={{ textDecoration: "underline" }}
      >
        Back to login
      </Link>
    </Text>
  );
}

/**
 * Admin password reset: request a code → verify it for a short-lived reset
 * token → set the new password. All three steps live on this one route (like
 * the login page's OTP step) so the email stays in memory for "resend" and the
 * reset token never has to travel through the URL.
 */
export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp" | "password" | "done">(
    "email",
  );

  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pwTouched, setPwTouched] = useState({
    password: false,
    confirm: false,
  });
  const [pwSubmitted, setPwSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const emailError = validateEmail(email);
  const showEmailError =
    (emailTouched || emailSubmitted) && emailError ? emailError : undefined;

  const passwordError = validatePassword(password);
  const confirmError = validateConfirm(password, confirm);
  const showPw = (
    field: keyof typeof pwTouched,
    error: string | undefined,
  ): string | undefined =>
    (pwTouched[field] || pwSubmitted) && error ? error : undefined;

  useEffect(() => {
    if (step !== "otp" || secondsLeft <= 0) return;
    const id = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [step, secondsLeft]);

  const requestCode = async (): Promise<boolean> => {
    const result = await forgotPassword(email);
    if (result.success) return true;
    toast.error(
      getApiErrorMessage(result, "Couldn't send the code. Please try again."),
    );
    return false;
  };

  const handleRequestCode = async () => {
    setEmailSubmitted(true);
    if (emailError) return;
    setIsSending(true);

    const ok = await requestCode();
    setIsSending(false);
    if (ok) {
      setCode("");
      setSecondsLeft(RESEND_SECONDS);
      setStep("otp");
      // The API responds the same way for unknown emails on purpose — say
      // "if an account exists" rather than confirming this one does.
      toast.success("If an account exists for that email, a code is on its way.");
    }
  };

  const handleVerify = async (fullCode: string) => {
    setIsVerifying(true);
    const result = await verifyResetOtp(email, fullCode);

    if (result.success) {
      setResetToken(result.data.resetToken);
      setIsVerifying(false);
      setStep("password");
    } else {
      setIsVerifying(false);
      setCode("");
      toast.error(getApiErrorMessage(result, "Invalid code. Please try again."));
    }
  };

  const handleResend = async () => {
    setCode("");
    const ok = await requestCode();
    if (ok) {
      setSecondsLeft(RESEND_SECONDS);
      toast.success("A new code has been sent to your email.");
    }
  };

  const handleResetPassword = async () => {
    setPwSubmitted(true);
    if (passwordError || confirmError) return;

    setIsSaving(true);
    const result = await resetPassword({
      resetToken,
      password,
      confirmPassword: confirm,
    });

    if (result.success) {
      setStep("done");
      toast.success("Password updated. Please log in.");
      setTimeout(() => router.replace("/login"), 1800);
    } else {
      setIsSaving(false);
      toast.error(
        getApiErrorMessage(result, "Couldn't reset your password. Try again."),
      );
    }
  };

  if (step === "done") {
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
              Password updated
            </Heading>
            <Text fontSize="sm" color="gray.600" maxW="320px">
              Use your new password to sign in. Redirecting you to login…
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

  if (step === "password") {
    return (
      <OnboardingCard footer={<BackToLogin />}>
        <Stack gap={6}>
          <Stack gap={3} align="center" textAlign="center">
            <AdminBadge />
            <Stack gap={0.5}>
              <Heading as="h1" size="md" color="gray.900">
                Set a new password
              </Heading>
              <Text fontSize="sm" color="gray.600">
                Choose a new password for {email}.
              </Text>
            </Stack>
          </Stack>

          <Stack gap={4}>
            <PasswordField
              label="New password"
              placeholder="Enter your new password"
              helperText={`Must be at least ${MIN_PASSWORD_LENGTH} characters`}
              value={password}
              error={showPw("password", passwordError)}
              onChange={setPassword}
              onBlur={() => setPwTouched((t) => ({ ...t, password: true }))}
            />
            <PasswordField
              label="Confirm password"
              placeholder="Re-enter your new password"
              value={confirm}
              error={showPw("confirm", confirmError)}
              onChange={setConfirm}
              onBlur={() => setPwTouched((t) => ({ ...t, confirm: true }))}
            />
          </Stack>

          <AppButton onClick={handleResetPassword} isLoading={isSaving}>
            Reset password
          </AppButton>
        </Stack>
      </OnboardingCard>
    );
  }

  if (step === "otp") {
    return (
      <OnboardingCard
        footer={
          <Text fontSize="xs" color="gray.600">
            {secondsLeft > 0 ? (
              <>
                Didn&apos;t receive a code?{" "}
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
                Enter your code
              </Heading>
              <Text fontSize="sm" color="gray.600">
                Enter the 6-digit code we sent to {email}.
              </Text>
            </Stack>
          </Stack>

          <OtpInput
            length={CODE_LENGTH}
            value={code}
            onChange={setCode}
            onComplete={handleVerify}
            disabled={isVerifying}
          />

          <Button
            variant="plain"
            size="sm"
            type="button"
            onClick={() => setStep("email")}
            color="gray.600"
            fontWeight="medium"
            _hover={{ textDecoration: "underline" }}
          >
            Use a different email
          </Button>
        </Stack>
      </OnboardingCard>
    );
  }

  return (
    <OnboardingCard footer={<BackToLogin />}>
      <Stack gap={6}>
        <Stack gap={3} align="center" textAlign="center">
          <AdminBadge />
          <Stack gap={0.5}>
            <Heading as="h1" size="md" color="gray.900">
              Reset your password
            </Heading>
            <Text fontSize="sm" color="gray.600">
              Enter your email and we&apos;ll send you a 6-digit code.
            </Text>
          </Stack>
        </Stack>

        <FormField
          label="Email"
          type="email"
          placeholder="Enter your email address"
          value={email}
          error={showEmailError}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setEmailTouched(true)}
        />

        <AppButton onClick={handleRequestCode} isLoading={isSending}>
          Send code
        </AppButton>
      </Stack>
    </OnboardingCard>
  );
}
