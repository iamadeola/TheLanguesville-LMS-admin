"use client";

import { Box, Flex, HStack, Spinner, Stack, Text } from "@chakra-ui/react";
import { FileIcon, Upload, X } from "lucide-react";
import { type DragEvent, useRef, useState } from "react";
import { uploadFile } from "@/lib/api/uploads";
import type { FileBlock as FileBlockModel } from "../course-builder-context";

interface FileBlockProps {
  block: FileBlockModel;
  onChange: (patch: Partial<FileBlockModel>) => void;
}

const MAX_SIZE_MB = 50;
const ACCEPTED_EXTENSIONS = [
  ".pdf",
  ".ppt",
  ".pptx",
  ".doc",
  ".docx",
  ".png",
  ".jpg",
  ".jpeg",
  ".mp3",
  ".wav",
];

function formatSize(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileBlock({ block, onChange }: FileBlockProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const hasFile = Boolean(block.fileName);

  const processFile = async (file: File) => {
    setError(null);
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File is larger than ${MAX_SIZE_MB}MB`);
      return;
    }

    // Show an instant local preview while the upload runs. We use a blob object
    // URL (not a base64 data URL) because Chrome blocks `data:` PDFs inside an
    // <iframe>, whereas a `blob:` URL renders fine. Revoke any previous one so
    // we don't leak object URLs when replacing a file.
    if (block.previewUrl) URL.revokeObjectURL(block.previewUrl);
    const previewUrl = URL.createObjectURL(file);
    onChange({
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      previewUrl,
    });

    // Upload the raw bytes so the file is stored server-side and gets a stable
    // URL other devices can load. `fileUrl` is what we persist with the block.
    setUploading(true);
    const result = await uploadFile(file);
    setUploading(false);
    if (result.success) {
      onChange({
        fileName: result.data.fileName ?? file.name,
        fileSize: result.data.fileSize ?? file.size,
        mimeType: result.data.mimeType ?? file.type,
        fileUrl: result.data.url,
      });
    } else {
      setError(
        result.message || "Couldn't upload this file. Please try again.",
      );
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void processFile(file);
    // reset so the same file can be re-selected later
    e.target.value = "";
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void processFile(file);
  };

  const clear = () => {
    if (block.previewUrl) URL.revokeObjectURL(block.previewUrl);
    onChange({
      fileName: undefined,
      fileSize: undefined,
      mimeType: undefined,
      previewUrl: undefined,
      fileUrl: undefined,
    });
  };

  if (hasFile) {
    return (
      <Stack gap={3}>
        <Text fontSize="sm" fontWeight="semibold" color="gray.900">
          {block.fileName}
        </Text>
        <FilePreview block={block} />
        <HStack gap={3} justify="space-between">
          {uploading ? (
            <HStack gap={2} color="#2E2F6F">
              <Spinner size="xs" />
              <Text fontSize="xs" fontWeight="medium">
                Uploading…
              </Text>
            </HStack>
          ) : (
            <Text fontSize="xs" color="gray.500">
              {formatSize(block.fileSize)}
              {block.fileUrl ? " · Uploaded" : ""}
            </Text>
          )}
          <HStack gap={3}>
            <Text
              fontSize="xs"
              color="#2E2F6F"
              fontWeight="medium"
              cursor="pointer"
              textDecoration="underline"
              onClick={() => inputRef.current?.click()}
            >
              Replace
            </Text>
            <HStack
              gap={1}
              color="#DC2626"
              fontSize="xs"
              fontWeight="medium"
              cursor="pointer"
              onClick={clear}
            >
              <X size={12} />
              <Text>Remove</Text>
            </HStack>
          </HStack>
        </HStack>
        <input
          ref={inputRef}
          type="file"
          hidden
          accept={ACCEPTED_EXTENSIONS.join(",")}
          onChange={onInputChange}
        />
      </Stack>
    );
  }

  return (
    <Stack gap={2}>
      <Box
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        borderWidth="1px"
        borderStyle="dashed"
        borderColor={dragOver ? "#2E2F6F" : "gray.300"}
        bg={dragOver ? "#F5F5FB" : "gray.50"}
        rounded="md"
        py={8}
        textAlign="center"
        cursor="pointer"
        transition="all 0.15s"
        _hover={{ borderColor: "#2E2F6F", bg: "#F5F5FB" }}
      >
        <Flex direction="column" align="center" gap={2}>
          <Box
            w="36px"
            h="36px"
            rounded="md"
            bg="white"
            borderWidth="1px"
            borderColor="gray.200"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="#2E2F6F"
          >
            <Upload size={16} />
          </Box>
          <Text fontSize="sm" color="gray.700">
            Drop a file here or{" "}
            <Text as="span" color="#2E2F6F" fontWeight="semibold">
              click to upload
            </Text>
          </Text>
          <Text fontSize="xs" color="gray.500">
            PDF, PPT, DOCX up to {MAX_SIZE_MB}MB
          </Text>
        </Flex>
      </Box>
      {error ? (
        <Text fontSize="xs" color="#DC2626">
          {error}
        </Text>
      ) : null}
      <input
        ref={inputRef}
        type="file"
        hidden
        accept={ACCEPTED_EXTENSIONS.join(",")}
        onChange={onInputChange}
      />
    </Stack>
  );
}

function FilePreview({ block }: { block: FileBlockModel }) {
  const mime = block.mimeType ?? "";
  const isImage = mime.startsWith("image/");
  const isPdf = mime === "application/pdf";
  // Prefer the instant local blob URL (works for both <img> and <iframe>, even
  // for PDFs) and fall back to the stored backend URL when re-opening a saved
  // course where no local file is in hand.
  const src = block.previewUrl ?? block.fileUrl;

  if (isImage && src) {
    return (
      <Box
        rounded="md"
        borderWidth="1px"
        borderColor="gray.200"
        overflow="hidden"
        display="inline-block"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={block.fileName ?? "Uploaded file"}
          style={{ maxHeight: 300, display: "block" }}
        />
      </Box>
    );
  }

  if (isPdf && src) {
    return (
      <Box
        rounded="md"
        borderWidth="1px"
        borderColor="gray.200"
        overflow="hidden"
      >
        <iframe
          src={src}
          title={block.fileName ?? "Uploaded PDF"}
          style={{ width: "100%", height: 460, border: 0, display: "block" }}
        />
      </Box>
    );
  }

  return (
    <HStack gap={3} borderWidth="1px" borderColor="gray.200" rounded="md" p={3}>
      <Box
        w="40px"
        h="40px"
        rounded="md"
        bg="#E8E9F5"
        color="#2E2F6F"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <FileIcon size={18} />
      </Box>
      <Stack gap={0.5}>
        <Text fontSize="sm" fontWeight="medium" color="gray.900">
          {block.fileName}
        </Text>
        <Text fontSize="xs" color="gray.500">
          Uploaded
        </Text>
      </Stack>
    </HStack>
  );
}
