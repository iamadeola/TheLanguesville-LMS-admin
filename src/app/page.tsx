"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const token = getCookie("admin_token");
    router.replace(token ? "/dashboard" : "/login");
  }, [router]);

  return null;
}
