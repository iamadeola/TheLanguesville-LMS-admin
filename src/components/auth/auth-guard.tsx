"use client";

import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { getToken } from "@/lib/auth/session";

// The token only changes via navigation (login/logout), so no real
// subscription is needed — we just need a server-safe snapshot.
const noopSubscribe = () => () => {};

/**
 * `null` until hydrated (server + first client render), then a boolean. Reading
 * the cookie via useSyncExternalStore keeps server and client markup in sync
 * without a hydration mismatch.
 */
function useHasToken(): boolean | null {
  return useSyncExternalStore(
    noopSubscribe,
    () => Boolean(getToken()),
    () => null,
  );
}

/**
 * Client-side gate for the authenticated app shell. Redirects to /login when
 * no token is present. Expired/invalid tokens are caught separately by the API
 * client, which clears the session and redirects on a 401.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const hasToken = useHasToken();

  useEffect(() => {
    if (hasToken === false) {
      router.replace("/login");
    }
  }, [hasToken, router]);

  if (!hasToken) return null;

  return <>{children}</>;
}
