"use client";

import { Button, Input, Stack, Text, Textarea } from "@chakra-ui/react";
import { useState } from "react";
import { toast } from "sonner";
import { InviteOverlay } from "@/components/invitations/invite-shell";
import { Avatar } from "@/components/shared/avatar";
import { AppButton } from "@/components/ui/app-button";
import { getApiErrorMessage } from "@/lib/api/client";
import { sendInstructorMessage } from "@/lib/api/instructors";

const SUBJECT_MAX = 200;
const BODY_MAX = 2000;

interface MessageInstructorModalProps {
  instructor: { id: string; name: string; email: string; avatarUrl?: string | null; initials?: string };
  onClose: () => void;
}

/** Message an instructor — delivered by email and recorded server-side. */
export function MessageInstructorModal({ instructor, onClose }: MessageInstructorModalProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const canSend = !sending && subject.trim() !== "" && body.trim() !== "";

  const send = async () => {
    if (!canSend) return;
    setSending(true);
    const result = await sendInstructorMessage(instructor.id, {
      subject: subject.trim(),
      body: body.trim(),
    });
    if (result.success) {
      onClose();
      if (result.data.delivered === false) {
        toast.warning("Message recorded", {
          description: "The email couldn't be delivered right now, but the message was logged.",
        });
      } else {
        toast.success("Message sent", {
          description: `Your message has been emailed to ${instructor.name}.`,
        });
      }
    } else {
      setSending(false);
      toast.error(getApiErrorMessage(result, "Couldn't send the message"));
    }
  };

  return (
    <InviteOverlay onClose={sending ? undefined : onClose}>
      <Stack gap={4}>
        <Stack gap={2}>
          <Avatar name={instructor.name} src={instructor.avatarUrl} initials={instructor.initials} size={48} />
          <Stack gap={0}>
            <Text fontSize="lg" fontWeight="bold" color="gray.900">
              {instructor.name}
            </Text>
            <Text fontSize="sm" color="gray.500">
              {instructor.email}
            </Text>
          </Stack>
        </Stack>

        <Stack gap={2}>
          <Text fontSize="sm" fontWeight="medium" color="gray.800">
            Subject
          </Text>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            maxLength={SUBJECT_MAX}
            placeholder="A clear, short subject line"
            h="48px"
            fontSize="sm"
            borderColor="gray.200"
            rounded="lg"
            _placeholder={{ color: "gray.400" }}
            _focus={{ borderColor: "#2E2F6F", outline: "none", boxShadow: "none" }}
          />
        </Stack>

        <Stack gap={2}>
          <Text fontSize="sm" fontWeight="medium" color="gray.800">
            Message
          </Text>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={BODY_MAX}
            placeholder="Write your message"
            minH="140px"
            resize="none"
            fontSize="sm"
            borderColor="gray.200"
            rounded="lg"
            _placeholder={{ color: "gray.400" }}
            _focus={{ borderColor: "#2E2F6F", outline: "none", boxShadow: "none" }}
          />
          <Text fontSize="xs" color="gray.400" textAlign="right">
            {body.length}/{BODY_MAX}
          </Text>
        </Stack>

        <Stack gap={3}>
          <AppButton onClick={send} isLoading={sending} disabled={!canSend}>
            Send message
          </AppButton>
          <Button variant="outline" rounded="full" h="48px" fontWeight="medium" onClick={onClose} disabled={sending}>
            Cancel
          </Button>
        </Stack>
      </Stack>
    </InviteOverlay>
  );
}
