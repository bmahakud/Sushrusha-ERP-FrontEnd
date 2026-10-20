import type { Metadata } from "next";
import { BadgeCheck, BookLock, ClipboardCheck, ClipboardX, Hourglass, ShieldAlert } from "lucide-react";
import DashboardShell from "../../../components/dashboard/DashboardShell";
import { ColumnChart } from "../../../components/dashboard/charts";
import { ActiveStoreName, PlannedButton } from "../../../components/dashboard/client";
import { KpiCard, PageHeader, Panel, Pill, PreviewNotice, type PillTone } from "../../../components/dashboard/ui";
import { PHARMACIST_DATA, SAMPLE_USERS, type RxStatus } from "../../../lib/dashboard/sample-data";

export const metadata: Metadata = { title: "Pharmacist Dashboard" };

const RX_STATUS: Record<RxStatus, { tone: PillTone; label: string }> = {
  pending: { tone: "warning", label: "Waiting" },
  "in-review": { tone: "info", label: "In review" },
  partial: { tone: "warning", label: "Partial" },
  verified: { tone: "success", label: "Verified" },
  rejected: { tone: "critical", label: "Rejected" },
};

export default function PharmacistDashboardPage() {
  const d = PHARMACIST_DATA;
  const user = SAMPLE_USERS.pharmacist;

  return (
    <DashboardShell role="pharmacist" notifications={d.notifications}>
      <PreviewNotice />

      <PageHeader
        eyebrow="Dispensing desk"
        title="Prescription review"
        subtitle={<>{user.name} · <ActiveStoreName withCode /></>}
        actions={
          <>
            <PlannedButton feature="Scheduled drug register" className="btn btn-outline btn-sm"><BookLock size={14} aria-hidden="true" /> Drug register</PlannedButton>
            <PlannedButton feature="Prescription review" className="btn btn-primary btn-sm"><ClipboardCheck size={14} aria-hidden="true" /> Review next</PlannedButton>
          </>
        }
      />

      <div className="ws-kpis">
        <KpiCard label="Waiting for review" value={d.kpis.pending} icon={Hourglass} tone="warning" foot="oldest waiting 28 min" />
        <KpiCard label="Verified today" value={d.kpis.verifiedToday} icon={ClipboardCheck} />
        <KpiCard label="Partial or rejected" value={d.kpis.partialOrRejected} icon={ClipboardX} tone="critical" foot="today" />
        <KpiCard label="Scheduled drugs dispensed" value={d.kpis.scheduledDispensed} icon={BookLock} tone="navy" foot="logged to register" />
      </div>

      <Panel
        id="queue"
        title="Prescription queue"
        description="Bills with prescription-required or scheduled items can't be completed until a pharmacist signs off."
        flush
        action={<Pill tone="warning">{d.queue.length} in queue</Pill>}
      >
        <div className="ws-table-wrap">
          <table className="ws-table">
            <thead>
              <tr>
                <th scope="col">Prescription</th>
                <th scope="col">Patient</th>
                <th scope="col">Doctor</th>
                <th scope="col" className="num">Items</th>
                <th scope="col">Type</th>
                <th scope="col">Waiting</th>
                <th scope="col">Status</th>
                <th scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {d.queue.map((rx) => {
                const st = RX_STATUS[rx.status];
                return (
                  <tr key={rx.id}>
                    <td><span className="ws-mono">{rx.id}</span><span className="sub">{rx.source}</span></td>
                    <td><span className="strong">{rx.patient}</span><span className="sub">{rx.age} yrs</span></td>
                    <td>{rx.doctor}</td>
                    <td className="num">{rx.items}</td>
                    <td>{rx.scheduled ? <Pill tone="critical">Scheduled</Pill> : <Pill tone="neutral">Rx only</Pill>}</td>
                    <td>{rx.waiting}</td>
                    <td><Pill tone={st.tone}>{st.label}</Pill></td>
                    <td className="num"><PlannedButton feature="Prescription review" className="btn btn-outline btn-sm">Review</PlannedButton></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="ws-row split-2-1">
        <Panel id="volume" title="Prescriptions verified" description="Last 7 days · today highlighted">
          <ColumnChart
            data={d.weekly.map((w) => ({ label: w.label, values: [w.value] }))}
            series={[{ name: "Verified", color: "primary" }]}
            label="Prescriptions verified per day, last 7 days"
            unit="count"
            height={200}
            highlightLast
          />
        </Panel>

        <div className="ws-stack">
          <Panel id="registration" title="Professional registration">
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span className="ws-kpi-icon" aria-hidden="true" style={{ width: "2.5rem", height: "2.5rem" }}><BadgeCheck size={18} /></span>
              <div style={{ minWidth: 0 }}>
                <div className="ws-mono" style={{ color: "var(--navy)", fontWeight: 600 }}>{d.registration.number}</div>
                <div className="ws-list-sub">Valid until {d.registration.validUntil}</div>
              </div>
              <span style={{ marginLeft: "auto" }}><Pill tone="success">Valid</Pill></span>
            </div>
          </Panel>

          <Panel id="blocked" title="Blocked from dispensing" description="Expired, recalled or quarantined batches" flush>
            <ul className="ws-list">
              {d.blockedStock.map((b) => (
                <li key={b.batch} className="ws-list-item">
                  <ShieldAlert size={16} aria-hidden="true" style={{ color: "var(--color-error)", flexShrink: 0 }} />
                  <div className="ws-list-main">
                    <div className="ws-list-title">{b.product}</div>
                    <div className="ws-list-sub">Batch <span className="ws-mono">{b.batch}</span></div>
                  </div>
                  <Pill tone={b.reason === "Quarantined" ? "warning" : "critical"}>{b.reason}</Pill>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <Panel
        id="register"
        title="Scheduled drug register · today"
        description="Entries are generated automatically at dispensing and can't be edited."
        flush
      >
        <div className="ws-table-wrap">
          <table className="ws-table">
            <thead>
              <tr>
                <th scope="col">Time</th>
                <th scope="col">Drug</th>
                <th scope="col">Schedule</th>
                <th scope="col">Patient</th>
                <th scope="col">Prescriber</th>
                <th scope="col">Batch</th>
                <th scope="col" className="num">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {d.register.map((r) => (
                <tr key={`${r.time}-${r.batch}`}>
                  <td>{r.time}</td>
                  <td className="strong">{r.drug}</td>
                  <td><Pill tone="critical">{r.schedule}</Pill></td>
                  <td>{r.patient}</td>
                  <td>{r.doctor}</td>
                  <td><span className="ws-mono">{r.batch}</span></td>
                  <td className="num">{r.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </DashboardShell>
  );
}
