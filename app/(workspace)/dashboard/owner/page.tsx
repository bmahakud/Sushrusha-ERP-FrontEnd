import type { Metadata } from "next";
import {
  Building2, CalendarClock, CircleCheck, Circle, Download, IndianRupee, PackageX, Plus, ReceiptText, UserPlus,
} from "lucide-react";
import DashboardShell from "../../../components/dashboard/DashboardShell";
import { AreaTrend } from "../../../components/dashboard/charts";
import { PlannedButton } from "../../../components/dashboard/client";
import { KpiCard, Meter, PageHeader, Panel, Pill, PreviewNotice } from "../../../components/dashboard/ui";
import { formatCount, formatINR, formatINRCompact } from "../../../lib/dashboard/format";
import { OWNER_DATA, SAMPLE_ORG, SAMPLE_USERS } from "../../../lib/dashboard/sample-data";
import BranchPerformance from "./BranchPerformance";

export const metadata: Metadata = { title: "Owner Dashboard" };

const ALERT_TONE = { critical: "critical", warning: "warning", info: "info" } as const;

export default function OwnerDashboardPage() {
  const d = OWNER_DATA;
  const user = SAMPLE_USERS.owner;
  const alertMax = Math.max(...d.inventoryAlerts.map((a) => a.count));
  const checklistDone = d.setupChecklist.filter((c) => c.done).length;

  return (
    <DashboardShell role="owner" notifications={d.notifications}>
      <PreviewNotice />

      <PageHeader
        eyebrow="Organization overview"
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        subtitle={`${SAMPLE_ORG.name} · ${d.kpis.stores.total} branches · Tuesday, 20 October 2026`}
        actions={
          <>
            <PlannedButton feature="Reports export" className="btn btn-outline btn-sm"><Download size={14} aria-hidden="true" /> Export</PlannedButton>
            <PlannedButton feature="Staff invitations" className="btn btn-outline btn-sm"><UserPlus size={14} aria-hidden="true" /> Invite staff</PlannedButton>
            <PlannedButton feature="Store Management" className="btn btn-primary btn-sm"><Plus size={14} aria-hidden="true" /> Add store</PlannedButton>
          </>
        }
      />

      <div className="ws-kpis">
        <KpiCard
          label="Sales today · all branches"
          value={formatINRCompact(d.kpis.salesToday)}
          icon={IndianRupee}
          delta={d.kpis.salesDeltaPct}
          foot="vs last Tuesday"
        />
        <KpiCard label="Bills today" value={formatCount(d.kpis.billsToday)} icon={ReceiptText} tone="navy" foot="across 3 trading branches" />
        <KpiCard
          label="Branches"
          value={`${d.kpis.stores.active} active`}
          icon={Building2}
          tone="info"
          foot={<Pill tone="warning">{d.kpis.stores.setupPending} setup pending</Pill>}
        />
        <KpiCard label="Below reorder level" value={formatCount(d.kpis.lowStock)} icon={PackageX} tone="warning" foot="products across branches" />
        <KpiCard
          label="Expiry & blocked batches"
          value={formatCount(d.kpis.nearExpiry + d.kpis.blockedBatches)}
          icon={CalendarClock}
          tone="critical"
          foot={`${d.kpis.nearExpiry} near expiry · ${d.kpis.blockedBatches} blocked`}
        />
      </div>

      <div className="ws-row split-2-1">
        <Panel id="sales-trend" title="Organization sales" description="Daily sales, last 30 days · all branches">
          <AreaTrend data={d.salesTrend} label="Organization daily sales, last 30 days" unit="inr" height={300} />
        </Panel>

        <Panel
          id="inv-alerts"
          title="Inventory alerts"
          description="Batches needing attention across branches"
          flush
          footer="Expired, recalled and quarantined batches are blocked from sale automatically."
        >
          <ul className="ws-list">
            {d.inventoryAlerts.map((a) => (
              <li key={a.label} className="ws-list-item" style={{ flexWrap: "wrap" }}>
                <div className="ws-list-main">
                  <div className="ws-list-title" style={{ fontWeight: 500 }}>{a.label}</div>
                  <div style={{ marginTop: "0.375rem" }}>
                    <Meter value={a.count} max={alertMax} tone={a.severity === "info" ? undefined : a.severity} label={a.label} />
                  </div>
                </div>
                <div className="ws-list-end"><Pill tone={ALERT_TONE[a.severity]}>{a.count}</Pill></div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <BranchPerformance />

      <div className="ws-row split-2-1">
        <Panel
          id="approvals"
          title="Pending approvals"
          description="High-impact actions waiting for an authorized decision"
          flush
          action={<Pill tone="warning">{d.approvals.length} waiting</Pill>}
        >
          <div className="ws-table-wrap">
            <table className="ws-table">
              <thead>
                <tr>
                  <th scope="col">Request</th>
                  <th scope="col">Branch</th>
                  <th scope="col">Raised by</th>
                  <th scope="col" className="num">Amount</th>
                  <th scope="col" className="num">Age</th>
                  <th scope="col"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {d.approvals.map((a) => (
                  <tr key={a.id}>
                    <td><span className="strong">{a.type}</span><span className="sub ws-mono">{a.ref}</span></td>
                    <td><span className="ws-mono">{a.store}</span></td>
                    <td>{a.by}</td>
                    <td className="num strong">{formatINR(a.amount)}</td>
                    <td className="num">{a.age}</td>
                    <td className="num"><PlannedButton feature="Approval review" className="btn btn-outline btn-sm">Review</PlannedButton></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel id="staff" title="Staff & access" description="Memberships across the organization">
          <dl style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", margin: 0 }}>
            {[
              { k: "Active staff", v: d.staff.active, tone: "success" as const },
              { k: "Pending invites", v: d.staff.pendingInvites, tone: "info" as const },
              { k: "Expired invites", v: d.staff.expiredInvites, tone: "warning" as const },
              { k: "Inactive memberships", v: d.staff.inactiveMemberships, tone: "neutral" as const },
            ].map((s) => (
              <div key={s.k} style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "0.75rem" }}>
                <dt style={{ fontSize: "0.75rem", color: "var(--color-muted)" }}>{s.k}</dt>
                <dd style={{ margin: "0.125rem 0 0", fontSize: "1.375rem", fontWeight: 700, color: "var(--navy)" }}>{s.v}</dd>
              </div>
            ))}
          </dl>
          <p style={{ fontSize: "0.75rem", color: "var(--color-muted)", margin: "0.875rem 0 0" }}>
            Invitation links are single-use and expire after 24 hours.
          </p>
        </Panel>
      </div>

      <div className="ws-row split-2-1">
        <Panel id="audit" title="Recent activity" description="Access, inventory and administrative changes" flush>
          <ul className="ws-list">
            {d.audit.map((e) => (
              <li key={e.id} className="ws-list-item">
                <span className="ws-avatar" aria-hidden="true" style={{ width: "2rem", height: "2rem", fontSize: "0.6875rem", background: e.actor === "System" ? "var(--slate-400)" : "var(--navy)" }}>
                  {e.actor.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                </span>
                <div className="ws-list-main">
                  <div className="ws-list-title" style={{ fontWeight: 500 }}><strong>{e.actor}</strong> · {e.action}</div>
                  <div className="ws-list-sub">{e.target}</div>
                </div>
                <div className="ws-list-end" style={{ color: "var(--color-muted)", fontSize: "0.75rem" }}>{e.time}</div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          id="setup"
          title="Grand Road setup"
          description={`PUR-01 · ${checklistDone} of ${d.setupChecklist.length} steps complete`}
          footer="Whether a branch can trade before setup is complete is still pending a product decision."
        >
          <div style={{ marginBottom: "0.75rem" }}>
            <Meter value={checklistDone} max={d.setupChecklist.length} label="Setup progress" />
          </div>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {d.setupChecklist.map((c) => (
              <li key={c.label} className={`ws-check${c.done ? " done" : ""}`}>
                {c.done
                  ? <CircleCheck size={16} aria-label="Done" style={{ color: "var(--color-success)", flexShrink: 0 }} />
                  : <Circle size={16} aria-label="To do" style={{ color: "var(--slate-300)", flexShrink: 0 }} />}
                {c.label}
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </DashboardShell>
  );
}
