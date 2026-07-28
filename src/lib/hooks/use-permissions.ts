"use client";

import { useEffect, useState } from "react";
import { type Permission, getMyPermissions } from "@/lib/api/settings";
import { getToken } from "@/lib/auth/session";

/**
 * One in-flight request per token, shared by every caller.
 *
 * The sidebar and the gated pages all ask for the same set on each navigation,
 * which would otherwise be three identical round-trips per page. Keying on the
 * token means a different session can never read the previous one's answer.
 */
let cache: { token: string; promise: Promise<Permission[]> } | null = null;

function loadPermissions(): Promise<Permission[]> {
  const token = getToken() ?? "";
  if (cache && cache.token === token) return cache.promise;

  const promise = getMyPermissions().then((result) => {
    // Don't cache a failure — the next mount should get a fresh attempt.
    if (!result.success) {
      if (cache?.token === token) cache = null;
      return [];
    }
    return result.data.permissions;
  });

  cache = { token, promise };
  return promise;
}

/**
 * The signed-in admin's effective permissions — the same set the backend's
 * `requirePermission` guards enforce. Use this to show/hide tabs, nav entries
 * and actions rather than checking the coarse account `role`, which no longer
 * tells the whole story once custom roles exist.
 */
export function usePermissions() {
  const [permissions, setPermissions] = useState<Permission[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    loadPermissions().then((result) => {
      if (cancelled) return;
      // A failure leaves the set empty, which hides the gated surfaces — the
      // safe default, and those endpoints would 403 anyway.
      setPermissions(result);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const has = (permission: Permission) =>
    permissions?.includes(permission) ?? false;

  return { permissions, loading, has };
}
