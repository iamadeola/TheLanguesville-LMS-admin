"use client";

import {
  HStack,
  Heading,
  IconButton,
  Input,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Link2,
  Pencil,
  Video,
  X,
} from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import {
  addApiBlock,
  updateApiBlock,
  deleteApiBlock,
  updateApiLesson,
} from "@/lib/api/courses";
import { AddBlockBar } from "./blocks/add-block-bar";
import { BlockWrapper } from "./blocks/block-wrapper";
import { FileBlock } from "./blocks/file-block";
import { TextBlock } from "./blocks/text-block";
import { VideoBlock } from "./blocks/video-block";
import { ContentTypeCard } from "./content-type-card";
import {
  type BlockType,
  type FileBlock as FileBlockModel,
  type Lesson,
  type Module,
  useCourseBuilder,
} from "./course-builder-context";

interface LessonEditorProps {
  mod: Module;
  lesson: Lesson;
}

export function LessonEditor({ mod, lesson }: LessonEditorProps) {
  const {
    courseId,
    setEditingLesson,
    renameLesson,
    addBlock,
    updateBlock,
    removeBlock,
  } = useCourseBuilder();
  const [editingTitle, setEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState(lesson.title);

  const handleAddBlock = useCallback(
    async (type: BlockType) => {
      if (!courseId) {
        addBlock({ moduleId: mod.id, lessonId: lesson.id }, type);
        return;
      }
      const result = await addApiBlock(courseId, mod.id, lesson.id, { type });
      if (result.success) {
        addBlock(
          { moduleId: mod.id, lessonId: lesson.id },
          type,
          result.data._id,
        );
      } else {
        toast.error(result.message || "Failed to add block");
      }
    },
    [courseId, mod.id, lesson.id, addBlock],
  );

  const handleSaveBlock = useCallback(
    async (blockId: string) => {
      if (!courseId) return;
      const block = lesson.blocks.find((b) => b.id === blockId);
      if (!block) return;
      const payload =
        block.type === "text"
          ? { content: block.html }
          : block.type === "video"
            ? { url: block.url }
            : {
                fileName: (block as FileBlockModel).fileName,
                fileSize: (block as FileBlockModel).fileSize,
                mimeType: (block as FileBlockModel).mimeType,
              };
      const result = await updateApiBlock(
        courseId,
        mod.id,
        lesson.id,
        blockId,
        payload,
      );
      if (result.success) {
        toast.success("Block saved");
      } else {
        toast.error(result.message || "Failed to save block");
      }
    },
    [courseId, mod.id, lesson.id, lesson.blocks],
  );

  const handleRemoveBlock = useCallback(
    async (blockId: string) => {
      if (!courseId) {
        removeBlock({ moduleId: mod.id, lessonId: lesson.id }, blockId);
        return;
      }
      const result = await deleteApiBlock(courseId, mod.id, lesson.id, blockId);
      if (result.success) {
        removeBlock({ moduleId: mod.id, lessonId: lesson.id }, blockId);
      } else {
        toast.error(result.message || "Failed to delete block");
      }
    },
    [courseId, mod.id, lesson.id, removeBlock],
  );

  const goBack = () => setEditingLesson(null);

  const startEditing = () => {
    setDraftTitle(lesson.title);
    setEditingTitle(true);
  };

  const commit = async () => {
    const next = draftTitle.trim() || "Untitled Lesson";
    renameLesson({ moduleId: mod.id, lessonId: lesson.id }, next);
    setEditingTitle(false);
    if (courseId) {
      const result = await updateApiLesson(courseId, mod.id, lesson.id, {
        title: next,
      });
      if (!result.success) {
        toast.error(result.message || "Failed to rename lesson");
        renameLesson({ moduleId: mod.id, lessonId: lesson.id }, lesson.title);
      }
    }
  };

  return (
    <Stack gap={6}>
      {/* Back + breadcrumb */}
      <Stack gap={2}>
        <IconButton
          aria-label="Back to curriculum"
          variant="ghost"
          size="sm"
          color="gray.500"
          alignSelf="flex-start"
          onClick={goBack}
        >
          <ArrowLeft size={16} />
        </IconButton>

        <HStack gap={1.5} fontSize="sm" color="gray.500">
          <Text
            cursor="pointer"
            onClick={goBack}
            _hover={{ color: "gray.700" }}
          >
            {mod.title}
          </Text>
          <ChevronRight size={14} />
          <Text color="#F97461" fontWeight="medium">
            Lesson
          </Text>
        </HStack>

        {/* Lesson title */}
        {editingTitle ? (
          <HStack gap={2}>
            <Input
              autoFocus
              borderColor="#F97461"
              rounded="md"
              fontSize="md"
              fontWeight="semibold"
              h="40px"
              maxW="420px"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onBlur={() => void commit()}
              onKeyDown={(e) => {
                if (e.key === "Enter") void commit();
                if (e.key === "Escape") {
                  setDraftTitle(lesson.title);
                  setEditingTitle(false);
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
              size="sm"
              color="gray.500"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setDraftTitle(lesson.title);
                setEditingTitle(false);
              }}
            >
              <X size={14} />
            </IconButton>
          </HStack>
        ) : (
          <HStack gap={2}>
            <Heading as="h2" size="md" color="gray.900">
              {lesson.title}
            </Heading>
            <IconButton
              aria-label="Rename lesson"
              variant="ghost"
              size="sm"
              color="gray.500"
              onClick={startEditing}
            >
              <Pencil size={14} />
            </IconButton>
          </HStack>
        )}
      </Stack>

      {lesson.blocks.length === 0 ? (
        <>
          <Stack gap={1}>
            <Heading as="h3" size="md" color="gray.900">
              What goes in this lesson
            </Heading>
            <Text fontSize="sm" color="gray.500">
              Pick how you&apos;d like to start. You can stack as many blocks as
              you need.
            </Text>
          </Stack>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap={3}>
            <ContentTypeCard
              icon={BookOpen}
              title="Write Content"
              description="Rich content, headings, links, lists"
              onClick={() => void handleAddBlock("text")}
            />
            <ContentTypeCard
              icon={Video}
              title="Add Video"
              description="Embed Youtube, Vimeo or upload"
              onClick={() => void handleAddBlock("video")}
            />
            <ContentTypeCard
              icon={Link2}
              title="Upload File"
              description="PDF, audio, worksheet, slides"
              onClick={() => void handleAddBlock("file")}
            />
          </SimpleGrid>
        </>
      ) : (
        <Stack gap={3}>
          {lesson.blocks.map((block, idx) => (
            <BlockWrapper
              key={block.id}
              type={block.type}
              index={idx}
              onSave={() => void handleSaveBlock(block.id)}
              onRemove={() => void handleRemoveBlock(block.id)}
            >
              {block.type === "text" ? (
                <TextBlock
                  block={block}
                  onChange={(html) =>
                    updateBlock(
                      { moduleId: mod.id, lessonId: lesson.id },
                      block.id,
                      { html },
                    )
                  }
                />
              ) : block.type === "video" ? (
                <VideoBlock
                  block={block}
                  onChange={(url) =>
                    updateBlock(
                      { moduleId: mod.id, lessonId: lesson.id },
                      block.id,
                      { url },
                    )
                  }
                />
              ) : (
                <FileBlock
                  block={block}
                  onChange={(patch: Partial<FileBlockModel>) =>
                    updateBlock(
                      { moduleId: mod.id, lessonId: lesson.id },
                      block.id,
                      patch,
                    )
                  }
                />
              )}
            </BlockWrapper>
          ))}

          <AddBlockBar onAdd={(type) => void handleAddBlock(type)} />
        </Stack>
      )}
    </Stack>
  );
}
