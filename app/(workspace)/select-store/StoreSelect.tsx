"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ChevronRight, CircleAlert, Eye, MapPin, ShieldCheck, Store } from "lucide-react";
import { ROLES, type RoleKey } from "../../lib/dashboard/roles";
import { SAMPLE_STORES, SAMPLE_USERS } from "../../lib/dashboard/sample-data";
import { setActiveStoreId } from "../../lib/dashboard/active-store";

/**
 * Post-login store selection for employees (workflow spec §4.3 steps 15–17):
 * list only active assigned stores; with none, explain who to contact.
 */
export default function StoreSelect() {
  const router = useRouter();
  const params = useSearchParams();
  const roleKey = params.get("role") as RoleKey | null;
  const role = roleKey && roleKey in ROLES ? ROLES[roleKey] : null;
  const user = roleKey ? SAMPLE_USERS[roleKey] : undefined;
  const stores = SAMPLE_STORES.filter((s) => user?.storeIds.includes(s.id) && s.status === "active");
  const [pending, setPending] = useState<string | null>(null);

  const choose = (id: string) => {
    if (!role) return;
    setPending(id);
    // Production: the server revalidates this membership before switching context.
    setActiveStoreId(id);
    router.push(role.home);
  };

  return (
    <div className="ws-center-inner" style={{ maxWidth: "30rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.75rem" }}>
        <span className="ws-brand-mark" aria-hidden="true"><ShieldCheck size={16} /></span>
        <span className="ws-brand-name">Sushrusa</span>
      </div>

      <div className="card" style={{ padding: "1.75rem" }}>
        {role && user && stores.length > 0 ? (
          <>
            <h1 className="ws-title" style={{ fontSize: "1.375rem" }}>Choose your store</h1>
            <p className="ws-subtitle" style={{ marginBottom: "1.25rem" }}>
              Signed in as <strong style={{ color: "var(--navy)" }}>{user.name}</strong> · {role.label}. You can switch
              stores later from the top bar.
            </p>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {stores.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    className="ws-store-option"
                    onClick={() => choose(s.id)}
                    disabled={pending !== null}
                    aria-busy={pending === s.id}
                  >
                    <span className="ws-kpi-icon" aria-hidden="true" style={{ width: "2.5rem", height: "2.5rem" }}><Store size={18} /></span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span className="ws-list-title" style={{ display: "block" }}>{s.name}</span>
                      <span className="ws-list-sub" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <MapPin size={12} aria-hidden="true" /> {s.city} · {s.code}
                      </span>
                    </span>
                    {pending === s.id
                      ? <span className="ws-list-sub">Opening…</span>
                      : <ChevronRight size={18} aria-hidden="true" style={{ color: "var(--color-subtle)" }} />}
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div role="alert">
            <span className="ws-kpi-icon tone-warning" aria-hidden="true" style={{ width: "2.75rem", height: "2.75rem", marginBottom: "1rem" }}>
              <CircleAlert size={20} />
            </span>
            <h1 className="ws-title" style={{ fontSize: "1.375rem" }}>No store access available</h1>
            <p className="ws-subtitle">
              Your account doesn&apos;t have an active store membership right now. Contact your pharmacy owner or store
              manager to be assigned to a store.
            </p>
          </div>
        )}
      </div>

      <div className="ws-preview" role="note" style={{ marginTop: "1rem" }}>
        <Eye size={16} aria-hidden="true" />
        <span>Preview: stores and assignments are sample data.</span>
      </div>

      <Link href="/dashboard" className="btn btn-ghost btn-sm" style={{ marginTop: "1rem" }}>
        <ArrowLeft size={14} aria-hidden="true" /> Back to roles
      </Link>
    </div>
  );
}
