"use client";

import { roleLabel } from "@/lib/api/auth";
import { Box, HStack, Text } from "@chakra-ui/react";
import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { NotificationsTab } from "@/components/settings/notifications-tab";
import { ProfileTab } from "@/components/settings/profile-tab";
import { SecurityTab } from "@/components/settings/security-tab";
import { useAdmin } from "@/lib/hooks/use-admin";

type Tab = "profile" | "notifications" | "security";

const TABS: { value: Tab; label: string }[] = [
  { value: "profile", label: "Profile" },
  { value: "notifications", label: "Notifications" },
  { value: "security", label: "Security" },
];

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("profile");
  const { admin, loading: adminLoading } = useAdmin();

  return (
    <Box>
      <DashboardHeader
        title="Settings"
        notificationCount={1}
        loading={adminLoading}
        user={
          admin
            ? {
                name: `${admin.firstName} ${admin.lastName}`.trim(),
                role: roleLabel(admin.role),
              }
            : undefined
        }
      />

      <Box px={8} py={6}>
        {/* Tabs */}
        <Box borderBottomWidth="1px" borderColor="gray.200" mb={10}>
          <HStack gap={8}>
            {TABS.map((t) => {
              const active = tab === t.value;
              return (
                <Box
                  key={t.value}
                  onClick={() => setTab(t.value)}
                  pb={3}
                  borderBottomWidth="2px"
                  borderColor={active ? "#2E2F6F" : "transparent"}
                  cursor="pointer"
                >
                  <Text
                    fontSize="sm"
                    fontWeight={active ? "semibold" : "medium"}
                    color={active ? "#2E2F6F" : "gray.500"}
                  >
                    {t.label}
                  </Text>
                </Box>
              );
            })}
          </HStack>
        </Box>

        {tab === "profile" ? <ProfileTab /> : null}
        {tab === "notifications" ? <NotificationsTab /> : null}
        {tab === "security" ? <SecurityTab /> : null}
      </Box>
    </Box>
  );
}
