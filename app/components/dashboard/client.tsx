"use client";

import type { ReactNode } from "react";
import { useWorkspace } from "./DashboardShell";

/**
 * Button for an action whose module isn't built yet. It looks and behaves like
 * a real control but only explains that the feature is planned — it never
 * pretends an operation happened.
 */
export function PlannedButton({
  feature, children, className = "btn btn-outline btn-sm",
}: { feature: string; children: ReactNode; className?: string }) {
  const { notify } = useWorkspace();
  return (
    <button type="button" className={className} onClick={() => notify(`${feature} is planned for a later milestone.`)}>
      {children}
    </button>
  );
}

/** Name of the store currently selected in the topbar switcher. */
export function ActiveStoreName({ withCode = false }: { withCode?: boolean }) {
  const { activeStore } = useWorkspace();
  if (!activeStore) return <>No active store</>;
  return <>{activeStore.name}{withCode ? ` (${activeStore.code})` : ""}</>;
}
