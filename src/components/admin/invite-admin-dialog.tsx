"use client";

import { Button, Dialog, Portal, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";
import { toast } from "sonner";
import { FormField } from "@/components/onboarding/form-field";
import { AppButton } from "@/components/ui/app-button";
import { inviteAdmin } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/client";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface InviteAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteAdminDialog({ open, onOpenChange }: InviteAdminDialogProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setEmail("");
    setError(undefined);
    setIsSubmitting(false);
  };

  const close = () => {
    onOpenChange(false);
    reset();
  };

  const handleSubmit = async () => {
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setError("Please enter a valid email address");
      return;
    }
    setError(undefined);
    setIsSubmitting(true);

    const result = await inviteAdmin(trimmed);

    if (result.success) {
      toast.success(`Invite sent to ${trimmed}`);
      close();
    } else {
      setIsSubmitting(false);
      const message = getApiErrorMessage(result, "Failed to send invite.");
      setError(message);
      toast.error(message);
    }
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => (e.open ? onOpenChange(true) : close())}
      placement="center"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content rounded="xl" maxW="420px" w="full">
            <Dialog.Header>
              <Dialog.Title color="gray.900">Invite admin</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap={3}>
                <Text fontSize="sm" color="gray.600">
                  We&apos;ll email an invite link so they can set up their admin
                  account.
                </Text>
                <FormField
                  label="Email"
                  type="email"
                  placeholder="name@thelanguesville.com"
                  value={email}
                  error={error}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(undefined);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit();
                  }}
                />
              </Stack>
            </Dialog.Body>
            <Dialog.Footer gap={3}>
              <Button
                variant="outline"
                rounded="full"
                onClick={close}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <AppButton
                onClick={handleSubmit}
                isLoading={isSubmitting}
                w="auto"
                px={6}
              >
                Send invite
              </AppButton>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
