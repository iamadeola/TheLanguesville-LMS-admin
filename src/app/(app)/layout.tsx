import { Flex, Box } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Sidebar } from "@/components/dashboard/sidebar";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <Flex minH="100dvh" bg="#F9FAFB">
        <Sidebar />
        <Box flex="1" minW="0">
          {children}
        </Box>
      </Flex>
    </AuthGuard>
  );
}
