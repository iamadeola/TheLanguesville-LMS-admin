"use client";

import { IconButton } from "@chakra-ui/react";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { FormField } from "./form-field";

interface PasswordFieldProps {
  label: string;
  helperText?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
}

export function PasswordField({
  label,
  helperText,
  error,
  value,
  onChange,
  onBlur,
  placeholder,
}: PasswordFieldProps) {
  const [show, setShow] = useState(false);
  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setShow((s) => !s);
  };
  return (
    <FormField
      label={label}
      helperText={helperText}
      error={error}
      type={show ? "text" : "password"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      rightElement={
        <IconButton
          type="button"
          aria-label={show ? "Hide password" : "Show password"}
          variant="ghost"
          size="sm"
          color="gray.500"
          onClick={toggle}
          _hover={{ bg: "gray.100" }}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </IconButton>
      }
    />
  );
}
