"use client";

import {
  Box,
  Button,
  Flex,
  Grid,
  HStack,
  Heading,
  Input,
  Link,
  Skeleton,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { ArrowLeft, ChevronLeft, ChevronRight, CircleCheck, FileText } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { PageTopBar, StatusBadge } from "@/components/assignment/shared";
import { assignmentPaths } from "@/lib/routes";
import { getApiErrorMessage } from "@/lib/api/client";
import {
  type GradingView,
  getSubmission,
  gradeLetter,
  gradeSubmission,
} from "@/lib/api/assignments";

const QUICK_FEEDBACK = [
  "Excellent work - keep it up!",
  "Watch arrangement of past participles",
  "Try varying your sentence openers",
];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  if (Number.isNaN(diff)) return "—";
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

function NavCircle({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <Flex
      as="button"
      onClick={disabled ? undefined : onClick}
      w="40px"
      h="40px"
      rounded="full"
      borderWidth="1px"
      borderColor="gray.200"
      bg="white"
      align="center"
      justify="center"
      color="gray.600"
      opacity={disabled ? 0.4 : 1}
      cursor={disabled ? "not-allowed" : "pointer"}
      _hover={disabled ? undefined : { bg: "gray.50" }}
    >
      {children}
    </Flex>
  );
}

export default function GradeSubmissionPage() {
  const router = useRouter();
  const params = useSearchParams();
  const assignmentId = params.get("assignmentId");
  const submissionId = params.get("submissionId");

  const [view, setView] = useState<GradingView | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);

  const [mode, setMode] = useState<"edit" | "graded">("edit");
  const [manualScore, setManualScore] = useState(0);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState("");

  const load = useCallback(async () => {
    if (!assignmentId || !submissionId) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    const result = await getSubmission(assignmentId, submissionId);
    if (result.success) {
      const { submission } = result.data;
      setView(result.data);
      setMode(submission.status === "graded" ? "graded" : "edit");
      setManualScore(submission.score ?? 0);
      setFeedback(submission.feedback ?? "");
      // Seed rubric selection from any previously-awarded marks.
      setChecked(
        new Set(
          submission.rubricMarks
            .filter((m) => m.awarded)
            .map((m) => m.criterionId),
        ),
      );
    } else {
      setNotFound(true);
    }
    setLoading(false);
  }, [assignmentId, submissionId]);

  useEffect(() => {
    const id = setTimeout(load, 0);
    return () => clearTimeout(id);
  }, [load]);

  if (loading) {
    return (
      <Box pb={10}>
        <PageTopBar />
        <Box px={8}>
          <Skeleton h="28px" w="240px" rounded="md" mb={2} />
          <Skeleton h="16px" w="180px" rounded="md" mb={6} />
          <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
            <Skeleton h="320px" rounded="xl" />
            <Skeleton h="320px" rounded="xl" />
          </Grid>
        </Box>
      </Box>
    );
  }

  if (notFound || !view) {
    return (
      <Box>
        <PageTopBar />
        <Flex direction="column" align="center" justify="center" py="160px" gap={3}>
          <Text fontWeight="semibold" color="gray.900">
            Submission not found
          </Text>
          <Button variant="outline" rounded="full" onClick={() => router.push(assignmentPaths.list)}>
            Back to assignments
          </Button>
        </Flex>
      </Box>
    );
  }

  const { submission, assignment, prevSubmissionId, nextSubmissionId } = view;
  const grading = assignment.grading;
  const isRubric = grading.method === "rubric";
  const totalPoints = grading.totalPoints;

  const score = isRubric
    ? grading.rubric
        .filter((c) => checked.has(c.id))
        .reduce((sum, c) => sum + c.points, 0)
    : manualScore;

  const { letter, color } = gradeLetter(score, totalPoints);

  const goTo = (id: string | null) => {
    if (id) router.push(assignmentPaths.grade(assignmentId!, id));
  };

  const handleGrade = async () => {
    if (!assignmentId || saving) return;
    if (!isRubric && (score < 0 || score > totalPoints)) {
      toast.error(`Score must be between 0 and ${totalPoints}`);
      return;
    }
    setSaving(true);
    const result = await gradeSubmission(
      assignmentId,
      submission._id,
      isRubric
        ? { awardedCriterionIds: [...checked], feedback }
        : { score, feedback },
    );
    if (result.success) {
      setView((prev) => (prev ? { ...prev, submission: result.data } : prev));
      setMode("graded");
      toast.success("Submission Graded", {
        description: "This submission has been graded successfully.",
      });
    } else {
      toast.error(getApiErrorMessage(result, "Couldn't grade submission"));
    }
    setSaving(false);
  };

  const appendFeedback = (chip: string) => {
    setFeedback((prev) => (prev ? `${prev} ${chip}` : chip));
  };

  return (
    <Box pb={10}>
      <PageTopBar />

      <Box px={8}>
        {/* Back + prev/next */}
        <Flex justify="space-between" align="center" mb={3}>
          <Box
            as="button"
            onClick={() => router.push(assignmentPaths.details(assignmentId!))}
            color="gray.500"
            cursor="pointer"
            _hover={{ color: "gray.800" }}
          >
            <ArrowLeft size={20} />
          </Box>
          <HStack gap={3}>
            <NavCircle onClick={() => goTo(prevSubmissionId)} disabled={!prevSubmissionId}>
              <ChevronLeft size={18} />
            </NavCircle>
            <NavCircle onClick={() => goTo(nextSubmissionId)} disabled={!nextSubmissionId}>
              <ChevronRight size={18} />
            </NavCircle>
          </HStack>
        </Flex>

        <HStack gap={2} mb={2} fontSize="sm">
          <Text color="gray.400">Submissions</Text>
          <Text color="gray.300">›</Text>
          <Text color="#2E2F6F" fontWeight="medium">
            Grading
          </Text>
        </HStack>
        <Heading as="h1" size="xl" color="gray.900" mb={1}>
          {submission.studentName}
        </Heading>
        <Text fontSize="sm" color="gray.500" mb={6}>
          {submission.studentEmail}
        </Text>

        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6} alignItems="start">
          {/* Left: submission + attachments */}
          <Stack gap={6}>
            <Box bg="white" rounded="xl" borderWidth="1px" borderColor="gray.200" p={6}>
              <Flex justify="space-between" align="center" mb={4}>
                <Text fontWeight="semibold" color="gray.900">
                  Student submission
                </Text>
                <Text fontSize="sm" color="gray.400">
                  Submitted {timeAgo(submission.submittedAt)}
                </Text>
              </Flex>
              {submission.content ? (
                <Text fontSize="sm" color="gray.600" lineHeight="1.8" whiteSpace="pre-line">
                  {submission.content}
                </Text>
              ) : submission.url ? (
                <Link
                  href={submission.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  fontSize="sm"
                  color="#2563EB"
                  textDecoration="underline"
                >
                  {submission.url}
                </Link>
              ) : (
                <Text fontSize="sm" color="gray.400">
                  No written response — see attachments.
                </Text>
              )}
            </Box>

            {submission.attachments.length > 0 ? (
              <Box bg="white" rounded="xl" borderWidth="1px" borderColor="gray.200" p={6}>
                <Text fontWeight="semibold" color="gray.900" mb={2}>
                  Attachments
                </Text>
                <Stack gap={0}>
                  {submission.attachments.map((att) => (
                    <Flex
                      key={att.fileUrl}
                      justify="space-between"
                      align="center"
                      py={4}
                      borderBottomWidth="1px"
                      borderColor="gray.100"
                      _last={{ borderBottomWidth: 0, pb: 0 }}
                    >
                      <HStack gap={3}>
                        <FileText size={18} color="#6B7280" />
                        <Text fontSize="sm" color="gray.700">
                          {att.fileName}
                        </Text>
                      </HStack>
                      <Link
                        href={att.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        fontSize="sm"
                        fontWeight="medium"
                        color="gray.900"
                        cursor="pointer"
                      >
                        Download
                      </Link>
                    </Flex>
                  ))}
                </Stack>
              </Box>
            ) : null}
          </Stack>

          {/* Right: scoring */}
          <Box bg="white" rounded="xl" borderWidth="1px" borderColor="gray.200" p={6}>
            <Flex justify="space-between" align="center" mb={5}>
              <Text fontWeight="semibold" color="gray.900">
                Score
              </Text>
              {mode === "graded" ? <StatusBadge status="graded" /> : null}
            </Flex>

            {/* Score display */}
            <Flex justify="space-between" align="center" pb={5} borderBottomWidth={mode === "graded" ? "1px" : "0"} borderColor="gray.100">
              <HStack gap={3} align="baseline">
                {mode === "graded" ? (
                  <Flex
                    w="64px"
                    h="64px"
                    rounded="lg"
                    bg="gray.50"
                    align="center"
                    justify="center"
                  >
                    <Text fontSize="2xl" fontWeight="bold" color="gray.900">
                      {score}
                    </Text>
                  </Flex>
                ) : (
                  <Input
                    type="number"
                    value={isRubric ? score : manualScore}
                    onChange={(e) => setManualScore(Number(e.target.value) || 0)}
                    readOnly={isRubric}
                    min={0}
                    max={totalPoints}
                    w="64px"
                    h="64px"
                    textAlign="center"
                    fontSize="2xl"
                    fontWeight="bold"
                    color="gray.900"
                    borderColor="gray.200"
                    rounded="lg"
                    p={0}
                    _focus={{ borderColor: "#2E2F6F", outline: "none", boxShadow: "none" }}
                  />
                )}
                <Text fontSize="xl" color="gray.400" fontWeight="medium">
                  /{totalPoints}
                </Text>
              </HStack>
              <Text fontSize="4xl" fontWeight="bold" color={color}>
                {letter}
              </Text>
            </Flex>

            {mode === "graded" ? (
              <Button
                w="full"
                bg="#2E2F6F"
                color="white"
                rounded="full"
                h="48px"
                mt={5}
                fontWeight="medium"
                _hover={{ bg: "#262760" }}
                onClick={() => setMode("edit")}
              >
                Re-grade submission
              </Button>
            ) : (
              <Stack gap={5} mt={5}>
                {/* Rubric criteria */}
                {isRubric ? (
                  <Stack gap={3}>
                    <Text fontWeight="semibold" color="gray.900">
                      Rubric criteria
                    </Text>
                    {grading.rubric.map((c) => {
                      const on = checked.has(c.id);
                      return (
                        <Flex
                          key={c.id}
                          as="button"
                          onClick={() => {
                            setChecked((prev) => {
                              const next = new Set(prev);
                              if (next.has(c.id)) next.delete(c.id);
                              else next.add(c.id);
                              return next;
                            });
                          }}
                          align="center"
                          justify="space-between"
                          borderWidth="1px"
                          borderColor="gray.200"
                          rounded="lg"
                          px={4}
                          py={3.5}
                          cursor="pointer"
                          _hover={{ borderColor: "gray.300" }}
                        >
                          <HStack gap={3}>
                            {on ? (
                              <CircleCheck size={20} color="#16A34A" fill="#16A34A" stroke="white" />
                            ) : (
                              <Box w="20px" h="20px" rounded="full" borderWidth="1.5px" borderColor="gray.300" />
                            )}
                            <Text fontSize="sm" color="gray.800">
                              {c.name}
                            </Text>
                          </HStack>
                          <Text fontSize="sm" color="gray.500">
                            {c.points}pts
                          </Text>
                        </Flex>
                      );
                    })}
                  </Stack>
                ) : null}

                {/* Feedback */}
                <Stack gap={2}>
                  <Text fontSize="sm" color="gray.700">
                    Feedback <Text as="span" color="gray.400">(optional)</Text>
                  </Text>
                  <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Share what worked well and what to improve upon..."
                    minH="110px"
                    fontSize="sm"
                    borderColor="gray.200"
                    rounded="lg"
                    resize="none"
                    _focus={{ borderColor: "#2E2F6F", outline: "none", boxShadow: "none" }}
                  />
                  <HStack gap={2} flexWrap="wrap">
                    {QUICK_FEEDBACK.map((chip) => (
                      <Box
                        key={chip}
                        as="button"
                        onClick={() => appendFeedback(chip)}
                        bg="gray.100"
                        color="gray.700"
                        fontSize="xs"
                        fontWeight="medium"
                        px={3}
                        py={1.5}
                        rounded="full"
                        cursor="pointer"
                        _hover={{ bg: "gray.200" }}
                      >
                        {chip}
                      </Box>
                    ))}
                  </HStack>
                </Stack>

                <Button
                  w="full"
                  bg="#2E2F6F"
                  color="white"
                  rounded="full"
                  h="48px"
                  fontWeight="medium"
                  _hover={{ bg: "#262760" }}
                  loading={saving}
                  disabled={saving}
                  onClick={handleGrade}
                >
                  Grade submission
                </Button>
              </Stack>
            )}
          </Box>
        </Grid>
      </Box>
    </Box>
  );
}
