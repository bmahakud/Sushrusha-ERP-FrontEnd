import type { Metadata } from "next";
import {
  Ban, CalendarClock, ClipboardList, FileClock, Package, PackageCheck, PackageX, Plus, TriangleAlert,
} from "lucide-react";
import DashboardShell from "../../../components/dashboard/DashboardShell";
import { ActiveStoreName, PlannedButton } from "../../../components/dashboard/client";
import { KpiCard, Meter, PageHeader, Panel, Pill, PreviewNotice, type PillTone } from "../../../components/dashboard/ui";
import { formatCount, formatINR } from "../../../lib/dashboard/format";
import { INVENTORY_DATA, type GrnStatus } from "../../../lib/dashboard/sample-data";

export const metadata: Metadata = { title: "Inventory Dashboard" };

const GRN_STATUS: Record<GrnStatus, { tone: PillTone; label: string }> = {
  draft: { tone: "neutral", label: "Draft" },
  "pending-confirmation": { tone: "warning", label: "Awaiting confirmation" },
  confirmed: { tone: "success", label: "Confirmed" },
};

export default function InventoryDashboardPage() {
  const d = INVENTORY_DATA;
  const expiryMax = Math.max(...d.expiryBuckets.map((b) => b.value));
  const poTotal = d.poPipeline.reduce((n, p) => n + p.count, 0);

  return (
    <DashboardShell role="inventory" notifications={d.notifications}>
      <PreviewNotice />

      <PageHeader
        eyebrow="Inventory & purchasing"
        title="Stock overview"
        subtitle={<><ActiveStoreName withCode /> · batch-level stock, FEFO order</>}
        actions={
          <>
            <PlannedButton feature="Goods receipt" className="btn btn-outline btn-sm"><PackageCheck size={14} aria-hidden="true" /> Receive goods</PlannedButton>
            <PlannedButton feature="Purchase orders" className="btn btn-primary btn-sm"><Plus size={14} aria-hidden="true" /> New purchase order</PlannedButton>
          </>
        }
      />

      <div className="ws-kpis">
        <KpiCard label="Active products" value={formatCount(d.kpis.skus)} icon={Package} tone="navy" />
        <KpiCard label="Below reorder level" value={d.kpis.lowStock} icon={PackageX} tone="warning" />
        <KpiCard label="Expiring in 90 days" value={d.kpis.nearExpiry90} icon={CalendarClock} tone="warning" foot="batches" />
        <KpiCard label="Blocked batches" value={d.kpis.blocked} icon={Ban} tone="critical" foot="expired, recalled, quarantined" />
        <KpiCard label="Open purchase orders" value={d.kpis.openPOs} icon={ClipboardList} tone="info" />
        <KpiCard label="Draft GRNs" value={d.kpis.draftGRNs} icon={FileClock} foot="no stock added until confirmed" />
      </div>

      <div className="ws-row split-2-1">
        <Panel id="low-stock" title="Below reorder level" description="On-hand quantity against the store reorder point" flush>
          <div className="ws-table-wrap">
            <table className="ws-table">
              <thead>
                <tr>
                  <th scope="col">Product</th>
                  <th scope="col" style={{ minWidth: "10rem" }}>On hand / reorder</th>
                  <th scope="col">Preferred supplier</th>
                  <th scope="col"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {d.lowStock.map((p) => (
                  <tr key={p.product}>
                    <td className="strong">{p.product}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div style={{ flex: 1 }}>
                          <Meter value={p.onHand} max={p.reorder} tone={p.onHand / p.reorder < 0.5 ? "critical" : "warning"} label={`${p.product} stock level`} />
                        </div>
                        <span style={{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", fontSize: "0.75rem" }}>
                          {p.onHand}/{p.reorder} {p.unit}
                        </span>
                      </div>
                    </td>
                    <td>{p.supplier}</td>
                    <td className="num"><PlannedButton feature="Purchase orders" className="btn btn-ghost btn-sm">Add to PO</PlannedButton></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel id="expiry" title="Expiry outlook" description="Batches by time to expiry" footer="Expired batches are blocked from sale automatically.">
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {d.expiryBuckets.map((b) => (
              <li key={b.label}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8125rem", marginBottom: "0.375rem" }}>
                  <span style={{ color: "var(--slate-700)", fontWeight: 500 }}>{b.label}</span>
                  <Pill tone={b.tone}>{b.value} batches</Pill>
                </div>
                <Meter value={b.value} max={expiryMax} tone={b.tone === "info" ? undefined : b.tone} label={`${b.label}: ${b.value} batches`} />
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="ws-row split-1-1">
        <Panel id="po" title="Purchase orders" description={`${poTotal} orders in progress`}>
          <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(7rem, 1fr))", gap: "0.625rem" }}>
            {d.poPipeline.map((p, i) => (
              <li key={p.status} style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "0.75rem", background: p.status === "submitted" ? "var(--color-warning-bg)" : "var(--slate-50)" }}>
                <div style={{ fontSize: "0.6875rem", fontWeight: 600, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Step {i + 1}</div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--navy)", lineHeight: 1.2 }}>{p.count}</div>
                <div style={{ fontSize: "0.8125rem", color: "var(--slate-700)" }}>{p.label}</div>
              </li>
            ))}
          </ol>
          <p style={{ fontSize: "0.75rem", color: "var(--color-muted)", margin: "0.875rem 0 0", display: "flex", gap: "0.375rem", alignItems: "center" }}>
            <TriangleAlert size={13} aria-hidden="true" style={{ color: "#b45309" }} /> 1 order is waiting for manager approval.
          </p>
        </Panel>

        <Panel id="near-expiry" title="Expiring soonest" description="Sell first (FEFO) or plan a supplier return" flush>
          <ul className="ws-list">
            {d.nearExpiry.map((b) => (
              <li key={b.batch} className="ws-list-item">
                <div className="ws-list-main">
                  <div className="ws-list-title">{b.product}</div>
                  <div className="ws-list-sub">Batch <span className="ws-mono">{b.batch}</span> · {b.qty} · expires {b.expires}</div>
                </div>
                <Pill tone={b.days <= 30 ? "warning" : "info"}>{b.days} days</Pill>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel
        id="grn"
        title="Goods receipts"
        description="Draft and unconfirmed receipts do not change sellable stock. Confirmation creates batches and stock ledger entries."
        flush
      >
        <div className="ws-table-wrap">
          <table className="ws-table">
            <thead>
              <tr>
                <th scope="col">GRN</th>
                <th scope="col">Supplier</th>
                <th scope="col" className="num">Lines</th>
                <th scope="col" className="num">Value</th>
                <th scope="col">Checks</th>
                <th scope="col">Status</th>
                <th scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {d.grns.map((g) => {
                const st = GRN_STATUS[g.status];
                return (
                  <tr key={g.id}>
                    <td><span className="ws-mono">{g.id}</span></td>
                    <td><span className="strong">{g.supplier}</span><span className="sub">Invoice {g.invoice}</span></td>
                    <td className="num">{g.lines}</td>
                    <td className="num strong">{formatINR(g.value)}</td>
                    <td>{g.issues > 0 ? <Pill tone="warning">{g.issues} flag</Pill> : <Pill tone="success">Passed</Pill>}</td>
                    <td><Pill tone={st.tone}>{st.label}</Pill></td>
                    <td className="num">
                      {g.status !== "confirmed" && (
                        <PlannedButton feature="Goods receipt" className="btn btn-outline btn-sm">
                          {g.status === "draft" ? "Continue" : "Review & confirm"}
                        </PlannedButton>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </DashboardShell>
  );
}
