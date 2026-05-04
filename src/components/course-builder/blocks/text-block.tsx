"use client";

import { Box, HStack, IconButton, Input, Stack } from "@chakra-ui/react";
import {
  Bold,
  ChevronDown,
  Italic,
  Link as LinkIcon,
  List,
  Underline,
} from "lucide-react";
import {
  type FormEvent,
  type MouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import type { TextBlock as TextBlockModel } from "../course-builder-context";

interface TextBlockProps {
  block: TextBlockModel;
  onChange: (html: string) => void;
}

type BlockFormat = "p" | "h1" | "h2" | "h3";

const BLOCK_OPTIONS: Array<{ value: BlockFormat; label: string }> = [
  { value: "p", label: "Normal text" },
  { value: "h1", label: "Heading 1" },
  { value: "h2", label: "Heading 2" },
  { value: "h3", label: "Heading 3" },
];

function exec(command: string, value?: string) {
  // document.execCommand is deprecated but still the simplest way to implement
  // a minimal rich-text toolbar without pulling in a heavy editor dep.
  document.execCommand(command, false, value);
}

export function TextBlock({ block, onChange }: TextBlockProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [blockFormat, setBlockFormat] = useState<BlockFormat>("p");
  const [menuOpen, setMenuOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const lastSelectionRef = useRef<Range | null>(null);

  // Only seed the editor once on mount; subsequent user input is kept inside
  // contentEditable so re-renders don't lose the caret position.
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML === "") {
      editorRef.current.innerHTML = block.html;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInput = (e: FormEvent<HTMLDivElement>) => {
    onChange(e.currentTarget.innerHTML);
  };

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      lastSelectionRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    const sel = window.getSelection();
    const range = lastSelectionRef.current;
    if (sel && range) {
      sel.removeAllRanges();
      sel.addRange(range);
    }
  };

  const runCommand = (command: string, value?: string) => {
    editorRef.current?.focus();
    restoreSelection();
    exec(command, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const applyFormat = (format: BlockFormat) => {
    setBlockFormat(format);
    setMenuOpen(false);
    runCommand("formatBlock", format.toUpperCase());
  };

  const handleToolbarMouseDown = (e: MouseEvent) => {
    // Keep the current text selection in the editor when toolbar is clicked
    e.preventDefault();
  };

  const submitLink = () => {
    if (linkUrl.trim()) {
      runCommand("createLink", linkUrl.trim());
    }
    setLinkUrl("");
    setLinkOpen(false);
  };

  const currentLabel =
    BLOCK_OPTIONS.find((o) => o.value === blockFormat)?.label ?? "Normal text";

  return (
    <Stack gap={3}>
      {/* Toolbar */}
      <HStack
        gap={1}
        pb={3}
        borderBottomWidth="1px"
        borderColor="gray.100"
        onMouseDown={handleToolbarMouseDown}
        position="relative"
      >
        {/* Block format dropdown */}
        <Box position="relative">
          <HStack
            onClick={() => setMenuOpen((v) => !v)}
            gap={1}
            px={2.5}
            py={1.5}
            borderWidth="1px"
            borderColor="gray.200"
            rounded="md"
            fontSize="sm"
            color="gray.700"
            cursor="pointer"
            _hover={{ bg: "gray.50" }}
          >
            <Box as="span">{currentLabel}</Box>
            <ChevronDown size={14} />
          </HStack>
          {menuOpen ? (
            <Box
              position="absolute"
              top="calc(100% + 4px)"
              left={0}
              minW="160px"
              bg="white"
              borderWidth="1px"
              borderColor="gray.200"
              rounded="md"
              boxShadow="md"
              zIndex={5}
              py={1}
            >
              {BLOCK_OPTIONS.map((opt) => (
                <Box
                  key={opt.value}
                  onClick={() => applyFormat(opt.value)}
                  px={3}
                  py={1.5}
                  fontSize="sm"
                  cursor="pointer"
                  _hover={{ bg: "gray.50" }}
                  color={opt.value === blockFormat ? "#2E2F6F" : "gray.800"}
                  fontWeight={opt.value === blockFormat ? "semibold" : "normal"}
                >
                  {opt.label}
                </Box>
              ))}
            </Box>
          ) : null}
        </Box>

        <ToolbarDivider />

        <ToolbarButton label="Bold" onClick={() => runCommand("bold")}>
          <Bold size={14} />
        </ToolbarButton>
        <ToolbarButton label="Italic" onClick={() => runCommand("italic")}>
          <Italic size={14} />
        </ToolbarButton>
        <ToolbarButton
          label="Underline"
          onClick={() => runCommand("underline")}
        >
          <Underline size={14} />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          label="Link"
          onClick={() => {
            saveSelection();
            setLinkOpen((v) => !v);
          }}
        >
          <LinkIcon size={14} />
        </ToolbarButton>
        <ToolbarButton
          label="Bullet list"
          onClick={() => runCommand("insertUnorderedList")}
        >
          <List size={14} />
        </ToolbarButton>

        {linkOpen ? (
          <Box
            position="absolute"
            top="calc(100% + 4px)"
            left="180px"
            bg="white"
            borderWidth="1px"
            borderColor="gray.200"
            rounded="md"
            boxShadow="md"
            zIndex={5}
            p={2}
            minW="260px"
          >
            <HStack gap={2}>
              <Input
                autoFocus
                size="sm"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitLink();
                  if (e.key === "Escape") {
                    setLinkUrl("");
                    setLinkOpen(false);
                  }
                }}
              />
              <Box
                as="span"
                onClick={submitLink}
                px={3}
                py={1.5}
                bg="#2E2F6F"
                color="white"
                rounded="md"
                fontSize="xs"
                fontWeight="medium"
                cursor="pointer"
                _hover={{ bg: "#262760" }}
              >
                Add
              </Box>
            </HStack>
          </Box>
        ) : null}
      </HStack>

      {/* Editor surface */}
      <Box
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyUp={saveSelection}
        onMouseUp={saveSelection}
        minH="180px"
        px={4}
        py={3}
        borderWidth="1px"
        borderColor="gray.200"
        rounded="md"
        fontSize="sm"
        color="gray.800"
        lineHeight="1.6"
        outline="none"
        _focusVisible={{
          borderColor: "#2E2F6F",
          boxShadow: "0 0 0 1px #2E2F6F",
        }}
        css={{
          '& h1': { fontSize: '20px', fontWeight: 700, margin: '0.5em 0' },
          '& h2': { fontSize: '17px', fontWeight: 700, margin: '0.5em 0' },
          '& h3': { fontSize: '15px', fontWeight: 700, margin: '0.5em 0' },
          '& ul': { paddingLeft: '20px', listStyle: 'disc' },
          '& ol': { paddingLeft: '20px', listStyle: 'decimal' },
          '& a': { color: '#2E2F6F', textDecoration: 'underline' },
          '&:empty::before': {
            content: '"Start writing..."',
            color: '#9CA3AF',
          },
        }}
      />
    </Stack>
  );
}

function ToolbarButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <IconButton
      aria-label={label}
      variant="ghost"
      size="xs"
      color="gray.600"
      onClick={onClick}
    >
      {children}
    </IconButton>
  );
}

function ToolbarDivider() {
  return <Box w="1px" h="18px" bg="gray.200" mx={1} />;
}
