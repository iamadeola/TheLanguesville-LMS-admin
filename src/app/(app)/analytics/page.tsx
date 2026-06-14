"use client";

import { Box, Flex, Grid, HStack, Heading, Stack, Text } from "@chakra-ui/react";
import { ArrowDown, ArrowUp, FileText, Star } from "lucide-react";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import {
  COURSE_PERFORMANCE,
  DROP_OFFS,
  PERIOD_DATA,
  type Period,
} from "@/lib/mock/analytics";

const PERIODS: { value: Period; label: string }[] = [
  { value: "12months", label: "12 months" },
  { value: "30days", label: "30 days" },
  { value: "7days", label: "7days" },
];

function StatCard({ label, value, change }: { label: string; value: string; change: number }) {
  const isUp = change > 0;
  const color = change === 0 ? "#9CA3AF" : isUp ? "#16A34A" : "#EF4444";
  const Icon = isUp ? ArrowUp : ArrowDown;
  return (
    <Box bg="white" rounded="xl" borderWidth="1px" borderColor="gray.200" p={5} flex="1" minW="0">
      <Stack gap={3}>
        <Text fontSize="sm" color="gray.700">
          {label}
        </Text>
        <Heading as="p" size="2xl" color="gray.900" fontWeight="bold">
          {value}
        </Heading>
        <HStack gap={1}>
          {change !== 0 ? <Icon size={14} color={color} /> : null}
          <Text fontSize="xs" color={color} fontWeight="medium">
            {Math.abs(change)}%
          </Text>
        </HStack>
      </Stack>
    </Box>
  );
}

