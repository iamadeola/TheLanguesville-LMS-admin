"use client";

import { useEffect, useState } from "react";
import { type Permission, getMyPermissions } from "@/lib/api/settings";

/**
 * The signed-in admin's effective permissions — the same set the backend's
 * `requirePermission` guards enforce. Use this to show/hide the management
 * tabs and actions rather than checking the coarse account `role`, which no
 * longer tells the whole story once custom roles exist.
 */
export function usePermissions() {
  const [permissions, setPermissions] = useState<Permission[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getMyPermissions().then((result) => {
      if (cancelled) return;
      // A failure leaves the set empty, which hides the gated tabs — the safe
      // default, and the gated endpoints would 403 anyway.
      setPermissions(result.success ? result.data.permissions : []);
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
