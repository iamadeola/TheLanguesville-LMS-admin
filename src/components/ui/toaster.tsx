"use client";

import { useEffect, useState } from "react";
import { Toaster as SonnerToaster } from "sonner";

/**
 * Client-only wrapper around sonner's Toaster.
 *
 * Rendering the Toaster during SSR caused a hydration mismatch: Chakra's emotion
 * runtime injects a global <style> tag into <body>, and on the server it landed
 * exactly where sonner's <section> renders on the client, so React saw the two
 * trees diverge. The Toaster is an overlay that's only useful after interaction,
 * so we mount it on the client only — the server renders nothing in its place
 * and there's nothing left to mismatch.
 */
export function Toaster() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <SonnerToaster position="top-right" richColors closeButton />;
}