const PERF_COLS = "1.8fr 0.7fr 0.9fr 1.1fr 0.9fr 0.8fr";

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("12months");
  const data = PERIOD_DATA[period];
  const hasData = COURSE_PERFORMANCE.length > 0;

  return (
    <Box>
      <DashboardHeader
        title="Analytics"
        notificationCount={1}
        user={{ name: "John Doe", role: "Instructor" }}
      />

      <Box px={8} py={6}>
        <Stack gap={1} mb={6}>
          <Heading as="h2" size="xl" color="gray.900">
            Performance Overview
          </Heading>
          <Text fontSize="sm" color="gray.500">
            Track completion, engagement, and identify drop-off points in your courses.
          </Text>
        </Stack>

        {/* Period segmented control */}
        <HStack gap={0} bg="white" borderWidth="1px" borderColor="gray.200" rounded="lg" p={1} w="fit-content" mb={6}>
          {PERIODS.map((p) => {
            const active = period === p.value;
            return (
              <Box
                key={p.value}
                as="button"
                onClick={() => setPeriod(p.value)}
                px={4}
                py={2}
                rounded="md"
                fontSize="sm"
                fontWeight="medium"
                bg={active ? "gray.100" : "transparent"}
                color={active ? "gray.900" : "gray.500"}
                cursor="pointer"
                _hover={active ? undefined : { color: "gray.700" }}
              >
                {p.label}
              </Box>
            );
          })}
        </HStack>

        {/* Stat cards */}
        <HStack gap={5} align="stretch" mb={6}>
          {data.stats.map((s) => (
            <StatCard
              key={s.label}
              label={s.label}
              value={hasData ? s.value : s.label === "Time per Lesson" ? "0" : "0%"}
              change={hasData ? s.change : 0}
            />
          ))}
        </HStack>

        {/* Engagement + Drop-offs */}
        <Grid templateColumns={{ base: "1fr", lg: "1.6fr 1fr" }} gap={6} mb={8}>
          <Box bg="white" rounded="xl" borderWidth="1px" borderColor="gray.200" p={6}>
            <Stack gap={0} mb={2}>
              <Text fontWeight="semibold" color="gray.900">
                Course Engagement
              </Text>
              <Text fontSize="sm" color="gray.500">
                Active course sessions
              </Text>
            </Stack>
            <Heading as="p" size="xl" color="gray.900" mb={2}>
              {hasData ? data.engagementTotal.toLocaleString() : 0}
            </Heading>
            <Box w="full" h="240px">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hasData ? data.series : []} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="engGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F97461" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#F97461" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#F3F4F6" vertical={false} />
                  <XAxis
                    dataKey="x"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#9CA3AF", fontSize: 12 }}
                    interval={period === "30days" ? 1 : 0}
                    tickFormatter={(v: string) =>
                      period === "30days" ? (Number(v) % 2 === 0 ? v : "") : v
                    }
                  />
                  <Tooltip
                    cursor={{ stroke: "#F97461", strokeWidth: 1, strokeDasharray: "4" }}
                    contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#F97461" strokeWidth={2} fill="url(#engGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Box>

          <Box bg="white" rounded="xl" borderWidth="1px" borderColor="gray.200" p={6}>
            <Stack gap={0} mb={5}>
              <Text fontWeight="semibold" color="gray.900">
                Drop-off Points
              </Text>
              <Text fontSize="sm" color="gray.500">
                Lesson where students disengage
              </Text>
            </Stack>
            {hasData ? (
              <Stack gap={5}>
                {DROP_OFFS.map((d) => (
                  <Stack key={d.id} gap={2}>
                    <Stack gap={0}>
                      <Text fontSize="sm" fontWeight="medium" color="gray.900">
                        {d.lesson}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {d.course}
                      </Text>
                    </Stack>
                    <HStack gap={3}>
                      <Box flex="1" bg="gray.100" rounded="full" h="6px">
                        <Box bg="#2E2F6F" rounded="full" h="6px" w={`${d.percent}%`} />
                      </Box>
                      <Text fontSize="xs" color="gray.500" w="32px" textAlign="right">
                        {d.percent}%
                      </Text>
                    </HStack>
                  </Stack>
                ))}
              </Stack>
            ) : (
              <Flex direction="column" align="center" justify="center" py="60px" gap={2} color="gray.400">
                <FileText size={32} />
                <Text fontWeight="semibold" color="gray.900">
                  No drop-offs yet
                </Text>
                <Text fontSize="sm">Drop-off lessons will appear here</Text>
              </Flex>
            )}
          </Box>
        </Grid>

        {/* Course performance */}
        <Heading as="h3" size="md" color="gray.900" mb={4}>
          Course Performance
        </Heading>
        {hasData ? (
          <Box bg="white" rounded="xl" borderWidth="1px" borderColor="gray.200">
            <Grid templateColumns={PERF_COLS} gap={4} px={5} py={3.5} bg="gray.50" roundedTop="xl">
              {["Course", "Level", "Students", "Avg Completion", "Engagement", "Rating"].map((h) => (
                <Text key={h} fontSize="sm" color="gray.500">
                  {h}
                </Text>
              ))}
            </Grid>
            {COURSE_PERFORMANCE.map((c) => (
              <Grid
                key={c.id}
                templateColumns={PERF_COLS}
                gap={4}
                px={5}
                py={4}
                alignItems="center"
                borderTopWidth="1px"
                borderColor="gray.100"
              >
                <Text fontSize="sm" color="gray.900" fontWeight="medium">
                  {c.course}
                </Text>
                <Text fontSize="sm" color="gray.700">
                  {c.level}
                </Text>
                <Text fontSize="sm" color="gray.700">
                  {c.students}
                </Text>
                <Stack gap={1.5}>
                  <Text fontSize="sm" color="gray.700">
                    {c.completion}%
                  </Text>
                  <Box bg="gray.100" rounded="full" h="6px" w="80%">
                    <Box bg="#2E2F6F" rounded="full" h="6px" w={`${c.completion}%`} />
                  </Box>
                </Stack>
                <Text fontSize="sm" color="gray.700">
                  {c.engagement}%
                </Text>
                <HStack gap={1}>
                  <Star size={14} color="#F59E0B" fill="#F59E0B" />
                  <Text fontSize="sm" color="gray.700">
                    {c.rating.toFixed(1)}
                  </Text>
                </HStack>
              </Grid>
            ))}
            <Flex justify="space-between" align="center" px={5} py={4} borderTopWidth="1px" borderColor="gray.100">
              <Text fontSize="sm" color="gray.500">
                Page 1 of 10
              </Text>
              <HStack gap={2}>
                {["Previous", "Next"].map((l) => (
                  <Box key={l} as="button" px={4} py={2} rounded="md" borderWidth="1px" borderColor="gray.200" bg="white" fontSize="sm" fontWeight="medium" color="gray.700" cursor="pointer" _hover={{ bg: "gray.50" }}>
                    {l}
                  </Box>
                ))}
              </HStack>
            </Flex>
          </Box>
        ) : (
          <Flex direction="column" align="center" justify="center" py="80px" gap={2} color="gray.400">
            <FileText size={32} />
            <Text fontWeight="semibold" color="gray.900">
              No data yet
            </Text>
            <Text fontSize="sm">Performance per course will appear here</Text>
          </Flex>
        )}
      </Box>
    </Box>
  );
}
