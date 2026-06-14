"use client";

import { Box, Flex, Grid, HStack, Stack, Text } from "@chakra-ui/react";
import { FileText, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SearchInput } from "@/components/dashboard/search-input";
import { NumberCard, StatusBadge } from "@/components/assignment/shared";
import { AppButton } from "@/components/ui/app-button";
import { assignmentPaths } from "@/lib/routes";
import {
  type Assignment,
  TYPE_LABELS,
  getStats,
  listAssignments,
} from "@/lib/mock/assignments";

type TabValue = "all" | "active" | "overdue" | "draft";

const COLS = "1.6fr 1.4fr 0.9fr 1fr 0.9fr 0.7fr";

function PagerButton({ label }: { label: string }) {
  return (
    <Box
      as="button"
      px={4}
      py={2}
      rounded="md"
      borderWidth="1px"
      borderColor="gray.200"
      bg="white"
      fontSize="sm"
      fontWeight="medium"
      color="gray.700"
      cursor="pointer"
      _hover={{ bg: "gray.50" }}
    >
      {label}
    </Box>
  );
}

function HeaderCell({ children }: { children: React.ReactNode }) {
  return (
    <Text fontSize="sm" color="gray.500" fontWeight="medium">
      {children}
    </Text>
  );
}

function AssignmentRow({
  assignment,
  onClick,
}: {
  assignment: Assignment;
  onClick: () => void;
}) {
  return (
    <Grid
      templateColumns={COLS}
      alignItems="center"
      gap={4}
      px={5}
      py={4}
      borderTopWidth="1px"
      borderColor="gray.100"
      cursor="pointer"
      _hover={{ bg: "gray.50" }}
      transition="background 0.15s"
      onClick={onClick}
    >
      <Stack gap={0.5}>
        <Text fontSize="sm" fontWeight="medium" color="gray.900">
          {assignment.title}
        </Text>
        <Text fontSize="xs" color="gray.400">
          {TYPE_LABELS[assignment.type]}
        </Text>
      </Stack>
      <Text fontSize="sm" color="gray.700">
        {assignment.courseName}
      </Text>
      <Text fontSize="sm" color="gray.700">
        All ({assignment.assignedTo})
      </Text>
      <Text fontSize="sm" color="gray.700">
        {assignment.dueDate}
      </Text>
      <Box>
        <StatusBadge status={assignment.status} />
      </Box>
      <Text fontSize="sm" color="gray.700">
        {assignment.submissions.length}/{assignment.assignedTo}
      </Text>
    </Grid>
  );
}

export default function AssignmentListPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [search, setSearch] = useState("");

  const all = listAssignments();
  const stats = getStats();

  const visible = all.filter((a) => {
    const matchesTab =
      activeTab === "all" ? a.status !== "draft" : a.status === activeTab;
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const tabs: { value: TabValue; label: string; count?: number }[] = [
    {
      value: "all",
      label: "All",
      count: all.filter((a) => a.status !== "draft").length,
    },
    { value: "active", label: "Active" },
    { value: "overdue", label: "Overdue" },
    { value: "draft", label: "Draft" },
  ];

  const statCards: { label: string; value: number }[] = [
    { label: "Active", value: stats.active },
    { label: "Overdue", value: stats.overdue },
    { label: "Drafts", value: stats.drafts },
    { label: "Submission", value: stats.submissions },
  ];

  // Fully empty state (no assignments at all).
  if (all.length === 0) {
    return (
      <Box>
        <DashboardHeader
          title="Assignment"
          notificationCount={1}
          user={{ name: "John Doe", role: "Instructor" }}
        />
        <Flex direction="column" align="center" justify="center" py="160px" gap={4}>
          <Box color="gray.300">
            <FileText size={44} />
          </Box>
          <Stack gap={1} textAlign="center">
            <Text fontWeight="semibold" color="gray.900">
              No assignments yet
            </Text>
            <Text fontSize="sm" color="gray.500">
              Assignments created for this course will appear here for students
              to complete and submit.
            </Text>
          </Stack>
          <AppButton w="auto" px={6} onClick={() => router.push(assignmentPaths.new)}>
            <HStack gap={2}>
              <Plus size={16} />
              <Text>New assignment</Text>
            </HStack>
          </AppButton>
        </Flex>
      </Box>
    );
  }

  return (
    <Box>
      <DashboardHeader
        title="Assignment"
        notificationCount={1}
        user={{ name: "John Doe", role: "Instructor" }}
      />

      <Box px={8} py={6}>
        <Stack gap={6}>
          {/* Stat cards */}
          <HStack gap={4} align="stretch">
            {statCards.map((c) => (
              <NumberCard key={c.label} label={c.label} value={c.value} />
            ))}
          </HStack>

          {/* Tabs */}
          <Box borderBottomWidth="1px" borderColor="gray.200">
            <HStack gap={6}>
              {tabs.map((tab) => {
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
                      {tab.count != null ? (
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

          {/* Search + New assignment */}
          <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
            <SearchInput
              placeholder="Search assignments"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <AppButton
              w="auto"
              px={5}
              onClick={() => router.push(assignmentPaths.new)}
            >
              <HStack gap={2}>
                <Plus size={16} />
                <Text>New assignment</Text>
              </HStack>
            </AppButton>
          </Flex>

          {/* Table */}
          <Box bg="white" rounded="xl" borderWidth="1px" borderColor="gray.200">
            <Grid
              templateColumns={COLS}
              gap={4}
              px={5}
              py={3.5}
              bg="gray.50"
              roundedTop="xl"
            >
              <HeaderCell>Assignment</HeaderCell>
              <HeaderCell>Course</HeaderCell>
              <HeaderCell>Assigned to</HeaderCell>
              <HeaderCell>Due date</HeaderCell>
              <HeaderCell>Status</HeaderCell>
              <HeaderCell>Submitted</HeaderCell>
            </Grid>

            {visible.length === 0 ? (
              <Flex
                direction="column"
                align="center"
                justify="center"
                py="80px"
                gap={2}
                color="gray.400"
              >
                <FileText size={32} />
                <Text fontSize="sm" fontWeight="medium" color="gray.600">
                  No assignments found
                </Text>
                <Text fontSize="sm">
                  {search
                    ? "Try a different search term"
                    : "Nothing here for this filter yet"}
                </Text>
              </Flex>
            ) : (
              visible.map((a) => (
                <AssignmentRow
                  key={a.id}
                  assignment={a}
                  onClick={() => router.push(assignmentPaths.details(a.id))}
                />
              ))
            )}
          </Box>

          {/* Pagination */}
          <Flex justify="space-between" align="center">
            <Text fontSize="sm" color="gray.500">
              Page 1 of 10
            </Text>
            <HStack gap={2}>
              <PagerButton label="Previous" />
              <PagerButton label="Next" />
            </HStack>
          </Flex>
        </Stack>
      </Box>
    </Box>
  );
}
