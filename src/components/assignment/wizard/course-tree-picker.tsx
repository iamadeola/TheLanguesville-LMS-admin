"use client";

import { Box, Flex, HStack, Skeleton, Spinner, Stack, Text } from "@chakra-ui/react";
import { Check, ChevronDown, ChevronRight, Minus, X } from "lucide-react";
import { useState } from "react";
import { type TreeCourse, type TreeModule, useWizard } from "./wizard-context";

type SelState = "none" | "partial" | "all";

function selStateFor(lessonIds: string[], selected: Set<string>): SelState {
  if (lessonIds.length === 0) return "none";
  const count = lessonIds.filter((id) => selected.has(id)).length;
  if (count === 0) return "none";
  if (count === lessonIds.length) return "all";
  return "partial";
}

function moduleLessonIds(m: TreeModule): string[] {
  return m.lessons.map((l) => l.id);
}

function courseLessonIds(c: TreeCourse): string[] {
  return c.modules ? c.modules.flatMap(moduleLessonIds) : [];
}

function shortLabel(title: string): string {
  const idx = title.indexOf(" - ");
  return idx >= 0 ? title.slice(idx + 3) : title;
}

function SelectIndicator({ state }: { state: SelState }) {
  if (state === "all") {
    return (
      <Flex w="20px" h="20px" rounded="full" bg="#16A34A" align="center" justify="center" flexShrink={0}>
        <Check size={13} color="white" strokeWidth={3} />
      </Flex>
    );
  }
  if (state === "partial") {
    return (
      <Flex w="20px" h="20px" rounded="full" bg="#16A34A" align="center" justify="center" flexShrink={0}>
        <Minus size={13} color="white" strokeWidth={3} />
      </Flex>
    );
  }
  return <Box w="20px" h="20px" rounded="full" borderWidth="1.5px" borderColor="gray.300" flexShrink={0} />;
}

interface Placement {
  label: string;
  lessonIds: string[];
}

function computePlacements(courses: TreeCourse[], selected: Set<string>): Placement[] {
  const placements: Placement[] = [];
  for (const course of courses) {
    if (!course.modules) continue;
    const cIds = courseLessonIds(course);
    const cState = selStateFor(cIds, selected);
    if (cState === "none") continue;
    if (cState === "all") {
      placements.push({ label: course.title, lessonIds: cIds });
      continue;
    }
    for (const m of course.modules) {
      const mIds = moduleLessonIds(m);
      const mState = selStateFor(mIds, selected);
      if (mState === "none") continue;
      if (mState === "all") {
        placements.push({
          label: `${course.title} - ${shortLabel(m.title)}`,
          lessonIds: mIds,
        });
      } else {
        for (const l of m.lessons) {
          if (selected.has(l.id)) {
            placements.push({
              label: `${course.title} - ${shortLabel(l.title)}`,
              lessonIds: [l.id],
            });
          }
        }
      }
    }
  }
  return placements;
}

