"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext, useCallback, useContext, useEffect, useRef, useState,
  type ReactNode, type RefObject,
} from "react";
import {
  Bell, Building2, Check, ChevronDown, CircleAlert, Info, LogOut, Menu, ShieldCheck,
  Store, TriangleAlert, UserRound, X,
} from "lucide-react";
import { authApi, tokenStorage } from "../../lib/api";
import { ROLES, type RoleKey } from "../../lib/dashboard/roles";
import { SAMPLE_ORG, SAMPLE_STORES, SAMPLE_USERS, type Notification, type StoreSummary } from "../../lib/dashboard/sample-data";
import { setActiveStoreId, useActiveStoreId } from "../../lib/dashboard/active-store";
import { NAV_ICONS } from "./icons";

// ─── Workspace context ──────────────────────────────────────────────────────

interface WorkspaceValue {
  role: RoleKey;
  activeStore: StoreSummary | null;
  /** Short, non-blocking message (e.g. "module not built yet"). */
  notify: (message: string) => void;
}

const WorkspaceContext = createContext<WorkspaceValue | null>(null);

export function useWorkspace(): WorkspaceValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used inside <DashboardShell>");
  return ctx;
}

// ─── Small hooks ────────────────────────────────────────────────────────────

/** Closes a popover on outside click or Escape. */
function useDismiss(ref: RefObject<HTMLElement | null>, open: boolean, close: () => void) {
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [ref, open, close]);
}

// ─── Shell ──────────────────────────────────────────────────────────────────

