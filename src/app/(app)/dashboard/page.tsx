"use client";

import {
  Box,
  Flex,
  HStack,
  Heading,
  Link,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { ArrowUp, BookOpen, FileText, Plus } from "lucide-react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CourseCard } from "@/components/dashboard/course-card";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { QuickActionCard } from "@/components/dashboard/quick-action-card";
import { SearchInput } from "@/components/dashboard/search-input";
import { SegmentedTabs } from "@/components/dashboard/segmented-tabs";
import { StatCard } from "@/components/dashboard/stat-card";
import { StudentsChart } from "@/components/dashboard/students-chart";

const RANGE_TABS = [
  { value: "12m", label: "12 months" },
  { value: "30d", label: "30 days" },
  { value: "7d", label: "7 days" },
];

// Demo time series for the chart
const CHART_DATA = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  const base = 800 + i * 14;
  const wave = Math.sin(i * 0.9) * 60 + Math.cos(i * 0.5) * 30;
  return { day, students: Math.round(base + wave) };
});

const DATE_LINE = "Thursday, 23 April 2026 — 3 active courses";

export default function DashboardPage() {
  const router = useRouter();
  const [range, setRange] = useState("12m");

  return (
    <Box>
      <DashboardHeader title="Dashboard" notificationCount={3} />

      <Box px={8} py={6}>
        <Stack gap={6}>
          {/* Greeting */}
          <Stack gap={1}>
            <Heading as="h2" size="xl" color="gray.900">
              Good morning, John.
            </Heading>
            <Text fontSize="sm" color="gray.500">
              {DATE_LINE}
            </Text>
          </Stack>

          {/* Range tabs + search */}
          <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
            <SegmentedTabs
              tabs={RANGE_TABS}
              value={range}
              onChange={setRange}
            />
            <SearchInput placeholder="Search courses, students" />
          </Flex>

          {/* Stat cards */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4}>
            <StatCard label="Total Courses" value={12} changePercent={-7.5} />
            <StatCard label="Total Students" value="1,240" changePercent={40} />
            <StatCard
              label="Lessons Published"
              value={48}
              changePercent={-10}
            />
            <StatCard label="Avg Completion" value="72%" changePercent={20} />
          </SimpleGrid>

          {/* Active Courses + Quick Actions */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={4}>
            <Box
              bg="white"
              rounded="lg"
              borderWidth="1px"
              borderColor="gray.200"
              p={5}
            >
              <Flex justify="space-between" align="center" mb={4}>
                <Heading as="h3" size="md" color="gray.900">
                  Active Courses
                </Heading>
                <Link
                  as={NextLink}
                  href="/courses"
                  fontSize="sm"
                  color="#F97461"
                  fontWeight="semibold"
                  _hover={{ textDecoration: "underline" }}
                >
                  View All
                </Link>
              </Flex>
              <Flex gap={3} wrap="wrap">
                <CourseCard
                  level="A1"
                  status="Published"
                  title="French For Absolute Beginners"
                  modules={8}
                  lessons={32}
                  hours={6}
                  progressPercent={30}
                />
                <CourseCard
                  level="A2"
                  status="Published"
                  title="Everyday Conversations"
                  modules={6}
                  lessons={24}
                  hours={4}
                  progressPercent={50}
                />
              </Flex>
            </Box>

            <Box
              bg="white"
              rounded="lg"
              borderWidth="1px"
              borderColor="gray.200"
              p={5}
            >
              <Heading as="h3" size="md" color="gray.900" mb={4}>
                Quick Actions
              </Heading>
              <Flex gap={3} wrap="wrap">
                <QuickActionCard
                  icon={Plus}
                  title="Create Course"
                  description="Start curriculum builder"
                  onClick={() => router.push("/courses/new")}
                />
                <QuickActionCard
                  icon={BookOpen}
                  title="Add Lesson"
                  description="Build content blocks"
                />
                <QuickActionCard
                  icon={FileText}
                  title="Assign Content"
                  description="Set lessons & deadlines"
                  iconColor="#F97461"
                  iconBg="#FFE4DE"
                />
              </Flex>
            </Box>
          </SimpleGrid>

          {/* Students chart */}
          <Box
            bg="white"
            rounded="lg"
            borderWidth="1px"
            borderColor="gray.200"
            p={5}
          >
            <Stack gap={2} mb={4}>
              <Heading as="h3" size="md" color="gray.900">
                Total Students
              </Heading>
              <HStack gap={3}>
                <Heading
                  as="p"
                  size="2xl"
                  color="gray.900"
                  fontWeight="semibold"
                >
                  1,240
                </Heading>
                <HStack gap={1} color="#16A34A">
                  <ArrowUp size={14} />
                  <Text fontSize="sm" fontWeight="medium">
                    40%
                  </Text>
                </HStack>
              </HStack>
            </Stack>
            <StudentsChart data={CHART_DATA} />
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
