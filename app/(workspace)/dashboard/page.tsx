import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Eye, ShieldCheck, Store } from "lucide-react";
import { ROLES, ROLE_ORDER } from "../../lib/dashboard/roles";
import { NAV_ICONS } from "../../components/dashboard/icons";

export const metadata: Metadata = {
  title: "Choose a workspace",
};

const ROLE_ICON = {
  owner: NAV_ICONS.organizations,
  manager: NAV_ICONS.store,
  cashier: NAV_ICONS.pos,
  pharmacist: NAV_ICONS.dispense,
  inventory: NAV_ICONS.stock,
  accountant: NAV_ICONS.tax,
  "platform-admin": NAV_ICONS.support,
} as const;

const SCOPE_LABEL = { organization: "All branches", store: "Assigned stores", platform: "Platform only" } as const;

/**
 * Until authentication is wired to the backend, the role a user lands on can't
 * be known, so this page lets reviewers open each role's workspace directly.
 * After login integration, owners go straight to their dashboard and employees
 * go through /select-store (workflow spec §4.3).
 */
export default function WorkspaceChooserPage() {
  return (
    <div className="ws-center-page">
      <div className="ws-center-inner">
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem" }}>
          <span className="ws-brand-mark" aria-hidden="true"><ShieldCheck size={16} /></span>
          <span className="ws-brand-name">Sushrusa</span>
        </Link>

        <div className="ws-preview" role="note" style={{ marginBottom: "1.5rem" }}>
          <Eye size={16} aria-hidden="true" />
          <span>
            <strong>Workspace preview.</strong> Sign-in isn&apos;t connected to a backend yet, so pick a role to review its
            dashboard with sample data. In production, the server decides your role and the stores you can open.
          </span>
        </div>

        <h1 className="ws-title" style={{ fontSize: "1.875rem" }}>Choose a workspace</h1>
        <p className="ws-subtitle" style={{ marginBottom: "1.75rem" }}>
          Each role sees a dashboard tailored to its responsibilities and data scope.
        </p>

        <div className="ws-role-grid">
          {ROLE_ORDER.map((key) => {
            const role = ROLES[key];
            const Icon = ROLE_ICON[key];
            const href = role.scope === "store" ? `/select-store?role=${key}` : role.home;
            return (
              <Link key={key} href={href} className="ws-role-card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span className="ws-kpi-icon" aria-hidden="true" style={{ width: "2.5rem", height: "2.5rem" }}><Icon size={18} /></span>
                  <span className="ws-pill neutral">
                    {role.scope === "store" && <Store size={12} aria-hidden="true" />}
                    {SCOPE_LABEL[role.scope]}
                  </span>
                </div>
                <h2>{role.label}</h2>
                <p>{role.summary}</p>
                <span className="go">Open dashboard <ArrowRight size={14} aria-hidden="true" /></span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
