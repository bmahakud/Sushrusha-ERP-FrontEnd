import type { Metadata } from "next";
import { Calculator, Download, IndianRupee, PiggyBank, Scale, Wallet } from "lucide-react";
import DashboardShell from "../../../components/dashboard/DashboardShell";
import { ColumnChart } from "../../../components/dashboard/charts";
import { ActiveStoreName, PlannedButton } from "../../../components/dashboard/client";
import { KpiCard, Meter, PageHeader, Panel, Pill, PreviewNotice } from "../../../components/dashboard/ui";
import { formatINR, formatINRCompact } from "../../../lib/dashboard/format";
import { ACCOUNTANT_DATA } from "../../../lib/dashboard/sample-data";

export const metadata: Metadata = { title: "Accounts Dashboard" };

export default function AccountantDashboardPage() {
  const d = ACCOUNTANT_DATA;
  const agingMax = Math.max(...d.payablesAging.map((a) => a.value));
  const taxTotals = d.taxByRate.reduce(
    (t, r) => ({ taxable: t.taxable + r.taxable, tax: t.tax + r.tax }),
    { taxable: 0, tax: 0 },
  );

  return (
    <DashboardShell role="accountant" notifications={d.notifications}>
      <PreviewNotice />

      <PageHeader
        eyebrow="Finance"
        title="Accounts overview"
        subtitle={<>October 2026 · month to date · <ActiveStoreName withCode /></>}
        actions={
          <>
            <PlannedButton feature="Tax reports" className="btn btn-outline btn-sm"><Download size={14} aria-hidden="true" /> Tax summary</PlannedButton>
            <PlannedButton feature="Supplier payments" className="btn btn-primary btn-sm"><Wallet size={14} aria-hidden="true" /> Record payment</PlannedButton>
          </>
        }
      />

      <div className="ws-kpis">
        <KpiCard label="Revenue, month to date" value={formatINRCompact(d.kpis.revenueMtd)} icon={IndianRupee} delta={d.kpis.revenueDeltaPct} foot="vs Sep, same days" />
        <KpiCard label="Output tax collected" value={formatINRCompact(d.kpis.outputTaxMtd)} icon={Calculator} tone="navy" foot="month to date" />
        <KpiCard label="Supplier payables" value={formatINRCompact(d.kpis.payables)} icon={Wallet} tone="warning" foot="outstanding" />
        <KpiCard label="Customer receivables" value={formatINRCompact(d.kpis.receivables)} icon={PiggyBank} tone="info" foot="credit accounts" />
        <KpiCard label="Unreconciled shifts" value={d.kpis.unreconciledShifts} icon={Scale} tone="critical" foot="variance not closed" />
      </div>

      <div className="ws-row split-2-1">
        <Panel id="sales-purchases" title="Sales and purchases" description="Monthly totals, last 6 months · October is month to date">
          <ColumnChart
            data={d.monthly.map((m) => ({ label: m.label, values: [m.sales, m.purchases] }))}
            series={[{ name: "Sales", color: "primary" }, { name: "Purchases", color: "secondary" }]}
            label="Monthly sales and purchases, last 6 months"
            unit="inr"
          />
        </Panel>

        <Panel id="aging" title="Payables aging" description="Supplier invoices by days overdue" footer={`Total outstanding ${formatINR(d.kpis.payables, { decimals: false })}`}>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {d.payablesAging.map((a, i) => {
              const tone = i === 3 ? "critical" : i === 2 ? "warning" : undefined;
              return (
                <li key={a.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", marginBottom: "0.375rem" }}>
                    <span style={{ color: "var(--slate-700)", fontWeight: 500 }}>{a.label}</span>
                    <span style={{ fontWeight: 600, color: "var(--navy)", fontVariantNumeric: "tabular-nums" }}>{formatINR(a.value, { decimals: false })}</span>
                  </div>
                  <Meter value={a.value} max={agingMax} tone={tone} label={`${a.label} payables`} />
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      <div className="ws-row split-1-1">
        <Panel
          id="tax"
          title="Output tax by rate"
          description="Month to date"
          flush
          footer="Indicative only — GST invoice and filing rules are pending compliance review."
        >
          <div className="ws-table-wrap">
            <table className="ws-table">
              <thead>
                <tr>
                  <th scope="col">Rate</th>
                  <th scope="col" className="num">Taxable value</th>
                  <th scope="col" className="num">Tax</th>
                </tr>
              </thead>
              <tbody>
                {d.taxByRate.map((r) => (
                  <tr key={r.rate}>
                    <td className="strong">{r.rate}</td>
                    <td className="num">{formatINR(r.taxable)}</td>
                    <td className="num">{formatINR(r.tax)}</td>
                  </tr>
                ))}
                <tr>
                  <td className="strong">Total</td>
                  <td className="num strong">{formatINR(taxTotals.taxable)}</td>
                  <td className="num strong">{formatINR(taxTotals.tax)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel id="settlement" title="Payment settlement" description="Collections by method, month to date" flush>
          <ul className="ws-list">
            {d.settlement.map((s) => (
              <li key={s.method} className="ws-list-item">
                <div className="ws-list-main">
                  <div className="ws-list-title">{s.method}</div>
                  <div className="ws-list-sub">{formatINR(s.amount)}</div>
                </div>
                <Pill tone={s.status.includes("pending") ? "warning" : "success"}>{s.status}</Pill>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel id="recon" title="Shift reconciliation" description="Closed shifts with a cash variance that hasn't been resolved" flush>
        <div className="ws-table-wrap">
          <table className="ws-table">
            <thead>
              <tr>
                <th scope="col">Shift</th>
                <th scope="col">Cashier</th>
                <th scope="col" className="num">Variance</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {d.reconciliation.map((r) => (
                <tr key={r.shift}>
                  <td><span className="ws-mono">{r.shift}</span></td>
                  <td>{r.cashier}</td>
                  <td className="num strong" style={{ color: r.variance < 0 ? "#b91c1c" : "#047857" }}>
                    {r.variance > 0 ? "+" : ""}{formatINR(r.variance)}
                  </td>
                  <td><Pill tone={r.status === "Reason pending" ? "warning" : "info"}>{r.status}</Pill></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </DashboardShell>
  );
}
