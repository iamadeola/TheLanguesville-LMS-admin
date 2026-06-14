"use client";

import { Box, Flex, HStack, Stack, Text } from "@chakra-ui/react";
import {
  BarChart3,
  BookOpen,
  GraduationCap,
  LayoutGrid,
  LogOut,
  Settings,
  Star,
  type LucideIcon,
} from "lucide-react";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/lib/api/auth";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { label: "Courses", href: "/courses", icon: BookOpen },
  { label: "Assignment", href: "/assignment", icon: Star },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Students", href: "/students", icon: GraduationCap },
];

const SETTINGS_ITEM: NavItem = {
  label: "Settings",
  href: "/settings",
  icon: Settings,
};

const sharedItemStyles = {
  gap: 3,
  px: 3,
  py: 2.5,
  rounded: "md",
  fontSize: "sm",
} as const;

interface NavLinkProps {
  item: NavItem;
  active: boolean;
}

function NavLink({ item, active }: NavLinkProps) {
  const Icon = item.icon;
  return (
    <NextLink href={item.href} style={{ textDecoration: "none" }}>
      <HStack
        {...sharedItemStyles}
        bg={active ? "#F97461" : "transparent"}
        color={active ? "white" : "whiteAlpha.800"}
        fontWeight={active ? "semibold" : "medium"}
        _hover={{ bg: active ? "#F97461" : "whiteAlpha.200" }}
        transition="background 0.15s"
      >
        <Icon size={18} />
        <Text>{item.label}</Text>
      </HStack>
    </NextLink>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname?.startsWith(href);

  return (
    <Flex
      direction="column"
      w="240px"
      minH="100dvh"
      bg="#2E2F6F"
      color="white"
      px={4}
      py={5}
      position="sticky"
      top={0}
    >
      {/* Logo */}
      <HStack gap={2} px={2} mb={8} h="40px">
        <Box
          w="32px"
          h="32px"
          rounded="md"
          bg="whiteAlpha.300"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontWeight="bold"
        >
          L
        </Box>
        <Text fontWeight="bold" letterSpacing="tight">
          Languesville
        </Text>
      </HStack>

      {/* Main nav */}
      <Stack gap={1} flex="1">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} />
        ))}
      </Stack>

      {/* Footer nav */}
      <Stack gap={1} pt={4} borderTopWidth="1px" borderColor="whiteAlpha.200">
        <NavLink item={SETTINGS_ITEM} active={isActive(SETTINGS_ITEM.href)} />
        <HStack
          as="button"
          onClick={handleLogout}
          {...sharedItemStyles}
          w="full"
          textAlign="left"
          bg="transparent"
          color="whiteAlpha.800"
          fontWeight="medium"
          _hover={{ bg: "whiteAlpha.200" }}
          transition="background 0.15s"
          cursor="pointer"
        >
          <LogOut size={18} />
          <Text>Logout</Text>
        </HStack>
      </Stack>
    </Flex>
  );
}
