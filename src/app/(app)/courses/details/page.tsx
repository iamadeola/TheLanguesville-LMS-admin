"use client";

import { roleLabel } from "@/lib/api/auth";
import {
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  IconButton,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Portal,
} from "@chakra-ui/react";
import {
  AlertTriangle,
  BookOpen,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { useAdmin } from "@/lib/hooks/use-admin";
import { coursePaths } from "@/lib/routes";
import {
  type ApiCourse,
  type ApiModuleDetail,
  getCourse,
  deleteCourse,
  publishCourse,
  unpublishCourse,
} from "@/lib/api/courses";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Box bg="white" borderWidth="1px" borderColor="gray.200" rounded="xl" p={5}>
      <Text fontSize="sm" color="gray.500" mb={3}>
        {label}
      </Text>
      <Text fontSize="2xl" fontWeight="bold" color="gray.900">
        {value}
      </Text>
    </Box>
  );
}

function ModuleRow({
  mod,
  index,
  courseId,
}: {
  mod: ApiModuleDetail;
  index: number;
  courseId: string;
}) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Box
      borderWidth="1px"
      borderColor="gray.200"
      rounded="xl"
      bg="white"
      overflow="hidden"
    >
      <Flex
        align="center"
        justify="space-between"
        px={5}
        py={4}
        cursor="pointer"
        onClick={() => setCollapsed((v) => !v)}
        _hover={{ bg: "gray.50" }}
      >
        <HStack gap={3}>
          <IconButton
            aria-label={collapsed ? "Expand" : "Collapse"}
            variant="ghost"
            size="xs"
            color="gray.400"
            onClick={(e) => {
              e.stopPropagation();
              setCollapsed((v) => !v);
            }}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
          </IconButton>
          <Stack gap={0}>
            <Text fontSize="xs" color="gray.400" fontWeight="medium">
              Module {index + 1}
            </Text>
            <Text fontSize="sm" fontWeight="semibold" color="gray.900">
              {mod.title}
            </Text>
          </Stack>
        </HStack>
        <Text fontSize="xs" color="gray.500">
          {mod.lessons.length} lesson{mod.lessons.length !== 1 ? "s" : ""}
        </Text>
      </Flex>

      {!collapsed &&
        mod.lessons.map((lesson, li) => (
          <Flex
            key={lesson._id}
            align="center"
            justify="space-between"
            px={5}
            py={3}
            borderTopWidth="1px"
            borderColor="gray.100"
            cursor="pointer"
            _hover={{ bg: "gray.50" }}
            onClick={() => router.push(coursePaths.lesson(courseId, lesson._id))}
          >
            <HStack gap={3}>
              <Text
                fontSize="sm"
                color="gray.400"
                minW="24px"
                fontWeight="medium"
              >
                {String(li + 1).padStart(2, "0")}
              </Text>
              <BookOpen size={14} color="#6B7280" />
              <Text fontSize="sm" color="gray.900" fontWeight="medium">
                {lesson.title}
              </Text>
            </HStack>
            <ChevronRight size={16} color="#9CA3AF" />
          </Flex>
        ))}
    </Box>
  );
}

