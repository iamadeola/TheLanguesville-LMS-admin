"use client";

import {
  Box,
  Flex,
  HStack,
  IconButton,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { type Module, useCourseBuilder } from "./course-builder-context";
import {
  updateApiModule,
  deleteApiModule,
  addApiLesson,
  deleteApiLesson,
} from "@/lib/api/courses";

interface ModuleCardProps {
  mod: Module;
  index: number;
}

export function ModuleCard({
  mod,
  index,
  onLessonAdded,
}: ModuleCardProps & { onLessonAdded?: () => void }) {
  const {
    courseId,
    renameModule,
    removeModule,
    removeLesson,
    addLesson,
    setEditingLesson,
  } = useCourseBuilder();

  const [collapsed, setCollapsed] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(mod.title);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const startEditing = () => {
    setDraftTitle(mod.title);
    setEditing(true);
  };

  const commitEditing = async () => {
    const next = draftTitle.trim() || "New module";
    setEditing(false);
    renameModule(mod.id, next);
    if (courseId) {
      setSaving(true);
      const result = await updateApiModule(courseId, mod.id, next);
      if (!result.success) {
        toast.error(result.message || "Failed to rename module");
        renameModule(mod.id, mod.title);
      }
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!courseId) {
      removeModule(mod.id);
      return;
    }
    setDeleting(true);
    const result = await deleteApiModule(courseId, mod.id);
    if (result.success) {
      removeModule(mod.id);
    } else {
      toast.error(result.message || "Failed to delete module");
      setDeleting(false);
    }
  };

  const handleAddLesson = async () => {
    if (!courseId) return;
    const result = await addApiLesson(courseId, mod.id, "Untitled Lesson");
    if (result.success) {
      const lessonId = result.data._id;
      addLesson(mod.id, lessonId);
      setEditingLesson({ moduleId: mod.id, lessonId });
      onLessonAdded?.();
    } else {
      toast.error(result.message || "Failed to add lesson");
    }
  };

  return (
    <Box borderWidth="1px" borderColor="gray.200" rounded="lg" p={4} bg="white">
      {/* Module header row */}
      <Flex align="center" justify="space-between" gap={3}>
        <HStack gap={2} flex="1" minW={0}>
          <IconButton
            aria-label={collapsed ? "Expand module" : "Collapse module"}
            variant="ghost"
            size="xs"
            color="gray.500"
            onClick={() => setCollapsed((v) => !v)}
          >
            {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </IconButton>

          <Stack gap={0.5} flex="1" minW={0}>
            <Text fontSize="xs" color="gray.500">
              Module {index + 1}
            </Text>

            {editing ? (
              <HStack gap={2}>
                <Input
                  autoFocus
                  size="sm"
                  borderColor="#F97461"
                  rounded="md"
                  fontSize="sm"
                  fontWeight="semibold"
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  onBlur={() => void commitEditing()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void commitEditing();
                    if (e.key === "Escape") {
                      setDraftTitle(mod.title);
                      setEditing(false);
                    }
                  }}
                  _focusVisible={{
                    borderColor: "#F97461",
                    boxShadow: "0 0 0 1px #F97461",
                  }}
                />
                <IconButton
                  aria-label="Cancel rename"
                  variant="ghost"
                  size="xs"
                  color="gray.500"
                  onMouseDown={(e) => {
                    // prevent blur committing before click fires
                    e.preventDefault();
                  }}
                  onClick={() => {
                    setDraftTitle(mod.title);
                    setEditing(false);
                  }}
                >
                  <X size={14} />
                </IconButton>
              </HStack>
            ) : (
              <HStack gap={2}>
                <Text
                  fontWeight="semibold"
                  color={saving ? "gray.400" : "gray.900"}
                  fontSize="sm"
                >
                  {mod.title}
                </Text>
                <IconButton
                  aria-label="Rename module"
                  variant="ghost"
                  size="xs"
                  color="gray.500"
                  disabled={saving}
                  onClick={startEditing}
                >
                  <Pencil size={12} />
                </IconButton>
              </HStack>
            )}
          </Stack>
        </HStack>

        <IconButton
          aria-label="Delete module"
          variant="ghost"
          size="sm"
          color="#DC2626"
          loading={deleting}
          disabled={deleting}
          onClick={handleDelete}
        >
          <Trash2 size={16} />
        </IconButton>
      </Flex>

      {!collapsed ? (
        <Stack gap={2} mt={4}>
          {mod.lessons.map((lesson, lessonIndex) => (
            <Flex
              key={lesson.id}
              align="center"
              justify="space-between"
              borderWidth="1px"
              borderColor="gray.200"
              rounded="md"
              px={3}
              py={2.5}
              _hover={{ borderColor: "gray.300", bg: "gray.50" }}
            >
              <HStack
                gap={2}
                flex="1"
                minW={0}
                cursor="pointer"
                onClick={() =>
                  setEditingLesson({
                    moduleId: mod.id,
                    lessonId: lesson.id,
                  })
                }
              >
                <CheckCircle2 size={16} color="#16A34A" />
                <Text fontSize="sm" fontWeight="medium" color="gray.900">
                  {String(lessonIndex + 1).padStart(2, "0")} · {lesson.title}
                </Text>
                <ChevronRight size={14} color="#9CA3AF" />
              </HStack>
              <IconButton
                aria-label="Delete lesson"
                variant="ghost"
                size="xs"
                color="#DC2626"
                onClick={async (e) => {
                  e.stopPropagation();
                  if (!courseId) {
                    removeLesson({ moduleId: mod.id, lessonId: lesson.id });
                    return;
                  }
                  const result = await deleteApiLesson(
                    courseId,
                    mod.id,
                    lesson.id,
                  );
                  if (result.success) {
                    removeLesson({ moduleId: mod.id, lessonId: lesson.id });
                  } else {
                    toast.error(result.message || "Failed to delete lesson");
                  }
                }}
              >
                <Trash2 size={14} />
              </IconButton>
            </Flex>
          ))}

          <Box
            onClick={handleAddLesson}
            borderWidth="1px"
            borderStyle="dashed"
            borderColor="gray.300"
            rounded="md"
            px={3}
            py={2.5}
            cursor="pointer"
            _hover={{ borderColor: "#2E2F6F", bg: "gray.50" }}
            transition="border-color 0.15s"
          >
            <HStack gap={2} justify="center" color="#2E2F6F">
              <Plus size={16} />
              <Text fontSize="sm" fontWeight="medium">
                Add lesson
              </Text>
            </HStack>
          </Box>
        </Stack>
      ) : null}
    </Box>
  );
}
