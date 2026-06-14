"use client";

import {
  Box,
  Button,
  Flex,
  Grid,
  HStack,
  Heading,
  Input,
  Portal,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { Award, ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { NumberCard, PageTopBar } from "@/components/assignment/shared";
import { Avatar } from "@/components/shared/avatar";
import { studentPaths } from "@/lib/routes";
import { getStudent, type ActivityType, type Student } from "@/lib/mock/students";

const LEVEL_BADGE = { bg: "#EEF0FB", color: "#4338CA" };

function activityIcon(type: ActivityType) {
  if (type === "joined") return CalendarDays;
  return Award;
}

function SendMessageModal({ student, onClose }: { student: Student; onClose: () => void }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const canSend = subject.trim() !== "" && message.trim() !== "";

  const send = () => {
    onClose();
    toast.success("Message Delivered", {
      description: "Your message has been delivered successfully.",
    });
  };

  return (
    <Portal>
      <Box position="fixed" inset={0} bg="blackAlpha.600" zIndex={200} display="flex" alignItems="center" justifyContent="center" px={4} onClick={onClose}>
        <Box bg="white" rounded="2xl" p={7} w="full" maxW="460px" boxShadow="2xl" onClick={(e) => e.stopPropagation()}>
          <HStack gap={3} mb={5}>
            <Avatar name={student.name} size={44} />
            <Stack gap={0}>
              <Text fontWeight="bold" color="gray.900">
                {student.name}
              </Text>
              <Text fontSize="sm" color="gray.500">
                {student.email}
              </Text>
            </Stack>
          </HStack>

          <Stack gap={4}>
            <Stack gap={0}>
              <Text fontSize="sm" color="gray.700" mb={2}>
                Subject
              </Text>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="A clear, short subject line" h="48px" fontSize="sm" borderColor="gray.200" rounded="lg" _placeholder={{ color: "gray.400" }} _focus={{ borderColor: "#2E2F6F", outline: "none", boxShadow: "none" }} />
            </Stack>
            <Stack gap={0}>
              <Text fontSize="sm" color="gray.700" mb={2}>
                Message
              </Text>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write your message" minH="130px" resize="none" fontSize="sm" borderColor="gray.200" rounded="lg" _placeholder={{ color: "gray.400" }} _focus={{ borderColor: "#2E2F6F", outline: "none", boxShadow: "none" }} />
              <Text fontSize="xs" color="gray.400" textAlign="right" mt={1.5}>
                {message.length}/200
              </Text>
            </Stack>

            <Stack gap={3}>
              <Button rounded="full" h="48px" fontSize="sm" fontWeight="semibold" bg={canSend ? "#2E2F6F" : "#E5E7EB"} color={canSend ? "white" : "#9CA3AF"} _hover={canSend ? { bg: "#262760" } : { bg: "#E5E7EB" }} cursor={canSend ? "pointer" : "not-allowed"} disabled={!canSend} onClick={send}>
                Send message
              </Button>
              <Button variant="outline" rounded="full" h="48px" fontSize="sm" fontWeight="medium" onClick={onClose}>
                Cancel
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Portal>
  );
}

function EmptyCard({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <Flex direction="column" align="center" justify="center" py="50px" gap={2} color="gray.400">
      <FileText size={32} />
      <Text fontWeight="semibold" color="gray.900">
        {title}
      </Text>
      <Text fontSize="sm">{subtitle}</Text>
    </Flex>
  );
}

export default function StudentDetailPage() {
  const router = useRouter();
  const params = useSearchParams();
  const student = getStudent(params.get("studentId"));
  const [messageOpen, setMessageOpen] = useState(false);

  if (!student) {
    return (
      <Box>
        <PageTopBar />
        <Flex direction="column" align="center" justify="center" py="160px" gap={3}>
          <Text fontWeight="semibold" color="gray.900">
            Student not found
          </Text>
          <Button variant="outline" rounded="full" onClick={() => router.push(studentPaths.list)}>
            Back to students
          </Button>
        </Flex>
      </Box>
    );
  }

  return (
    <Box pb={10}>
      <PageTopBar />

      <Box px={8}>
        {/* Back + Message */}
        <Flex justify="space-between" align="flex-start">
          <Box>
            <Box as="button" onClick={() => router.push(studentPaths.list)} color="gray.500" mb={3} cursor="pointer" _hover={{ color: "gray.800" }}>
              <ArrowLeft size={20} />
            </Box>
            <HStack gap={2} mb={3} fontSize="sm">
              <Text color="gray.400">Students</Text>
              <Text color="gray.300">›</Text>
              <Text color="#2E2F6F" fontWeight="medium">
                {student.name}
              </Text>
            </HStack>
          </Box>
          <Button bg="#2E2F6F" color="white" rounded="full" h="40px" px={6} fontSize="sm" fontWeight="medium" _hover={{ bg: "#262760" }} onClick={() => setMessageOpen(true)}>
            Message
          </Button>
        </Flex>

        <HStack gap={4} mb={8}>
          <Avatar name={student.name} size={56} />
          <Stack gap={1}>
            <Heading as="h1" size="xl" color="gray.900">
              {student.name}
            </Heading>
            <HStack gap={2} fontSize="sm" color="gray.500">
              <Text>{student.email}</Text>
              <Text>•</Text>
              <Text>Last active {student.lastActive}</Text>
            </HStack>
          </Stack>
        </HStack>

        {/* Stat cards */}
        <HStack gap={5} align="stretch" mb={6}>
          <NumberCard label="Overall Progress" value={`${student.overallProgress}%`} />
          <NumberCard label="Avg. Grade" value={student.avgGrade} />
          <NumberCard label="Courses" value={student.coursesCount} />
          <NumberCard label="Day Streak" value={student.dayStreak} />
        </HStack>

        {/* Enrolled courses */}
        <Box bg="white" rounded="xl" borderWidth="1px" borderColor="gray.200" p={6} mb={6}>
          <Flex justify="space-between" align="center" mb={5}>
            <Heading as="h2" size="md" color="gray.900">
              Enrolled Courses
            </Heading>
            <HStack gap={3}>
              {[ChevronLeft, ChevronRight].map((Icon, i) => (
                <Flex key={i} w="36px" h="36px" rounded="full" borderWidth="1px" borderColor="gray.200" align="center" justify="center" color="gray.500" cursor="pointer" _hover={{ bg: "gray.50" }}>
                  <Icon size={16} />
                </Flex>
              ))}
            </HStack>
          </Flex>
          {student.enrolledCourses.length === 0 ? (
            <EmptyCard title="No enrolled courses yet" subtitle="Courses this student enrolled in will appear here" />
          ) : (
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={5}>
              {student.enrolledCourses.map((c) => (
                <Box key={c.id} borderWidth="1px" borderColor="gray.200" rounded="xl" p={5}>
                  <Box display="inline-block" bg={LEVEL_BADGE.bg} color={LEVEL_BADGE.color} fontSize="xs" fontWeight="semibold" px={2.5} py={1} rounded="full" mb={3}>
                    {c.level}
                  </Box>
                  <Text fontWeight="semibold" color="gray.900" mb={1}>
                    {c.title}
                  </Text>
                  <Text fontSize="sm" color="gray.500" mb={3} lineClamp={1}>
                    {c.description}
                  </Text>
                  <Text fontSize="xs" color="gray.400" mb={3}>
                    {c.modules} modules • {c.lessons} lessons • {c.duration}
                  </Text>
                  <HStack gap={3}>
                    <Box flex="1" bg="gray.100" rounded="full" h="6px">
                      <Box bg="#2E2F6F" rounded="full" h="6px" w={`${c.progress}%`} />
                    </Box>
                    <Text fontSize="xs" color="gray.500">
                      {c.progress}%
                    </Text>
                  </HStack>
                </Box>
              ))}
            </Grid>
          )}
        </Box>

        {/* Recent grades + activity */}
        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
          <Box bg="white" rounded="xl" borderWidth="1px" borderColor="gray.200" p={6}>
            <Flex justify="space-between" align="center" mb={4}>
              <Heading as="h3" size="md" color="gray.900">
                Recent Grades
              </Heading>
              {student.recentGrades.length > 0 ? (
                <Box as="button" fontSize="sm" color="#4338CA" fontWeight="medium" cursor="pointer" onClick={() => toast("Opening all grades…")}>
                  View All
                </Box>
              ) : null}
            </Flex>
            {student.recentGrades.length === 0 ? (
              <EmptyCard title="No grades yet" subtitle="Graded submissions will appear here" />
            ) : (
              <Stack gap={0}>
                {student.recentGrades.map((g) => (
                  <Flex key={g.id} justify="space-between" align="center" py={4} borderBottomWidth="1px" borderColor="gray.100" _last={{ borderBottomWidth: 0, pb: 0 }}>
                    <Stack gap={0}>
                      <Text fontSize="sm" fontWeight="medium" color="gray.900">
                        {g.title}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {g.course}
                      </Text>
                    </Stack>
                    <Text fontSize="sm" color="gray.900">
                      <Text as="span" fontWeight="bold">
                        {g.score}
                      </Text>
                      <Text as="span" color="gray.400">
                        /100
                      </Text>
                    </Text>
                  </Flex>
                ))}
              </Stack>
            )}
          </Box>

          <Box bg="white" rounded="xl" borderWidth="1px" borderColor="gray.200" p={6}>
            <Heading as="h3" size="md" color="gray.900" mb={4}>
              Recent Activity
            </Heading>
            {student.activity.length === 0 ? (
              <EmptyCard title="No activities yet" subtitle="Recent activities as they come in will appear here" />
            ) : (
              <Stack gap={5}>
                {student.activity.map((a) => {
                  const Icon = activityIcon(a.type);
                  return (
                    <HStack key={a.id} gap={3} align="flex-start">
                      <Flex w="36px" h="36px" rounded="full" bg="gray.100" align="center" justify="center" color="#4338CA" flexShrink={0}>
                        <Icon size={16} />
                      </Flex>
                      <Stack gap={0}>
                        <Text fontSize="sm" color="gray.900">
                          {a.text}
                        </Text>
                        <Text fontSize="xs" color="gray.400">
                          {a.time}
                        </Text>
                      </Stack>
                    </HStack>
                  );
                })}
              </Stack>
            )}
          </Box>
        </Grid>
      </Box>

      {messageOpen ? <SendMessageModal student={student} onClose={() => setMessageOpen(false)} /> : null}
    </Box>
  );
}
