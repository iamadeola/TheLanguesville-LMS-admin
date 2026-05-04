"use client";

import { Box, Input, type InputProps } from "@chakra-ui/react";
import { Search } from "lucide-react";

interface SearchInputProps extends Omit<InputProps, "size"> {
  placeholder?: string;
  width?: string | number;
}

export function SearchInput({
  placeholder = "Search...",
  width = "300px",
  ...rest
}: SearchInputProps) {
  return (
    <Box position="relative" w={width}>
      <Box
        position="absolute"
        left="12px"
        top="50%"
        transform="translateY(-50%)"
        color="gray.400"
        pointerEvents="none"
      >
        <Search size={16} />
      </Box>
      <Input
        placeholder={placeholder}
        h="40px"
        pl="36px"
        rounded="md"
        borderColor="gray.200"
        bg="white"
        fontSize="sm"
        _focusVisible={{
          borderColor: "#2E2F6F",
          boxShadow: "0 0 0 1px #2E2F6F",
        }}
        {...rest}
      />
    </Box>
  );
}
