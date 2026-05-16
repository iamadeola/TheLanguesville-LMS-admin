"use client";

import { useEffect, useState } from "react";
import { type AdminProfile, getMe } from "@/lib/api/auth";

const CACHE_KEY = "admin_profile_cache";

function readCache(): AdminProfile | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as AdminProfile) : null;
  } catch {
    return null;
  }
}

function writeCache(profile: AdminProfile) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(profile));
  } catch {}
}

export function useAdmin() {
  const [admin, setAdmin] = useState<AdminProfile | null>(() => readCache());
  const [loading, setLoading] = useState(() => readCache() === null);

  useEffect(() => {
    if (!loading) return;
    getMe().then((result) => {
      if (result.success) {
        writeCache(result.data);
        setAdmin(result.data);
      }
      setLoading(false);
    });
  }, [loading]);

  return { admin, loading };
}
