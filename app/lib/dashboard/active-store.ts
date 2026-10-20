"use client";

/**
 * Active store selection for the preview workspace.
 *
 * Per the workflow spec (§4.3, §5.3) a real store switch must be revalidated by
 * the server against the user's active memberships before the context changes.
 * Until that API exists the choice only lives in sessionStorage, which is UI
 * state — not an access decision.
 */

import { useSyncExternalStore } from "react";

const KEY = "sushrusa_active_store";
const EVENT = "sushrusa:active-store";

function read(): string | null {
  try {
    return window.sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function setActiveStoreId(id: string) {
  try {
    window.sessionStorage.setItem(KEY, id);
  } catch {
    // Storage unavailable (private mode): selection falls back to the first assigned store.
  }
  window.dispatchEvent(new Event(EVENT));
}

/** Returns the stored store id if it is one of `allowed`, else the first allowed id. */
export function useActiveStoreId(allowed: string[]): string | null {
  const stored = useSyncExternalStore(subscribe, read, () => null);
  if (stored && allowed.includes(stored)) return stored;
  return allowed[0] ?? null;
}
