import type { Metadata } from "next";
import { Activity, Building2, LifeBuoy, Megaphone, Store, Users, UserX } from "lucide-react";
import DashboardShell from "../../../components/dashboard/DashboardShell";
import { ColumnChart } from "../../../components/dashboard/charts";
import { PlannedButton } from "../../../components/dashboard/client";
import { KpiCard, PageHeader, Panel, Pill, PreviewNotice, type PillTone } from "../../../components/dashboard/ui";
import { formatCount } from "../../../lib/dashboard/format";
import { ADMIN_DATA, type TenantStatus } from "../../../lib/dashboard/sample-data";

export const metadata: Metadata = { title: "Platform Admin Dashboard" };

const TENANT_STATUS: Record<TenantStatus, { tone: PillTone; label: string }> = {
  active: { tone: "success", label: "Active" },
  trial: { tone: "info", label: "Trial" },
  suspended: { tone: "critical", label: "Suspended" },
  "setup-pending": { tone: "warning", label: "Setup pending" },
};

const HEALTH: Record<string, { tone: PillTone; label: string }> = {
  operational: { tone: "success", label: "Operational" },
  degraded: { tone: "warning", label: "Degraded" },
  "not-configured": { tone: "neutral", label: "Not configured" },
};

export default function AdminDashboardPage() {
  const d = ADMIN_DATA;
  const activeSupport = d.supportSessions.filter((s) => s.state === "active").length;

  return (
    <DashboardShell role="platform-admin" notifications={d.notifications}>
      <PreviewNotice />

      <PageHeader
        eyebrow="Platform console"
        title="Platform overview"
        subtitle="Tenant metadata only. Business data needs owner-approved, time-limited support access."
        actions={
          <PlannedButton feature="Platform announcements" className="btn btn-primary btn-sm"><Megaphone size={14} aria-hidden="true" /> Post announcement</PlannedButton>
        }
      />

      <div className="ws-kpis">
        <KpiCard label="Organizations" value={formatCount(d.kpis.organizations)} icon={Building2} tone="navy" foot={`${d.kpis.active} active · ${d.kpis.trial} trial`} />
        <KpiCard label="Suspended" value={d.kpis.suspended} icon={UserX} tone="critical" foot="data retained" />
        <KpiCard label="Stores" value={formatCount(d.kpis.stores)} icon={Store} />
        <KpiCard label="Users" value={formatCount(d.kpis.users)} icon={Users} tone="info" />
        <KpiCard label="Active support sessions" value={activeSupport} icon={LifeBuoy} tone="warning" foot="owner-consented" />
      </div>

      <div className="ws-row split-2-1">
        <Panel id="signups" title="New organizations" description="Registrations per month, last 6 months">
          <ColumnChart
            data={d.signups.map((s) => ({ label: s.label, values: [s.value] }))}
            series={[{ name: "Registrations", color: "primary" }]}
            label="New organization registrations per month"
            unit="count"
            height={200}
            highlightLast
          />
        </Panel>

        <Panel id="health" title="Service health" action={<Activity size={18} aria-hidden="true" style={{ color: "var(--color-subtle)" }} />} flush>
          <ul className="ws-list">
            {d.health.map((h) => {
              const st = HEALTH[h.status];
              return (
                <li key={h.service} className="ws-list-item">
                  <div className="ws-list-main"><div className="ws-list-title" style={{ fontWeight: 500 }}>{h.service}</div></div>
                  <Pill tone={st.tone}>{st.label}</Pill>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      <Panel id="orgs" title="Organizations" description="Recently active and recently registered tenants" flush>
        <div className="ws-table-wrap">
          <table className="ws-table">
            <thead>
              <tr>
                <th scope="col">Organization</th>
                <th scope="col">Owner</th>
                <th scope="col" className="num">Stores</th>
                <th scope="col" className="num">Users</th>
                <th scope="col">Status</th>
                <th scope="col">Registered</th>
                <th scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {d.organizations.map((o) => {
                const st = TENANT_STATUS[o.status];
                return (
                  <tr key={o.name}>
                    <td className="strong">{o.name}</td>
                    <td>{o.owner}</td>
                    <td className="num">{o.stores}</td>
                    <td className="num">{o.users}</td>
                    <td><Pill tone={st.tone}>{st.label}</Pill></td>
                    <td>{o.created}</td>
                    <td className="num"><PlannedButton feature="Organization management" className="btn btn-ghost btn-sm">Manage</PlannedButton></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel
        id="support"
        title="Support access"
        description="Requests and sessions for tenant data access"
        flush
        footer="Support access requires owner consent, is read-only by default, expires automatically and is fully audited."
      >
        <ul className="ws-list">
          {d.supportSessions.map((s) => (
            <li key={s.org} className="ws-list-item">
              <span className="ws-kpi-icon tone-info" aria-hidden="true"><LifeBuoy size={16} /></span>
              <div className="ws-list-main">
                <div className="ws-list-title">{s.org}</div>
                <div className="ws-list-sub">{s.reason} · {s.granted}</div>
              </div>
              <div className="ws-list-end">
                {s.state === "active"
                  ? <Pill tone="warning">Active · ends {s.expires}</Pill>
                  : <Pill tone="neutral">Awaiting consent</Pill>}
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </DashboardShell>
  );
}
