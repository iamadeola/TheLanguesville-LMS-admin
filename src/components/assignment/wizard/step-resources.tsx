"use client";

import { Box, Flex, HStack, Spinner, Stack, Text } from "@chakra-ui/react";
import { Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api/client";
import { uploadFile } from "@/lib/api/uploads";
import { useWizard } from "./wizard-context";
import { Card, StepHeading, TextField } from "./wizard-bits";

export function StepResources() {
  const { draft, update } = useWizard();
  const [linkInput, setLinkInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const addFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    // Upload bytes first (POST /api/uploads) so each file has a real fileUrl.
    const uploaded = [...draft.files];
    for (const file of Array.from(files)) {
      const result = await uploadFile(file);
      if (result.success) {
        uploaded.push({
          fileName: result.data.fileName,
          fileUrl: result.data.url,
          fileSize: result.data.fileSize,
          mimeType: result.data.mimeType,
        });
      } else {
        toast.error(getApiErrorMessage(result, `Couldn't upload ${file.name}`));
      }
    }
    update({ files: uploaded });
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeFile = (fileUrl: string) =>
    update({ files: draft.files.filter((f) => f.fileUrl !== fileUrl) });

  const addLink = () => {
    const v = linkInput.trim();
    if (!v) return;
    update({ links: [...draft.links, v] });
    setLinkInput("");
  };

  const removeLink = (url: string) =>
    update({ links: draft.links.filter((l) => l !== url) });

  return (
    <Stack gap={6}>
      <StepHeading
        title="Resources"
        subtitle="Attach supporting files or links for students."
        optional
      />

      <Card title="Supporting files">
        <input
          ref={fileRef}
          type="file"
          multiple
          hidden
          onChange={(e) => addFiles(e.target.files)}
        />
        <Flex
          direction="column"
          align="center"
          justify="center"
          gap={3}
          py={8}
          borderWidth="1px"
          borderStyle="dashed"
          borderColor="gray.300"
          rounded="lg"
          cursor={uploading ? "default" : "pointer"}
          onClick={() => {
            if (!uploading) fileRef.current?.click();
          }}
          _hover={uploading ? undefined : { borderColor: "#2E2F6F", bg: "gray.50" }}
          transition="all 0.15s"
        >
          <Flex w="44px" h="44px" rounded="lg" bg="gray.100" align="center" justify="center" color="gray.500">
            {uploading ? <Spinner size="sm" /> : <Upload size={20} />}
          </Flex>
          <Stack gap={0.5} textAlign="center">
            <Text fontSize="sm" fontWeight="medium" color="gray.900">
              {uploading
                ? "Uploading…"
                : "Choose file or drag and drop here to upload"}
            </Text>
            <Text fontSize="xs" color="gray.500">
              PDF, DOCX, images, ZIP — up to 50MB each
            </Text>
          </Stack>
        </Flex>

        {draft.files.length > 0 ? (
          <HStack gap={2} flexWrap="wrap" mt={4}>
            {draft.files.map((f) => (
              <HStack key={f.fileUrl} gap={2} bg="gray.100" px={3} py={1.5} rounded="full" fontSize="sm" color="gray.700">
                <Text>{f.fileName}</Text>
                <Box as="button" onClick={() => removeFile(f.fileUrl)} cursor="pointer" color="gray.500" display="flex">
                  <X size={14} />
                </Box>
              </HStack>
            ))}
          </HStack>
        ) : null}
      </Card>

      <Card title="External links">
        <HStack gap={3}>
          <TextField
            flex="1"
            placeholder="Paste a URL..."
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addLink();
            }}
          />
          <Box
            as="button"
            onClick={addLink}
            opacity={linkInput.trim() ? 1 : 0.5}
            cursor={linkInput.trim() ? "pointer" : "not-allowed"}
            bg={linkInput.trim() ? "#2E2F6F" : "gray.100"}
            color={linkInput.trim() ? "white" : "gray.400"}
            rounded="full"
            px={5}
            h="48px"
            display="flex"
            alignItems="center"
            flexShrink={0}
          >
            <Text fontSize="sm" fontWeight="medium">
              + Add link
            </Text>
          </Box>
        </HStack>

        {draft.links.length > 0 ? (
          <Stack gap={0} mt={4}>
            {draft.links.map((l) => (
              <Flex key={l} justify="space-between" align="center" py={2}>
                <Text fontSize="sm" color="#2563EB" textDecoration="underline" truncate maxW="90%">
                  {l}
                </Text>
                <Flex
                  as="button"
                  onClick={() => removeLink(l)}
                  w="24px"
                  h="24px"
                  rounded="full"
                  borderWidth="1px"
                  borderColor="gray.200"
                  align="center"
                  justify="center"
                  color="gray.500"
                  cursor="pointer"
                  _hover={{ bg: "gray.50" }}
                >
                  <X size={12} />
                </Flex>
              </Flex>
            ))}
          </Stack>
        ) : null}
      </Card>
    </Stack>
  );
}
