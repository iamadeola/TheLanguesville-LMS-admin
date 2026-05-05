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
import { type Module, useCourseBuilder } from "./course-builder-context";

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
    renameModule,
    removeModule,
    removeLesson,
    addLesson,
    setEditingLesson,
  } = useCourseBuilder();

  const [collapsed, setCollapsed] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(mod.title);

  const startEditing = () => {
    setDraftTitle(mod.title);
    setEditing(true);
  };

  const commitEditing = () => {
    const next = draftTitle.trim() || "New module";
    renameModule(mod.id, next);
    setEditing(false);
  };

  const handleAddLesson = () => {
    const lessonId = addLesson(mod.id);
    setEditingLesson({ moduleId: mod.id, lessonId });
    onLessonAdded?.();
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
                  onBlur={commitEditing}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitEditing();
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
                <Text fontWeight="semibold" color="gray.900" fontSize="sm">
                  {mod.title}
                </Text>
                <IconButton
                  aria-label="Rename module"
                  variant="ghost"
                  size="xs"
                  color="gray.500"
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
          onClick={() => removeModule(mod.id)}
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
                <Text
                  fontSize="sm"
                  fontWeight="medium"
                  color="gray.900"
                >
                  {String(lessonIndex + 1).padStart(2, "0")} · {lesson.title}
                </Text>
                <ChevronRight size={14} color="#9CA3AF" />
              </HStack>
              <IconButton
                aria-label="Delete lesson"
                variant="ghost"
                size="xs"
                color="#DC2626"
                onClick={(e) => {
                  e.stopPropagation();
                  removeLesson({ moduleId: mod.id, lessonId: lesson.id });
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