function CohortProgressSection({ completionRate }: { completionRate: number }) {
  const mockStudents = [
    { name: "Margot B.", progress: completionRate },
    { name: "Theo D.", progress: completionRate },
    { name: "Camille M.", progress: completionRate },
  ];

  return (
    <Box bg="white" borderWidth="1px" borderColor="gray.200" rounded="xl" p={5}>
      <Text fontWeight="semibold" fontSize="md" color="gray.900" mb={4}>
        Cohort Progress
      </Text>
      <Stack gap={4}>
        {mockStudents.map((s) => (
          <Stack key={s.name} gap={1}>
            <Text fontSize="sm" color="gray.700">
              {s.name}
            </Text>
            <Flex align="center" gap={3}>
              <Box flex="1" bg="gray.100" rounded="full" h="8px">
                <Box
                  bg="#2E2F6F"
                  rounded="full"
                  h="8px"
                  w={`${s.progress}%`}
                  transition="width 0.4s"
                />
              </Box>
              <Text
                fontSize="xs"
                color="gray.500"
                minW="36px"
                textAlign="right"
              >
                {Math.round(s.progress)}%
              </Text>
            </Flex>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

function CourseDetailContent() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId") ?? "";
  const router = useRouter();
  const { admin, loading: adminLoading } = useAdmin();
  const [course, setCourse] = useState<ApiCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showUnpublishModal, setShowUnpublishModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!courseId) {
      router.replace(coursePaths.list);
      return;
    }
    async function load() {
      setLoading(true);
      const result = await getCourse(courseId);
      if (result.success) {
        setCourse(result.data);
      } else {
        toast.error(result.message || "Failed to load course");
        router.push(coursePaths.list);
      }
      setLoading(false);
    }
    void load();
  }, [courseId, router]);

  const handleConfirmDelete = async () => {
    setShowDeleteModal(false);
    setActionLoading(true);
    const result = await deleteCourse(courseId);
    if (result.success) {
      toast.success("Course deleted");
      router.push(coursePaths.list);
    } else {
      toast.error(result.message || "Failed to delete course");
      setActionLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!course) return;
    setActionLoading(true);
    const result = await publishCourse(courseId);
    if (result.success) {
      setCourse(result.data);
      toast.success("Course published!");
    } else {
      toast.error(result.message || "Failed to publish");
    }
    setActionLoading(false);
  };

  const handleConfirmUnpublish = async () => {
    setShowUnpublishModal(false);
    setActionLoading(true);
    const result = await unpublishCourse(courseId);
    if (result.success) {
      setCourse(result.data);
      toast.success("Course unpublished");
    } else {
      toast.error(result.message || "Failed to unpublish");
    }
    setActionLoading(false);
  };

  const totalLessons =
    course?.modules.reduce((s, m) => s + m.lessons.length, 0) ?? 0;

  return (
    <Box>
      <DashboardHeader
        title="Courses"
        notificationCount={3}
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
        {/* Back + actions row */}
        <Flex align="center" justify="space-between" mb={4}>
          <IconButton
            aria-label="Back"
            variant="ghost"
            size="sm"
            onClick={() => router.push(coursePaths.list)}
          >
            <ArrowLeft size={18} />
          </IconButton>

          {loading ? null : (
            <HStack gap={2}>
              <Button
                variant="ghost"
                color="#DC2626"
                fontWeight="semibold"
                fontSize="sm"
                h="36px"
                px={4}
                _hover={{ bg: "red.50" }}
                loading={actionLoading}
                onClick={() => setShowDeleteModal(true)}
              >
                Delete
              </Button>
              <Button
                variant="outline"
                fontWeight="semibold"
                fontSize="sm"
                h="36px"
                px={4}
                rounded="md"
                onClick={() => router.push(coursePaths.edit(courseId))}
              >
                Edit
              </Button>
              <Button
                bg="#2E2F6F"
                color="white"
                fontWeight="semibold"
                fontSize="sm"
                h="36px"
                px={4}
                rounded="md"
                _hover={{ bg: "#262760" }}
                loading={actionLoading}
                onClick={
                  course?.status === "published"
                    ? () => setShowUnpublishModal(true)
                    : handlePublish
                }
              >
                {course?.status === "published" ? "Unpublish" : "Publish"}
              </Button>
            </HStack>
          )}
        </Flex>

        {/* Breadcrumb */}
        {loading ? (
          <Skeleton height="14px" width="180px" rounded="md" mb={3} />
        ) : (
          <HStack gap={2} mb={3} fontSize="sm">
            <Text
              color="#2E2F6F"
              fontWeight="medium"
              cursor="pointer"
              onClick={() => router.push(coursePaths.list)}
              _hover={{ textDecoration: "underline" }}
            >
              Courses
            </Text>
            <ChevronRight size={14} color="#9CA3AF" />
            <Text color="gray.700" fontWeight="medium">
              {course?.title}
            </Text>
          </HStack>
        )}

        {/* Course meta */}
        {loading ? (
          <Stack gap={2} mb={6}>
            <Skeleton height="14px" width="220px" rounded="md" />
            <Skeleton height="28px" width="300px" rounded="md" />
            <Skeleton height="14px" width="480px" rounded="md" />
          </Stack>
        ) : (
          <Stack gap={1} mb={6}>
            <HStack gap={2} fontSize="sm" color="gray.500">
              <Text>
                {course?.modules.length} module
                {course?.modules.length !== 1 ? "s" : ""}
              </Text>
              <Text>•</Text>
              <Text>
                {totalLessons} lesson{totalLessons !== 1 ? "s" : ""}
              </Text>
              <Text>•</Text>
              <Text>{course?.duration}</Text>
            </HStack>
            <Heading as="h2" size="lg" color="gray.900">
              {course?.title}
            </Heading>
            <Text fontSize="sm" color="gray.500" maxW="800px">
              {course?.description}
            </Text>
          </Stack>
        )}

        {/* Stat cards */}
        {loading ? (
          <SimpleGrid columns={{ base: 2, md: 4 }} gap={4} mb={6}>
            {[...Array(4)].map((_, i) => (
              <Box
                key={i}
                bg="white"
                borderWidth="1px"
                borderColor="gray.200"
                rounded="xl"
                p={5}
              >
                <Skeleton height="14px" width="80px" rounded="md" mb={3} />
                <Skeleton height="32px" width="60px" rounded="md" />
              </Box>
            ))}
          </SimpleGrid>
        ) : (
          <SimpleGrid columns={{ base: 2, md: 4 }} gap={4} mb={6}>
            <StatCard label="Students" value={course?.enrolledCount ?? 0} />
            <StatCard
              label="Avg Completion"
              value={`${Math.round(course?.completionRate ?? 0)}%`}
            />
            <StatCard label="Course Level" value={course?.level ?? "—"} />
            <StatCard label="Lessons" value={totalLessons} />
          </SimpleGrid>
        )}

        {/* Modules + cohort */}
        <Flex gap={5} align="flex-start">
          <Stack flex="1" gap={4} minW={0}>
            {loading
              ? [...Array(3)].map((_, i) => (
                  <Box
                    key={i}
                    bg="white"
                    borderWidth="1px"
                    borderColor="gray.200"
                    rounded="xl"
                    p={5}
                  >
                    <Skeleton height="16px" width="40%" rounded="md" mb={2} />
                    <Skeleton height="14px" width="60%" rounded="md" />
                  </Box>
                ))
              : course?.modules.map((mod, idx) => (
                  <ModuleRow
                    key={mod._id}
                    mod={mod}
                    index={idx}
                    courseId={courseId}
                  />
                ))}
          </Stack>

          <Box w="320px" flexShrink={0}>
            {loading ? (
              <Box
                bg="white"
                borderWidth="1px"
                borderColor="gray.200"
                rounded="xl"
                p={5}
              >
                <Skeleton height="18px" width="140px" rounded="md" mb={4} />
                {[...Array(3)].map((_, i) => (
                  <Stack key={i} gap={1} mb={4}>
                    <Skeleton height="13px" width="80px" rounded="md" />
                    <Skeleton height="8px" rounded="full" />
                  </Stack>
                ))}
              </Box>
            ) : (
              <CohortProgressSection
                completionRate={course?.completionRate ?? 0}
              />
            )}
          </Box>
        </Flex>
      </Box>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
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
            onClick={() => setShowDeleteModal(false)}
          >
            <Box
              bg="white"
              rounded="2xl"
              p={8}
              w="full"
              maxW="440px"
              boxShadow="2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Stack gap={5} align="center" textAlign="center">
                <Box
                  w="56px"
                  h="56px"
                  rounded="full"
                  bg="#FEE2E2"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <AlertTriangle size={26} color="#DC2626" />
                </Box>
                <Stack gap={2}>
                  <Heading as="h3" size="md" color="gray.900">
                    Delete Course?
                  </Heading>
                  <Text fontSize="sm" color="gray.500" lineHeight="1.6">
                    Are you sure you want to delete{" "}
                    <strong>{course?.title}</strong>? This action cannot be
                    undone and all course content will be permanently removed.
                  </Text>
                </Stack>
                <Stack gap={3} w="full">
                  <Button
                    bg="#DC2626"
                    color="white"
                    rounded="full"
                    h="48px"
                    fontSize="sm"
                    fontWeight="semibold"
                    w="full"
                    _hover={{ bg: "#B91C1C" }}
                    loading={actionLoading}
                    onClick={handleConfirmDelete}
                  >
                    Delete Course
                  </Button>
                  <Button
                    variant="outline"
                    rounded="full"
                    h="48px"
                    fontSize="sm"
                    fontWeight="medium"
                    w="full"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Box>
        </Portal>
      )}

      {/* Unpublish confirmation modal */}
      {showUnpublishModal && (
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
            onClick={() => setShowUnpublishModal(false)}
          >
            <Box
              bg="white"
              rounded="2xl"
              p={8}
              w="full"
              maxW="440px"
              boxShadow="2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Stack gap={5} align="center" textAlign="center">
                <Box
                  w="56px"
                  h="56px"
                  rounded="full"
                  bg="#FEF3C7"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <AlertTriangle size={26} color="#F59E0B" />
                </Box>

                <Stack gap={2}>
                  <Heading as="h3" size="md" color="gray.900">
                    Unpublish Course?
                  </Heading>
                  <Text fontSize="sm" color="gray.500" lineHeight="1.6">
                    Are you sure you want to unpublish this course? It will be
                    removed from live courses and won&apos;t be visible to
                    students, but you can restore it anytime.
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
                    w="full"
                    _hover={{ bg: "#262760" }}
                    loading={actionLoading}
                    onClick={handleConfirmUnpublish}
                  >
                    Archive
                  </Button>
                  <Button
                    variant="outline"
                    rounded="full"
                    h="48px"
                    fontSize="sm"
                    fontWeight="medium"
                    w="full"
                    onClick={() => setShowUnpublishModal(false)}
                  >
                    Cancel
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Box>
        </Portal>
      )}
    </Box>
  );
}

export default function CourseDetailPage() {
  return (
    <Suspense>
      <CourseDetailContent />
    </Suspense>
  );
}
