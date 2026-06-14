"use client";

import { Box, Flex, HStack, Stack, Text } from "@chakra-ui/react";
import { Bell, FileText, Mail, Star, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { Toggle } from "@/components/assignment/shared";

interface Pref {
  key: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
}

const TEACHING: Pref[] = [
  { key: "submissions", icon: FileText, title: "Assignment submissions", subtitle: "When a student submits work" },
  { key: "reviews", icon: Star, title: "Grade review requests", subtitle: "Students disputing or requesting reviews" },
];

const CHANNELS: Pref[] = [
  { key: "email", icon: Mail, title: "Email notifications", subtitle: "johndoe@gmail.com" },
  { key: "push", icon: Bell, title: "Browser push notifications", subtitle: "Chrome · this device" },
];

function PrefRow({
  pref,
  checked,
  onChange,
  last,
}: {
  pref: Pref;
  checked: boolean;
  onChange: (v: boolean) => void;
  last?: boolean;
}) {
  const Icon = pref.icon;
  return (
    <Flex
      justify="space-between"
      align="center"
      py={4}
      borderBottomWidth={last ? "0" : "1px"}
      borderColor="gray.100"
    >
      <HStack gap={3}>
        <Flex w="36px" h="36px" rounded="full" bg="gray.100" align="center" justify="center" color="#4338CA">
          <Icon size={18} />
        </Flex>
        <Stack gap={0}>
          <Text fontSize="sm" fontWeight="medium" color="gray.900">
            {pref.title}
          </Text>
          <Text fontSize="xs" color="gray.500">
            {pref.subtitle}
          </Text>
        </Stack>
      </HStack>
      <Toggle aria-label={pref.title} checked={checked} onChange={onChange} />
    </Flex>
  );
}

export function NotificationsTab() {
  const [state, setState] = useState<Record<string, boolean>>({
    submissions: true,
    reviews: true,
    email: true,
    push: true,
  });

  const set = (key: string, v: boolean) => setState((s) => ({ ...s, [key]: v }));

  return (
    <Flex gap={16} align="flex-start" wrap="wrap">
      <Stack gap={2} flex="1" minW="260px" maxW="380px">
        <Text fontSize="2xl" fontWeight="bold" color="gray.900">
          Notifications
        </Text>
        <Text fontSize="sm" color="gray.500">
          Control how and when you receive updates about your courses and students.
        </Text>
      </Stack>

      <Stack gap={8} flex="1.4" minW="380px">
        <Stack gap={3}>
          <Text fontWeight="semibold" color="gray.900">
            Teaching Activity
          </Text>
          <Box borderWidth="1px" borderColor="gray.200" rounded="xl" px={5} py={1}>
            {TEACHING.map((p, i) => (
              <PrefRow
                key={p.key}
                pref={p}
                checked={state[p.key]}
                onChange={(v) => set(p.key, v)}
                last={i === TEACHING.length - 1}
              />
            ))}
          </Box>
        </Stack>

        <Stack gap={3}>
          <Text fontWeight="semibold" color="gray.900">
            Delivery Channels
          </Text>
          <Box borderWidth="1px" borderColor="gray.200" rounded="xl" px={5} py={1}>
            {CHANNELS.map((p, i) => (
              <PrefRow
                key={p.key}
                pref={p}
                checked={state[p.key]}
                onChange={(v) => set(p.key, v)}
                last={i === CHANNELS.length - 1}
              />
            ))}
          </Box>
        </Stack>
      </Stack>
    </Flex>
  );
}
