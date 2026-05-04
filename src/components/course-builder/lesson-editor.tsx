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
import { useState } from "react";
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
  const { setEditingLesson, renameLesson, addBlock, updateBlock, removeBlock } =
    useCourseBuilder();
  const [editingTitle, setEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState(lesson.title);

  const lessonRef = { moduleId: mod.id, lessonId: lesson.id };

  const handleAddBlock = (type: BlockType) => {
    addBlock(lessonRef, type);
  };

  const goBack = () => setEditingLesson(null);

  const startEditing = () => {
    setDraftTitle(lesson.title);
    setEditingTitle(true);
  };
  const commit = () => {
    const next = draftTitle.trim() || "Untitled Lesson";
    renameLesson({ moduleId: mod.id, lessonId: lesson.id }, next);
    setEditingTitle(false);
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
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit();
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
              onClick={() => handleAddBlock("text")}
            />
            <ContentTypeCard
              icon={Video}
              title="Add Video"
              description="Embed Youtube, Vimeo or upload"
              onClick={() => handleAddBlock("video")}
            />
            <ContentTypeCard
              icon={Link2}
              title="Upload File"
              description="PDF, audio, worksheet, slides"
              onClick={() => handleAddBlock("file")}
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
              onRemove={() => removeBlock(lessonRef, block.id)}
            >
              {block.type === "text" ? (
                <TextBlock
                  block={block}
                  onChange={(html) =>
                    updateBlock(lessonRef, block.id, { html })
                  }
                />
              ) : block.type === "video" ? (
                <VideoBlock
                  block={block}
                  onChange={(url) => updateBlock(lessonRef, block.id, { url })}
                />
              ) : (
                <FileBlock
                  block={block}
                  onChange={(patch: Partial<FileBlockModel>) =>
                    updateBlock(lessonRef, block.id, patch)
                  }
                />
              )}
            </BlockWrapper>
          ))}

          <AddBlockBar onAdd={handleAddBlock} />
        </Stack>
      )}
    </Stack>
  );
}
