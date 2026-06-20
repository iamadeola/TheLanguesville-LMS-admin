"use client";

import { Box, Flex, HStack, Skeleton, Stack, Text } from "@chakra-ui/react";
import { Bell, FileText, Mail, Star, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Toggle } from "@/components/assignment/shared";
import { getApiErrorMessage } from "@/lib/api/client";
import {
  type NotificationPreferences,
  getNotifications,
  updateNotifications,
} from "@/lib/api/settings";
import { useAdmin } from "@/lib/hooks/use-admin";

type PrefKey = keyof NotificationPreferences;

interface Pref {
  key: PrefKey;
  icon: LucideIcon;
  title: string;
  subtitle: string;
}

const TEACHING: Pref[] = [
  {
    key: "assignmentSubmissions",
    icon: FileText,
    title: "Assignment submissions",
    subtitle: "When a student submits work",
  },
  {
    key: "gradeReviewRequests",
    icon: Star,
    title: "Grade review requests",
    subtitle: "Students disputing or requesting reviews",
  },
];

function PrefRow({
  pref,
  checked,
  disabled,
  onChange,
  last,
}: {
  pref: Pref;
  checked: boolean;
  disabled: boolean;
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
      opacity={disabled ? 0.6 : 1}
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

function SectionSkeleton() {
  return (
    <Box borderWidth="1px" borderColor="gray.200" rounded="xl" px={5} py={1}>
      {[0, 1].map((i) => (
        <Flex key={i} justify="space-between" align="center" py={4} borderBottomWidth={i === 1 ? "0" : "1px"} borderColor="gray.100">
          <HStack gap={3}>
            <Skeleton w="36px" h="36px" rounded="full" />
            <Stack gap={1}>
              <Skeleton h="14px" w="160px" rounded="md" />
              <Skeleton h="12px" w="200px" rounded="md" />
            </Stack>
          </HStack>
          <Skeleton w="44px" h="24px" rounded="full" />
        </Flex>
      ))}
    </Box>
  );
}

export function NotificationsTab() {
  const { admin } = useAdmin();
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getNotifications().then((result) => {
      if (result.success) setPrefs(result.data);
      else toast.error(getApiErrorMessage(result, "Couldn't load preferences"));
      setLoading(false);
    });
  }, []);

  const channels: Pref[] = [
    {
      key: "emailNotifications",
      icon: Mail,
      title: "Email notifications",
      subtitle: admin?.email ?? "Account email",
    },
    {
      key: "browserPushNotifications",
      icon: Bell,
      title: "Browser push notifications",
      subtitle: "This device",
    },
  ];

  const toggle = async (key: PrefKey, value: boolean) => {
    if (!prefs || saving) return;
    const previous = prefs;
    // Optimistic flip — revert if the PATCH fails.
    setPrefs({ ...prefs, [key]: value });
    setSaving(true);
    const result = await updateNotifications({ [key]: value });
    if (result.success) {
      setPrefs(result.data);
    } else {
      setPrefs(previous);
      toast.error(getApiErrorMessage(result, "Couldn't update preference"));
    }
    setSaving(false);
  };

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
          {loading || !prefs ? (
            <SectionSkeleton />
          ) : (
            <Box borderWidth="1px" borderColor="gray.200" rounded="xl" px={5} py={1}>
              {TEACHING.map((p, i) => (
                <PrefRow
                  key={p.key}
                  pref={p}
                  checked={prefs[p.key]}
                  disabled={saving}
                  onChange={(v) => toggle(p.key, v)}
                  last={i === TEACHING.length - 1}
                />
              ))}
            </Box>
          )}
        </Stack>

        <Stack gap={3}>
          <Text fontWeight="semibold" color="gray.900">
            Delivery Channels
          </Text>
          {loading || !prefs ? (
            <SectionSkeleton />
          ) : (
            <Box borderWidth="1px" borderColor="gray.200" rounded="xl" px={5} py={1}>
              {channels.map((p, i) => (
                <PrefRow
                  key={p.key}
                  pref={p}
                  checked={prefs[p.key]}
                  disabled={saving}
                  onChange={(v) => toggle(p.key, v)}
                  last={i === channels.length - 1}
                />
              ))}
            </Box>
          )}
        </Stack>
      </Stack>
    </Flex>
  );
}
