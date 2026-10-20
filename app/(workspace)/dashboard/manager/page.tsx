import type { Metadata } from "next";
import { ClipboardCheck, IndianRupee, PackageX, ReceiptText, Timer, UserPlus } from "lucide-react";
import DashboardShell from "../../../components/dashboard/DashboardShell";
import { ColumnChart } from "../../../components/dashboard/charts";
import { ActiveStoreName, PlannedButton } from "../../../components/dashboard/client";
import { KpiCard, PageHeader, Panel, Pill, PreviewNotice, type PillTone } from "../../../components/dashboard/ui";
import { formatCount, formatINR, formatINRCompact } from "../../../lib/dashboard/format";
import { MANAGER_DATA, type ShiftStatus } from "../../../lib/dashboard/sample-data";

export const metadata: Metadata = { title: "Manager Dashboard" };

const SHIFT_STATUS: Record<ShiftStatus, { tone: PillTone; label: string }> = {
  open: { tone: "info", label: "Open" },
  "pending-review": { tone: "warning", label: "Awaiting review" },
  variance: { tone: "warning", label: "Variance" },
  approved: { tone: "success", label: "Approved" },
};

const TEAM_TONE: Record<string, PillTone> = {
  "On shift": "success",
  Active: "brand",
  "Off today": "neutral",
  "Invite pending": "info",
};

export default function ManagerDashboardPage() {
  const d = MANAGER_DATA;

  return (
    <DashboardShell role="manager" notifications={d.notifications}>
      <PreviewNotice />

      <PageHeader
        eyebrow="Store dashboard"
        title={<ActiveStoreName />}
        subtitle="Today’s operations for your assigned store · Tuesday, 20 October 2026"
        actions={
          <>
            <PlannedButton feature="Staff invitations" className="btn btn-outline btn-sm"><UserPlus size={14} aria-hidden="true" /> Invite staff</PlannedButton>
            <PlannedButton feature="Shift review" className="btn btn-primary btn-sm"><Timer size={14} aria-hidden="true" /> Review shifts</PlannedButton>
          </>
        }
      />

      <div className="ws-kpis">
        <KpiCard label="Sales today" value={formatINRCompact(d.kpis.sales)} icon={IndianRupee} delta={d.kpis.salesDeltaPct} foot="vs last Tuesday" />
        <KpiCard label="Bills" value={formatCount(d.kpis.bills)} icon={ReceiptText} tone="navy" foot={`Avg bill ${formatINR(d.kpis.avgBill, { decimals: false })}`} />
        <KpiCard label="Open shifts" value={d.kpis.openShifts} icon={Timer} tone="info" foot="2 counters running" />
        <KpiCard label="Pending approvals" value={d.kpis.pendingApprovals} icon={ClipboardCheck} tone="warning" foot="refunds, discounts, stock" />
        <KpiCard label="Stock alerts" value={d.kpis.lowStock + d.kpis.nearExpiry} icon={PackageX} tone="critical" foot={`${d.kpis.lowStock} low · ${d.kpis.nearExpiry} near expiry`} />
      </div>

      <div className="ws-row split-2-1">
        <Panel id="hourly" title="Sales by hour" description="Today, store hours 8:00 – now · current hour highlighted">
          <ColumnChart
            data={d.hourlySales.map((h) => ({ label: `${h.label}:00`, values: [h.value] }))}
            series={[{ name: "Sales", color: "primary" }]}
            label="Store sales by hour today"
            unit="inr"
            highlightLast
          />
        </Panel>

        <Panel
          id="approvals"
          title="Needs your approval"
          description="Requests above staff limits"
          flush
          action={<Pill tone="warning">{d.approvals.length}</Pill>}
        >
          <ul className="ws-list">
            {d.approvals.map((a) => (
              <li key={a.id} className="ws-list-item">
                <div className="ws-list-main">
                  <div className="ws-list-title">{a.type}</div>
                  <div className="ws-list-sub">{a.ref} · {a.by} · {a.age}</div>
                </div>
                <div className="ws-list-end">
                  <div className="strong" style={{ fontWeight: 600, color: "var(--navy)" }}>{formatINR(a.amount)}</div>
                  <PlannedButton feature="Approvals" className="btn btn-ghost btn-sm">Review</PlannedButton>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel
        id="shifts"
        title="Cashier shifts"
        description="Open shifts and recently closed shifts awaiting review. Approved shifts are locked."
        flush
      >
        <div className="ws-table-wrap">
          <table className="ws-table">
            <thead>
              <tr>
                <th scope="col">Cashier</th>
                <th scope="col">Register</th>
                <th scope="col">Opened</th>
                <th scope="col" className="num">Expected</th>
                <th scope="col" className="num">Counted</th>
                <th scope="col" className="num">Variance</th>
                <th scope="col">Status</th>
                <th scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {d.shifts.map((s) => {
                const variance = s.counted === null ? null : s.counted - s.expected;
                const st = SHIFT_STATUS[s.status];
                return (
                  <tr key={s.id}>
                    <td className="strong">{s.cashier}</td>
                    <td>{s.register}</td>
                    <td>{s.opened}</td>
                    <td className="num">{formatINR(s.expected)}</td>
                    <td className="num">{s.counted === null ? "—" : formatINR(s.counted)}</td>
                    <td className="num" style={{ color: variance ? "#b91c1c" : undefined, fontWeight: variance ? 600 : undefined }}>
                      {variance === null ? "—" : formatINR(variance)}
                    </td>
                    <td><Pill tone={st.tone}>{st.label}</Pill></td>
                    <td className="num">
                      {s.status === "variance" && <PlannedButton feature="Shift review" className="btn btn-outline btn-sm">Review</PlannedButton>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="ws-row split-1-1">
        <Panel id="stock" title="Stock alerts" description="Low stock, near-expiry and blocked batches in this store" flush>
          <ul className="ws-list">
            {d.stockAlerts.map((a) => (
              <li key={a.batch} className="ws-list-item">
                <div className="ws-list-main">
                  <div className="ws-list-title">{a.product}</div>
                  <div className="ws-list-sub">Batch <span className="ws-mono">{a.batch}</span> · {a.detail}</div>
                </div>
                <Pill tone={a.severity}>{a.issue}</Pill>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel id="team" title="Store team" description="Memberships for this store only" flush>
          <ul className="ws-list">
            {d.team.map((m) => (
              <li key={m.name} className="ws-list-item">
                <span className="ws-avatar" aria-hidden="true" style={{ width: "2rem", height: "2rem", fontSize: "0.6875rem" }}>
                  {m.name.replace("Dr. ", "").split(" ").map((p) => p[0]).join("").slice(0, 2)}
                </span>
                <div className="ws-list-main">
                  <div className="ws-list-title">{m.name}</div>
                  <div className="ws-list-sub">{m.role}</div>
                </div>
                <Pill tone={TEAM_TONE[m.status] ?? "neutral"}>{m.status}</Pill>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </DashboardShell>
  );
}