export function CourseTreePicker() {
  const { draft, update, courses, coursesLoading, loadCourse } = useWizard();
  const selected = new Set(draft.selectedLessonIds);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const setSelected = (next: Set<string>) =>
    update({ selectedLessonIds: [...next] });

  const toggleMany = (ids: string[], turnOn: boolean) => {
    const next = new Set(selected);
    for (const id of ids) {
      if (turnOn) next.add(id);
      else next.delete(id);
    }
    setSelected(next);
  };

  const toggleExpand = (course: TreeCourse) => {
    if (course.modules === null) loadCourse(course.id);
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(course.id)) next.delete(course.id);
      else next.add(course.id);
      return next;
    });
  };

  const toggleExpandModule = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const placements = computePlacements(courses, selected);

  if (coursesLoading) {
    return (
      <Stack gap={3}>
        {[0, 1].map((i) => (
          <Skeleton key={i} h="64px" rounded="xl" />
        ))}
      </Stack>
    );
  }

  if (courses.length === 0) {
    return (
      <Box borderWidth="1px" borderColor="gray.200" rounded="xl" px={4} py={8} textAlign="center">
        <Text fontSize="sm" color="gray.500">
          You don&apos;t have any courses yet. Create a course first to place an
          assignment in it.
        </Text>
      </Box>
    );
  }

  return (
    <Stack gap={3}>
      {courses.map((course) => {
        const cIds = courseLessonIds(course);
        const cState = selStateFor(cIds, selected);
        const isOpen = expanded.has(course.id);

        return (
          <Box key={course.id} borderWidth="1px" borderColor="gray.200" rounded="xl" overflow="hidden">
            {/* Course header */}
            <Flex align="center" gap={3} px={4} py={3.5}>
              <Box
                as="button"
                onClick={() => {
                  if (course.modules === null) {
                    loadCourse(course.id);
                    setExpanded((prev) => new Set(prev).add(course.id));
                  } else {
                    toggleMany(cIds, cState !== "all");
                  }
                }}
                cursor="pointer"
                display="flex"
              >
                <SelectIndicator state={cState} />
              </Box>
              <Box flex="1" cursor="pointer" onClick={() => toggleExpand(course)}>
                <HStack gap={2}>
                  <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                    {course.title}
                  </Text>
                  <Box bg="#E8E9F5" color="#4338CA" fontSize="xs" fontWeight="semibold" px={1.5} py={0.5} rounded="md">
                    {course.level}
                  </Box>
                </HStack>
                <Text fontSize="xs" color="gray.500" mt={0.5}>
                  {course.moduleCount} modules • {course.lessonCount} lessons • {course.studentCount} students
                </Text>
              </Box>
              <Box as="button" onClick={() => toggleExpand(course)} color="gray.400" cursor="pointer">
                {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </Box>
            </Flex>

            {/* Modules */}
            {isOpen ? (
              <Box borderTopWidth="1px" borderColor="gray.100" px={4} py={2}>
                {course.loading ? (
                  <Flex align="center" gap={2} py={3} color="gray.500">
                    <Spinner size="sm" />
                    <Text fontSize="sm">Loading lessons…</Text>
                  </Flex>
                ) : course.modules && course.modules.length > 0 ? (
                  <Stack gap={1}>
                    {course.modules.map((m) => {
                      const mIds = moduleLessonIds(m);
                      const mState = selStateFor(mIds, selected);
                      const mOpen = expanded.has(m.id);
                      return (
                        <Box key={m.id}>
                          <Flex align="center" gap={3} py={2}>
                            <Box as="button" onClick={() => toggleExpandModule(m.id)} color="gray.400" cursor="pointer">
                              {mOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </Box>
                            <Box
                              as="button"
                              onClick={() => toggleMany(mIds, mState !== "all")}
                              cursor="pointer"
                              display="flex"
                            >
                              <SelectIndicator state={mState} />
                            </Box>
                            <Text flex="1" fontSize="sm" color="gray.800" cursor="pointer" onClick={() => toggleExpandModule(m.id)}>
                              {m.title}
                            </Text>
                            <Box bg="gray.100" color="gray.500" fontSize="xs" fontWeight="medium" px={2} py={0.5} rounded="md">
                              {m.lessons.length} lessons
                            </Box>
                          </Flex>

                          {mOpen ? (
                            <Stack gap={0} pl={9} pb={1}>
                              {m.lessons.map((l) => {
                                const on = selected.has(l.id);
                                return (
                                  <Flex
                                    key={l.id}
                                    as="button"
                                    onClick={() => toggleMany([l.id], !on)}
                                    align="center"
                                    gap={3}
                                    py={1.5}
                                    cursor="pointer"
                                    textAlign="left"
                                  >
                                    <SelectIndicator state={on ? "all" : "none"} />
                                    <Text fontSize="sm" color="gray.700">
                                      {l.title}
                                    </Text>
                                  </Flex>
                                );
                              })}
                            </Stack>
                          ) : null}
                        </Box>
                      );
                    })}
                  </Stack>
                ) : (
                  <Text fontSize="sm" color="gray.400" py={3}>
                    This course has no lessons yet.
                  </Text>
                )}
              </Box>
            ) : null}
          </Box>
        );
      })}

      {/* Selected placements */}
      <Box borderWidth="1px" borderColor="gray.200" rounded="xl" px={4} py={4}>
        <Text fontSize="sm" fontWeight="semibold" color="gray.900" mb={placements.length ? 3 : 1}>
          Selected Placements
        </Text>
        {placements.length === 0 ? (
          <Text fontSize="sm" color="gray.400">
            No placements selected yet
          </Text>
        ) : (
          <HStack gap={2} flexWrap="wrap">
            {placements.map((p) => (
              <HStack
                key={p.label}
                gap={2}
                bg="#EEF0FB"
                color="#4338CA"
                px={3}
                py={1.5}
                rounded="full"
                fontSize="sm"
                fontWeight="medium"
              >
                <Text>{p.label}</Text>
                <Box
                  as="button"
                  onClick={() => toggleMany(p.lessonIds, false)}
                  cursor="pointer"
                  display="flex"
                  color="#6366F1"
                >
                  <X size={14} />
                </Box>
              </HStack>
            ))}
          </HStack>
        )}
      </Box>
    </Stack>
  );
}