export default function DashboardShell({
  role, notifications, children,
}: { role: RoleKey; notifications: Notification[]; children: ReactNode }) {
  const config = ROLES[role];
  const user = SAMPLE_USERS[role];
  const pathname = usePathname();

  const assignedStores = SAMPLE_STORES.filter((s) => user.storeIds.includes(s.id) && s.status === "active");
  const activeStoreId = useActiveStoreId(assignedStores.map((s) => s.id));
  const activeStore = config.scope === "store" ? assignedStores.find((s) => s.id === activeStoreId) ?? null : null;

  const [navOpen, setNavOpen] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; message: string }[]>([]);
  const toastSeq = useRef(0);

  const notify = useCallback((message: string) => {
    const id = ++toastSeq.current;
    setToasts((t) => [...t.slice(-2), { id, message }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  return (
    <WorkspaceContext.Provider value={{ role, activeStore, notify }}>
      <div className="ws-app" data-nav-open={navOpen}>
        <a href="#ws-main" className="sr-only">Skip to content</a>

        {/* ── Sidebar ─────────────────────────────────────────────── */}
        <aside className="ws-sidebar" id="ws-sidebar" aria-label="Workspace navigation">
          <div className="ws-brand">
            <span className="ws-brand-mark" aria-hidden="true"><ShieldCheck size={16} /></span>
            <span className="ws-brand-name">Sushrusa</span>
            <button
              type="button"
              className="ws-icon-btn ws-menu-btn"
              style={{ marginLeft: "auto" }}
              onClick={() => setNavOpen(false)}
              aria-label="Close navigation"
            >
              <X size={18} />
            </button>
          </div>

          <div className="ws-org">
            <div className="ws-org-label">{config.scope === "platform" ? "Console" : "Organization"}</div>
            <div className="ws-org-name">{config.scope === "platform" ? "Sushrusa Platform" : SAMPLE_ORG.name}</div>
            <div className="ws-org-role">{config.label}</div>
          </div>

          <nav className="ws-nav">
            {config.nav.map((section, i) => (
              <div className="ws-nav-section" key={section.title ?? i}>
                {section.title && <div className="ws-nav-title">{section.title}</div>}
                <ul className="ws-nav-list">
                  {section.items.map((item) => {
                    const Icon = NAV_ICONS[item.icon];
                    if (!item.href) {
                      return (
                        <li key={item.label}>
                          <button
                            type="button"
                            className="ws-nav-item"
                            aria-disabled="true"
                            onClick={() => notify(`${item.label} is planned for a later milestone.`)}
                          >
                            <Icon size={17} aria-hidden="true" />
                            {item.label}
                            <span className="ws-soon">Soon</span>
                          </button>
                        </li>
                      );
                    }
                    return (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          className="ws-nav-item"
                          aria-current={pathname === item.href ? "page" : undefined}
                          onClick={() => setNavOpen(false)}
                        >
                          <Icon size={17} aria-hidden="true" />
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          <div className="ws-sidebar-foot">
            <Info size={14} aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }} />
            <span>Menus reflect this role&apos;s workspace. Every action is still permission-checked on the server.</span>
          </div>
        </aside>
        <div className="ws-scrim" onClick={() => setNavOpen(false)} aria-hidden="true" />

        {/* ── Main ────────────────────────────────────────────────── */}
        <div className="ws-main">
          <header className="ws-topbar">
            <button
              type="button"
              className="ws-icon-btn ws-menu-btn"
              onClick={() => setNavOpen(true)}
              aria-label="Open navigation"
              aria-controls="ws-sidebar"
              aria-expanded={navOpen}
            >
              <Menu size={20} />
            </button>

            <div className="ws-context">
              <span className="ws-context-org">{config.scope === "platform" ? "Platform" : SAMPLE_ORG.name}</span>
              <span className="ws-context-sep" aria-hidden="true">/</span>
              <ScopeSwitcher scope={config.scope} stores={assignedStores} active={activeStore} notify={notify} />
            </div>

            <div className="ws-topbar-actions">
              <NotificationsMenu items={notifications} />
              <UserMenu name={user.name} initials={user.initials} email={user.email} roleLabel={config.label} />
            </div>
          </header>

          <main id="ws-main" className="ws-content" tabIndex={-1}>
            {children}
          </main>
        </div>

        <div className="toast-container" aria-live="polite">
          {toasts.map((t) => (
            <div key={t.id} className="toast" role="status">
              <Info size={16} aria-hidden="true" style={{ color: "var(--color-info)", flexShrink: 0, marginTop: 2 }} />
              <span>{t.message}</span>
            </div>
          ))}
        </div>
      </div>
    </WorkspaceContext.Provider>
  );
}

// ─── Scope / store switcher ─────────────────────────────────────────────────

function ScopeSwitcher({
  scope, stores, active, notify,
}: { scope: "organization" | "store" | "platform"; stores: StoreSummary[]; active: StoreSummary | null; notify: (m: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);

  if (scope === "platform") {
    return <span className="ws-switcher" aria-label="Scope"><ShieldCheck size={15} aria-hidden="true" /> Platform console</span>;
  }

  if (scope === "organization") {
    const total = SAMPLE_STORES.length;
    return (
      <span className="ws-switcher" aria-label="Scope">
        <Building2 size={15} aria-hidden="true" />
        <span className="ws-switcher-text">All branches</span>
        <span className="ws-switcher-code">{total}</span>
      </span>
    );
  }

  if (!active) {
    return <span className="ws-switcher"><Store size={15} aria-hidden="true" /> No active store</span>;
  }

  const canSwitch = stores.length > 1;
  return (
    <div className="ws-popover-anchor" ref={ref}>
      <button
        type="button"
        className="ws-switcher"
        onClick={() => setOpen((v) => !v)}
        disabled={!canSwitch}
        aria-haspopup={canSwitch ? "menu" : undefined}
        aria-expanded={canSwitch ? open : undefined}
        aria-label={`Active store: ${active.name} (${active.code})${canSwitch ? ". Switch store" : ""}`}
      >
        <Store size={15} aria-hidden="true" />
        <span className="ws-switcher-text">{active.name}</span>
        <span className="ws-switcher-code">{active.code}</span>
        {canSwitch && <ChevronDown size={14} aria-hidden="true" />}
      </button>
      {open && (
        <div className="ws-popover align-left" role="menu" aria-label="Assigned stores">
          <div className="ws-popover-head">Your assigned stores</div>
          {stores.map((s) => (
            <button
              key={s.id}
              type="button"
              role="menuitemradio"
              aria-checked={s.id === active.id}
              className="ws-menu-item"
              onClick={() => {
                setActiveStoreId(s.id);
                setOpen(false);
                if (s.id !== active.id) notify(`Switched to ${s.name} (${s.code}).`);
              }}
            >
              <Store size={15} aria-hidden="true" />
              <span>{s.name}<span className="ws-list-sub" style={{ display: "block" }}>{s.city}</span></span>
              <span className="muted">{s.id === active.id ? <Check size={15} aria-label="Current" /> : s.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Notifications ──────────────────────────────────────────────────────────

const SEVERITY_ICON = {
  critical: { Icon: CircleAlert, color: "var(--color-error)", label: "Critical" },
  warning: { Icon: TriangleAlert, color: "#b45309", label: "Warning" },
  info: { Icon: Info, color: "var(--color-info)", label: "Info" },
} as const;

function NotificationsMenu({ items }: { items: Notification[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);

  return (
    <div className="ws-popover-anchor" ref={ref}>
      <button
        type="button"
        className="ws-icon-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Notifications, ${items.length} unread`}
      >
        <Bell size={19} />
        {items.length > 0 && <span className="ws-dot-count" aria-hidden="true">{items.length}</span>}
      </button>
      {open && (
        <div className="ws-popover align-right" role="dialog" aria-label="Notifications" style={{ width: "22rem" }}>
          <div className="ws-popover-head">Notifications</div>
          {items.length === 0 ? (
            <div className="ws-empty">You&apos;re all caught up.</div>
          ) : (
            items.map((n) => {
              const s = SEVERITY_ICON[n.severity];
              return (
                <div key={n.id} className="ws-notif">
                  <s.Icon size={16} style={{ color: s.color, flexShrink: 0, marginTop: 2 }} aria-label={s.label} />
                  <div>
                    <div className="ws-notif-title">{n.title}</div>
                    <div className="ws-notif-detail">{n.detail}</div>
                    <div className="ws-notif-time">{n.time}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// ─── User menu + logout ─────────────────────────────────────────────────────

function UserMenu({ name, initials, email, roleLabel }: { name: string; initials: string; email: string; roleLabel: string }) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);

  return (
    <div className="ws-popover-anchor" ref={ref}>
      <button
        type="button"
        className="ws-user-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${name}`}
      >
        <span className="ws-avatar" aria-hidden="true">{initials}</span>
        <span className="ws-user-meta">
          <span className="ws-user-name" style={{ display: "block" }}>{name}</span>
          <span className="ws-user-role">{roleLabel}</span>
        </span>
        <ChevronDown size={14} aria-hidden="true" style={{ color: "var(--color-subtle)" }} />
      </button>
      {open && (
        <div className="ws-popover align-right" role="menu" aria-label="Account">
          <div style={{ padding: "0.5rem 0.625rem" }}>
            <div className="ws-user-name">{name}</div>
            <div className="ws-user-role">{email}</div>
          </div>
          <div className="ws-menu-sep" />
          <Link href="/dashboard" role="menuitem" className="ws-menu-item">
            <UserRound size={15} aria-hidden="true" /> Switch preview role
          </Link>
          <button type="button" role="menuitem" className="ws-menu-item" onClick={() => { setOpen(false); setConfirming(true); }}>
            <LogOut size={15} aria-hidden="true" /> Log out
          </button>
        </div>
      )}
      {confirming && <LogoutDialog onCancel={() => setConfirming(false)} />}
    </div>
  );
}

/**
 * Spec §4.5: optional confirmation, server-side invalidation, then clear client
 * state. If the server can't confirm, say so instead of pretending it worked.
 */
function LogoutDialog({ onCancel }: { onCancel: () => void }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !busy) onCancel(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [busy, onCancel]);

  const logout = async () => {
    setBusy(true);
    setError(null);
    try {
      await authApi.logout();
      tokenStorage.clear();
      router.push("/login?reason=logged-out");
    } catch {
      setError("We couldn't confirm logout with the server, so your session may still be active. Check your connection and try again.");
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" role="presentation" onClick={(e) => { if (e.target === e.currentTarget && !busy) onCancel(); }}>
      <div className="modal-dialog" role="alertdialog" aria-modal="true" aria-labelledby="logout-title" aria-describedby="logout-desc" style={{ padding: "1.5rem" }}>
        <h2 id="logout-title" style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--navy)", margin: "0 0 0.375rem" }}>Log out of Sushrusa?</h2>
        <p id="logout-desc" style={{ fontSize: "0.875rem", color: "var(--color-muted)", margin: "0 0 1rem" }}>
          You&apos;ll need to sign in again to access this workspace.
        </p>
        {error && (
          <div className="alert alert-error" role="alert" style={{ marginBottom: "1rem" }}>
            <CircleAlert size={16} aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{error}</span>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
          <button ref={cancelRef} type="button" className="btn btn-outline" onClick={onCancel} disabled={busy}>Cancel</button>
          <button type="button" className={`btn btn-danger${busy ? " btn-loading" : ""}`} onClick={logout} disabled={busy} aria-busy={busy}>
            {busy ? "Logging out…" : error ? "Try again" : "Log out"}
          </button>
        </div>
      </div>
    </div>
  );
}
