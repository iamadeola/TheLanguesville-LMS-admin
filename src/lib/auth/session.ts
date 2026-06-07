/**
 * Low-level browser session helpers (cookies + cached profile).
 *
 * Kept dependency-free so both the API client (which clears the session on a
 * 401) and the auth API module (which stores the token after verify-otp) can
 * import it without creating an import cycle.
 */

const TOKEN_COOKIE = "admin_token";
// Legacy cookie that used to hold the admin profile — still cleared on logout.
const LEGACY_PROFILE_COOKIE = "admin_profile";

/** localStorage key the `useAdmin` hook caches the profile under. */
export const PROFILE_CACHE_KEY = "admin_profile_cache";

// The JWT returned by verify-otp expires in 24h; match the cookie lifetime.
const TOKEN_MAX_AGE_SECS = 24 * 60 * 60;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

function writeCookie(name: string, value: string, maxAgeSecs?: number) {
  if (typeof document === "undefined") return;
  let cookie = `${name}=${encodeURIComponent(value)}; path=/; samesite=lax`;
  if (maxAgeSecs !== undefined) {
    cookie += `; max-age=${maxAgeSecs}`;
  }
  document.cookie = cookie;
}

export function getToken(): string | null {
  return readCookie(TOKEN_COOKIE);
}

export function setToken(token: string) {
  writeCookie(TOKEN_COOKIE, token, TOKEN_MAX_AGE_SECS);
}

/** Clear all client-side auth state (token cookie + cached profile). */
export function clearSession() {
  writeCookie(TOKEN_COOKIE, "", 0);
  writeCookie(LEGACY_PROFILE_COOKIE, "", 0);
  if (typeof localStorage !== "undefined") {
    try {
      localStorage.removeItem(PROFILE_CACHE_KEY);
    } catch {}
  }
}
