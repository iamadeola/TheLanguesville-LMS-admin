"use client";

import { AspectRatio, Box, Button, Input, Stack, Text } from "@chakra-ui/react";
import { Play } from "lucide-react";
import { useMemo, useState } from "react";
import type { VideoBlock as VideoBlockModel } from "../course-builder-context";

interface VideoBlockProps {
  block: VideoBlockModel;
  onChange: (url: string) => void;
}

function getEmbedUrl(raw: string): string | null {
  const url = raw.trim();
  if (!url) return null;
  // YouTube
  const yt = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{6,})/,
  );
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  // Vimeo
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return null;
}

export function VideoBlock({ block, onChange }: VideoBlockProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(() =>
    getEmbedUrl(block.url),
  );

  const candidate = useMemo(() => getEmbedUrl(block.url), [block.url]);
  const canPreview = Boolean(candidate);

  return (
    <Stack gap={3}>
      <Text fontSize="xs" fontWeight="medium" color="gray.700">
        Video URL
      </Text>
      <Input
        placeholder="https://youtube.com/..."
        value={block.url}
        onChange={(e) => onChange(e.target.value)}
        h="40px"
        borderColor="gray.200"
        rounded="md"
        fontSize="sm"
        _focusVisible={{
          borderColor: "#2E2F6F",
          boxShadow: "0 0 0 1px #2E2F6F",
        }}
      />

      {previewUrl ? (
        <AspectRatio ratio={16 / 9} rounded="md" overflow="hidden">
          <iframe
            src={previewUrl}
            title="Video preview"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ border: 0 }}
          />
        </AspectRatio>
      ) : (
        <Button
          type="button"
          onClick={() => canPreview && setPreviewUrl(candidate)}
          h="44px"
          bg={canPreview ? "#2E2F6F" : "#F3F4F6"}
          color={canPreview ? "white" : "#9CA3AF"}
          rounded="md"
          fontSize="sm"
          fontWeight="medium"
          _hover={canPreview ? { bg: "#262760" } : { bg: "#F3F4F6" }}
          disabled={!canPreview}
        >
          <Play size={14} />
          <Box as="span" ml={2}>
            Preview video
          </Box>
        </Button>
      )}
    </Stack>
  );
}
