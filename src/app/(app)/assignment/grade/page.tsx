"use client";

import {
  Box,
  Button,
  Flex,
  Grid,
  HStack,
  Heading,
  Input,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { ArrowLeft, ChevronLeft, ChevronRight, CircleCheck, FileText } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { PageTopBar, StatusBadge } from "@/components/assignment/shared";
import { assignmentPaths } from "@/lib/routes";
import { getAssignment, gradeLetter, gradeSubmission } from "@/lib/mock/assignments";

const QUICK_FEEDBACK = [
  "Excellent work - keep it up!",
  "Watch arrangement of past participles",
  "Try varying your sentence openers",
];

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

  const assignment = getAssignment(assignmentId);
  const subIndex =
    assignment?.submissions.findIndex((s) => s.id === submissionId) ?? -1;
  const submission = subIndex >= 0 ? assignment!.submissions[subIndex] : undefined;

  const isRubric = assignment?.gradingMethod === "rubric";

  const [mode, setMode] = useState<"edit" | "graded">(
    submission?.status === "graded" ? "graded" : "edit",
  );
  const [manualScore, setManualScore] = useState<number>(submission?.grade ?? 0);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<string>(submission?.feedback ?? "");

  const score = !isRubric
    ? manualScore
    : (assignment?.rubric
        .filter((c) => checked.has(c.id))
        .reduce((sum, c) => sum + c.points, 0) ?? 0);

  if (!assignment || !submission) {
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

  const { letter, color } = gradeLetter(score);

  const goTo = (idx: number) => {
    const next = assignment.submissions[idx];
    if (next) router.push(assignmentPaths.grade(assignment.id, next.id));
  };

  const handleGrade = () => {
    gradeSubmission(assignment.id, submission.id, score, feedback);
    setMode("graded");
    toast.success("Submission Graded", {
      description: "This submission has been graded successfully.",
    });
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
            onClick={() => router.push(assignmentPaths.details(assignment.id))}
            color="gray.500"
            cursor="pointer"
            _hover={{ color: "gray.800" }}
          >
            <ArrowLeft size={20} />
          </Box>
          <HStack gap={3}>
            <NavCircle onClick={() => goTo(subIndex - 1)} disabled={subIndex <= 0}>
              <ChevronLeft size={18} />
            </NavCircle>
            <NavCircle
              onClick={() => goTo(subIndex + 1)}
              disabled={subIndex >= assignment.submissions.length - 1}
            >
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
          {submission.email}
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
                  Submitted {submission.submittedAgo}
                </Text>
              </Flex>
              <Text fontSize="sm" color="gray.600" lineHeight="1.8" whiteSpace="pre-line">
                {submission.answer}
              </Text>
            </Box>

            {submission.attachments.length > 0 ? (
              <Box bg="white" rounded="xl" borderWidth="1px" borderColor="gray.200" p={6}>
                <Text fontWeight="semibold" color="gray.900" mb={2}>
                  Attachments
                </Text>
                <Stack gap={0}>
                  {submission.attachments.map((att) => (
                    <Flex
                      key={att.id}
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
                  /100
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
                    {assignment.rubric.map((c) => {
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
                              {c.label}
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
