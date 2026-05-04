"use client";

import { Box, Flex, HStack, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SearchInput } from "@/components/dashboard/search-input";
import { StatCard } from "@/components/dashboard/stat-card";
import { AppButton } from "@/components/ui/app-button";

interface CoursesTab {
  value: "all" | "published" | "draft";
  label: string;
  count?: number;
}

const TABS: CoursesTab[] = [
  { value: "all", label: "All", count: 2 },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
];

export default function CoursesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<CoursesTab["value"]>("all");

  return (
    <Box>
      <DashboardHeader title="Courses" notificationCount={3} />

      <Box px={8} py={6}>
        <Stack gap={6}>
          {/* Underline tabs */}
          <Box borderBottomWidth="1px" borderColor="gray.200">
            <HStack gap={6}>
              {TABS.map((tab) => {
                const active = tab.value === activeTab;
                return (
                  <Box
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    pb={3}
                    borderBottomWidth="2px"
                    borderColor={active ? "#2E2F6F" : "transparent"}
                    cursor="pointer"
                  >
                    <HStack gap={2}>
                      <Text
                        fontSize="sm"
                        fontWeight={active ? "semibold" : "medium"}
                        color={active ? "#2E2F6F" : "gray.500"}
                      >
                        {tab.label}
                      </Text>
                      {tab.count !== undefined ? (
                        <Box
                          bg={active ? "#E8E9F5" : "gray.100"}
                          color={active ? "#2E2F6F" : "gray.500"}
                          fontSize="xs"
                          fontWeight="semibold"
                          rounded="full"
                          px={2}
                          py={0.5}
                          minW="20px"
                          textAlign="center"
                        >
                          {tab.count}
                        </Box>
                      ) : null}
                    </HStack>
                  </Box>
                );
              })}
            </HStack>
          </Box>

          {/* Search + New course */}
          <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
            <SearchInput placeholder="Search a course..." />
            <Box w="auto">
              <AppButton
                w="auto"
                px={5}
                onClick={() => router.push("/courses/new")}
              >
                <HStack gap={2}>
                  <Plus size={16} />
                  <Text>New course</Text>
                </HStack>
              </AppButton>
            </Box>
          </Flex>

          {/* Stat cards */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4}>
            <StatCard label="Total Courses" value={18} changePercent={-7.5} />
            <StatCard label="Total Students" value="4,860" changePercent={40} />
            <StatCard
              label="Lessons Published"
              value={320}
              changePercent={-10}
            />
            <StatCard label="Avg Completion" value="68%" changePercent={20} />
          </SimpleGrid>
        </Stack>
      </Box>
    </Box>
  );
}
