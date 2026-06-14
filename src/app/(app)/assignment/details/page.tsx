"use client";

import {
  Box,
  Button,
  Flex,
  Grid,
  HStack,
  Heading,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react";
import { AlertCircle, ArrowLeft, FileText, Inbox } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { MetaItem, NumberCard, PageTopBar, StatusBadge } from "@/components/assignment/shared";
import { assignmentPaths } from "@/lib/routes";
import {
  type Submission,
  deleteAssignment,
  getAssignment,
  submissionStats,
} from "@/lib/mock/assignments";

const AVATAR_COLORS = ["#F97461", "#6366F1", "#10B981", "#F59E0B", "#EC4899"];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const SUB_COLS = "1.4fr 1.4fr 0.8fr 0.9fr 1fr 0.8fr";

function SubmissionRow({
  submission,
  index,
  onAction,
}: {
  submission: Submission;
  index: number;
  onAction: () => void;
}) {
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const isGraded = submission.status === "graded";
  return (
    <Grid
      templateColumns={SUB_COLS}
      alignItems="center"
      gap={4}
      px={5}
      py={4}
      borderTopWidth="1px"
      borderColor="gray.100"
    >
      <HStack gap={3}>
        <Flex
          w="32px"
          h="32px"
          rounded="full"
          bg={`${color}22`}
          color={color}
          align="center"
          justify="center"
          fontSize="xs"
          fontWeight="semibold"
          flexShrink={0}
        >
          {initials(submission.studentName)}
        </Flex>
        <Text fontSize="sm" fontWeight="medium" color="gray.900">
          {submission.studentName}
        </Text>
      </HStack>
      <Text fontSize="sm" color="gray.700">
        {submission.email}
      </Text>
      <Text fontSize="sm" color="gray.700">
        {submission.grade != null ? `${submission.grade}/100` : "—"}
      </Text>
      <Text fontSize="sm" color="gray.700">
        {submission.submittedAgo}
      </Text>
      <Box>
        <StatusBadge status={submission.status} />
      </Box>
      <Box
        as="button"
        onClick={onAction}
        px={4}
        py={1.5}
        rounded="md"
        borderWidth="1px"
        borderColor="gray.200"
        bg="white"
        fontSize="sm"
        fontWeight="medium"
        color="gray.700"
        cursor="pointer"
        w="fit-content"
        _hover={{ bg: "gray.50" }}
      >
        {isGraded ? "Review" : "Grade"}
      </Box>
    </Grid>
  );
}

export default function AssignmentDetailPage() {
  const router = useRouter();
  const params = useSearchParams();
  const assignment = getAssignment(params.get("assignmentId"));

  const [tab, setTab] = useState<"overview" | "instructions">("overview");
  const [reminderSent, setReminderSent] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (!assignment) {
    return (
      <Box>
        <PageTopBar />
        <Flex direction="column" align="center" justify="center" py="160px" gap={3}>
          <Text fontWeight="semibold" color="gray.900">
            Assignment not found
          </Text>
          <Button variant="outline" rounded="full" onClick={() => router.push(assignmentPaths.list)}>
            Back to assignments
          </Button>
        </Flex>
      </Box>
    );
  }

  const stats = submissionStats(assignment);

  const handleSendReminder = () => {
    setReminderSent(true);
    toast.success("Reminder Sent", {
      description: "A reminder has been sent out to all students.",
    });
  };

  const handleDelete = () => {
    deleteAssignment(assignment.id);
    setConfirmingDelete(false);
    toast.success("Assignment Deleted", {
      description: "This assignment has been deleted successfully.",
    });
    router.push(assignmentPaths.list);
  };

  return (
    <Box pb={10}>
      <PageTopBar />

      <Box px={8}>
        {/* Back + actions */}
        <Flex justify="space-between" align="flex-start" gap={4}>
          <Box>
            <Box
              as="button"
              onClick={() => router.push(assignmentPaths.list)}
              color="gray.500"
              mb={3}
              cursor="pointer"
              _hover={{ color: "gray.800" }}
            >
              <ArrowLeft size={20} />
            </Box>
            <HStack gap={2} mb={2} fontSize="sm">
              <Text color="gray.400">Assignment</Text>
              <Text color="gray.300">›</Text>
              <Text color="#2E2F6F" fontWeight="medium">
                {assignment.title}
              </Text>
            </HStack>
            <Heading as="h1" size="xl" color="gray.900" mb={1}>
              {assignment.title}
            </Heading>
            <Text fontSize="sm" color="gray.500" mb={5}>
              {assignment.courseName}
            </Text>
            <HStack gap={10} align="flex-start">
              <MetaItem label="Due date">{assignment.dueDate}</MetaItem>
              <MetaItem label="Assigned to">All ({assignment.assignedTo})</MetaItem>
              <MetaItem label="Submissions">
                {stats.submitted}/{assignment.assignedTo}
              </MetaItem>
              <MetaItem label="Completion">{stats.completion}%</MetaItem>
            </HStack>
          </Box>

          <HStack gap={3} pt={1}>
            <Box
              as="button"
              onClick={() => setConfirmingDelete(true)}
              color="#EF4444"
              fontSize="sm"
              fontWeight="medium"
              px={2}
              cursor="pointer"
              _hover={{ color: "#DC2626" }}
            >
              Delete
            </Box>
            <Button
              variant="outline"
              rounded="full"
              h="40px"
              px={5}
              fontSize="sm"
              fontWeight="medium"
              disabled={reminderSent}
              onClick={handleSendReminder}
            >
              {reminderSent ? "Reminder sent" : "Send reminder"}
            </Button>
            <Button
              bg="#2E2F6F"
              color="white"
              rounded="full"
              h="40px"
              px={5}
              fontSize="sm"
              fontWeight="medium"
              _hover={{ bg: "#262760" }}
              onClick={() =>
                toast.success("Export started", {
                  description: "Your submissions export will download shortly.",
                })
              }
            >
              Export submissions
            </Button>
          </HStack>
        </Flex>

        {/* Tabs */}
        <Box borderBottomWidth="1px" borderColor="gray.200" mt={8} mb={6}>
          <HStack gap={8}>
            {(["overview", "instructions"] as const).map((t) => {
              const active = tab === t;
              return (
                <Box
                  key={t}
                  onClick={() => setTab(t)}
                  pb={3}
                  borderBottomWidth="2px"
                  borderColor={active ? "#2E2F6F" : "transparent"}
                  cursor="pointer"
                  textTransform="capitalize"
                >
                  <Text
                    fontSize="sm"
                    fontWeight={active ? "semibold" : "medium"}
                    color={active ? "#2E2F6F" : "gray.500"}
                  >
                    {t}
                  </Text>
                </Box>
              );
            })}
          </HStack>
        </Box>

        {tab === "overview" ? (
          <Stack gap={6}>
            <HStack gap={5} align="stretch">
              <NumberCard label="Submitted" value={stats.submitted} />
              <NumberCard label="Pending" value={stats.pending} />
              <NumberCard label="Graded" value={stats.graded} />
              <NumberCard
                label="Avg Score"
                value={stats.graded > 0 ? `${stats.avgScore}/100` : 0}
              />
            </HStack>

            <Heading as="h2" size="md" color="gray.900">
              Submissions
            </Heading>

            {assignment.submissions.length === 0 ? (
              <Flex
                direction="column"
                align="center"
                justify="center"
                py="80px"
                gap={3}
                color="gray.400"
              >
                <Inbox size={36} />
                <Stack gap={0.5} textAlign="center">
                  <Text fontWeight="semibold" color="gray.900">
                    No submissions yet
                  </Text>
                  <Text fontSize="sm">
                    Submission for this assignment will appear here
                  </Text>
                </Stack>
              </Flex>
            ) : (
              <Box bg="white" rounded="xl" borderWidth="1px" borderColor="gray.200">
                <Grid templateColumns={SUB_COLS} gap={4} px={5} py={3.5} bg="gray.50" roundedTop="xl">
                  <Text fontSize="sm" color="gray.500">Student</Text>
                  <Text fontSize="sm" color="gray.500">Email</Text>
                  <Text fontSize="sm" color="gray.500">Grade</Text>
                  <Text fontSize="sm" color="gray.500">Submitted</Text>
                  <Text fontSize="sm" color="gray.500">Status</Text>
                  <Text fontSize="sm" color="gray.500">Action</Text>
                </Grid>
                {assignment.submissions.map((s, i) => (
                  <SubmissionRow
                    key={s.id}
                    submission={s}
                    index={i}
                    onAction={() =>
                      router.push(assignmentPaths.grade(assignment.id, s.id))
                    }
                  />
                ))}
                <Flex justify="space-between" align="center" px={5} py={4} borderTopWidth="1px" borderColor="gray.100">
                  <Text fontSize="sm" color="gray.500">Page 1 of 10</Text>
                  <HStack gap={2}>
                    {["Previous", "Next"].map((l) => (
                      <Box key={l} as="button" px={4} py={2} rounded="md" borderWidth="1px" borderColor="gray.200" bg="white" fontSize="sm" fontWeight="medium" color="gray.700" cursor="pointer" _hover={{ bg: "gray.50" }}>
                        {l}
                      </Box>
                    ))}
                  </HStack>
                </Flex>
              </Box>
            )}
          </Stack>
        ) : (
          <Stack gap={6} maxW="760px">
            <Stack gap={3}>
              <Text fontWeight="semibold" color="gray.900">
                Instructions
              </Text>
              <Text fontSize="sm" color="gray.600" lineHeight="1.7">
                {assignment.instructions}
              </Text>
            </Stack>
            {assignment.attachments.length > 0 ? (
              <Stack gap={3}>
                <Text fontWeight="semibold" color="gray.900">
                  Attachments
                </Text>
                <Stack gap={0}>
                  {assignment.attachments.map((att) => (
                    <Flex
                      key={att.id}
                      justify="space-between"
                      align="center"
                      py={4}
                      borderBottomWidth="1px"
                      borderColor="gray.100"
                    >
                      <HStack gap={3}>
                        <FileText size={18} color="#6B7280" />
                        <Text fontSize="sm" color="gray.700">
                          {att.name}
                        </Text>
                      </HStack>
                      <Box
                        as="button"
                        fontSize="sm"
                        fontWeight="medium"
                        color="gray.900"
                        cursor="pointer"
                        onClick={() => toast.success(`Downloading ${att.name}`)}
                      >
                        Download
                      </Box>
                    </Flex>
                  ))}
                </Stack>
              </Stack>
            ) : null}
          </Stack>
        )}
      </Box>

      {/* Delete confirmation */}
      {confirmingDelete ? (
        <Portal>
          <Box
            position="fixed"
            inset={0}
            bg="blackAlpha.600"
            zIndex={200}
            display="flex"
            alignItems="center"
            justifyContent="center"
            px={4}
            onClick={() => setConfirmingDelete(false)}
          >
            <Box
              bg="white"
              rounded="2xl"
              p={8}
              w="full"
              maxW="460px"
              boxShadow="2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Stack gap={5} align="center" textAlign="center">
                <Flex w="56px" h="56px" rounded="full" bg="#FEE2E2" align="center" justify="center">
                  <AlertCircle size={26} color="#DC2626" />
                </Flex>
                <Stack gap={2}>
                  <Heading as="h3" size="md" color="gray.900">
                    Delete assignment?
                  </Heading>
                  <Text fontSize="sm" color="gray.500" lineHeight="1.6">
                    Deleting this assignment will remove all submissions, grades
                    and attached resources.
                  </Text>
                </Stack>
                <Stack gap={3} w="full">
                  <Button
                    bg="#2E2F6F"
                    color="white"
                    rounded="full"
                    h="48px"
                    fontSize="sm"
                    fontWeight="semibold"
                    _hover={{ bg: "#262760" }}
                    onClick={handleDelete}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="outline"
                    rounded="full"
                    h="48px"
                    fontSize="sm"
                    fontWeight="medium"
                    onClick={() => setConfirmingDelete(false)}
                  >
                    Cancel
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Box>
        </Portal>
      ) : null}
    </Box>
  );
}
