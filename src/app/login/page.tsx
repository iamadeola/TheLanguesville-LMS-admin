"use client";

import { Heading, Link, Stack, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminBadge } from "@/components/onboarding/admin-badge";
import { FormField } from "@/components/onboarding/form-field";
import { OnboardingCard } from "@/components/onboarding/onboarding-card";
import { PasswordField } from "@/components/onboarding/password-field";
import { AppButton } from "@/components/ui/app-button";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email: string): string | undefined {
  if (!email) return "Email is required";
  if (!EMAIL_RE.test(email)) return "Please enter a valid email address";
  return undefined;
}

function validateLoginPassword(password: string): string | undefined {
  if (!password) return "Password is required";
  return undefined;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailError = validateEmail(email);
  const passwordError = validateLoginPassword(password);

  const showEmailError =
    (touched.email || submitted) && emailError ? emailError : undefined;
  const showPasswordError =
    (touched.password || submitted) && passwordError
      ? passwordError
      : undefined;

  const handleLogin = () => {
    setSubmitted(true);
    if (emailError || passwordError) return;
    setIsSubmitting(true);
    setTimeout(() => router.push("/login/verify"), 600);
  };

  return (
    <OnboardingCard
      footer={
        <Text fontSize="xs" color="gray.600">
          Forgot password?{" "}
          <Link
            as={NextLink}
            href="/forgot-password"
            color="#EF4444"
            fontWeight="semibold"
            _hover={{ textDecoration: "underline" }}
          >
            Reset here
          </Link>
        </Text>
      }
    >
      <Stack gap={6}>
        <Stack gap={3} align="center" textAlign="center">
          <AdminBadge />
          <Stack gap={0.5}>
            <Heading as="h1" size="md" color="gray.900">
              Welcome back
            </Heading>
            <Text fontSize="sm" color="gray.600">
              Login to your admin account.
            </Text>
          </Stack>
        </Stack>

        <Stack gap={4}>
          <FormField
            label="Email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            error={showEmailError}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          />
          <PasswordField
            label="Password"
            placeholder="Enter your password"
            value={password}
            error={showPasswordError}
            onChange={setPassword}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          />
        </Stack>

        <AppButton onClick={handleLogin} isLoading={isSubmitting}>
          Login
        </AppButton>
      </Stack>
    </OnboardingCard>
  );
}
