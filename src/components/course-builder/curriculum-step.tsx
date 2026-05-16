"use client";

import { Box, Button, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { CheckCircle2, Plus } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useCourseBuilder } from "./course-builder-context";
import { ModuleCard } from "./module-card";
import { addApiModule } from "@/lib/api/courses";

export function CurriculumStep() {
  const { draft, courseId, setModules, totalLessons } = useCourseBuilder();
  const [toastVisible, setToastVisible] = useState(false);
  const [addingModule, setAddingModule] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLessonAdded = () => {
    setToastVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToastVisible(false), 3000);
  };

  const handleAddModule = async () => {
    if (!courseId) return;
    setAddingModule(true);
    const title = `Module ${draft.modules.length + 1}`;
    const result = await addApiModule(courseId, title);
    if (result.success) {
      setModules([
        ...draft.modules,
        { id: result.data._id, title: result.data.title, lessons: [] },
      ]);
    } else {
      toast.error(result.message || "Failed to add module");
    }
    setAddingModule(false);
  };

  return (
    <Stack gap={5}>
      <Stack gap={1}>
        <Heading as="h2" size="md" color="gray.900">
          Curriculum
        </Heading>
        <Text fontSize="sm" color="gray.500">
          Create a clear learning path by arranging your course content into
          structured modules.
        </Text>
      </Stack>

      {/* Outline summary */}
      <Flex
        align="center"
        justify="space-between"
        borderWidth="1px"
        borderColor="gray.200"
        rounded="lg"
        p={4}
        bg="white"
      >
        <Stack gap={0.5}>
          <Text fontSize="xs" color="gray.500">
            Outline
          </Text>
          <Text fontSize="sm" fontWeight="medium" color="gray.900">
            {draft.modules.length} modules · {totalLessons} lessons
          </Text>
        </Stack>
        <Button
          bg="#2E2F6F"
          color="white"
          rounded="full"
          h="36px"
          px={4}
          fontSize="sm"
          fontWeight="medium"
          _hover={{ bg: "#262760" }}
          loading={addingModule}
          disabled={addingModule}
          onClick={handleAddModule}
        >
          <Plus size={16} />
          <Box as="span" ml={2}>
            Module
          </Box>
        </Button>
      </Flex>

      {/* Modules list */}
      <Stack gap={3}>
        {draft.modules.map((m, idx) => (
          <ModuleCard
            key={m.id}
            mod={m}
            index={idx}
            onLessonAdded={handleLessonAdded}
          />
        ))}
      </Stack>

      {/* "Lesson added" toast */}
      <Box
        position="fixed"
        bottom="80px"
        right="24px"
        bg="gray.900"
        color="white"
        rounded="lg"
        px={4}
        py={3}
        boxShadow="lg"
        minW="260px"
        transition="opacity 0.3s, transform 0.3s"
        opacity={toastVisible ? 1 : 0}
        transform={toastVisible ? "translateY(0)" : "translateY(12px)"}
        pointerEvents="none"
        zIndex={100}
      >
        <Flex align="center" gap={3}>
          <CheckCircle2 size={16} color="#4ADE80" />
          <Stack gap={0}>
            <Text fontWeight="semibold" fontSize="sm">
              Lesson added
            </Text>
            <Text fontSize="xs" color="gray.400">
              1 lesson has been added to curriculum
            </Text>
          </Stack>
        </Flex>
      </Box>
    </Stack>
  );
}
