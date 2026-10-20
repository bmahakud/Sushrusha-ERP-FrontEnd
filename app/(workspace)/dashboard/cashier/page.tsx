import type { Metadata } from "next";
import {
  Banknote, CirclePause, CreditCard, Keyboard, Lock, Package, ReceiptText, Search, ShoppingCart,
  Smartphone, Timer, Undo2,
} from "lucide-react";
import DashboardShell from "../../../components/dashboard/DashboardShell";
import { ColumnChart } from "../../../components/dashboard/charts";
import { ActiveStoreName, PlannedButton } from "../../../components/dashboard/client";
import { EmptyState, KpiCard, PageHeader, Panel, Pill, PreviewNotice } from "../../../components/dashboard/ui";
import { formatCount, formatINR } from "../../../lib/dashboard/format";
import { CASHIER_DATA, SAMPLE_USERS, type PaymentMethod } from "../../../lib/dashboard/sample-data";

export const metadata: Metadata = { title: "Cashier Dashboard" };

const METHOD_ICON: Record<PaymentMethod, typeof Banknote> = { Cash: Banknote, UPI: Smartphone, Card: CreditCard };

const SHORTCUTS = [
  { keys: "F2", action: "New bill" },
  { keys: "F4", action: "Hold current bill" },
  { keys: "F6", action: "Resume held bill" },
  { keys: "F9", action: "Take payment" },
  { keys: "Esc", action: "Cancel unpaid bill" },
];

export default function CashierDashboardPage() {
  const d = CASHIER_DATA;
  const user = SAMPLE_USERS.cashier;
  const cashSales = d.shift.byMethod.find((m) => m.method === "Cash")?.amount ?? 0;
  const expectedDrawer = d.shift.openingFloat + cashSales;

  return (
    <DashboardShell role="cashier" notifications={d.notifications}>
      <PreviewNotice />

      <PageHeader
        eyebrow="Billing counter"
        title={`Hi ${user.name.split(" ")[0]}, your shift is open`}
        subtitle={<><ActiveStoreName withCode /> · {d.shift.register}</>}
        actions={
          <>
            <PlannedButton feature="Return requests" className="btn btn-outline btn-sm"><Undo2 size={14} aria-hidden="true" /> Return request</PlannedButton>
            <PlannedButton feature="Point of Sale" className="btn btn-primary btn-sm"><ShoppingCart size={14} aria-hidden="true" /> New bill <span className="ws-kbd" style={{ background: "transparent", color: "inherit", borderColor: "rgb(255 255 255 / .4)" }}>F2</span></PlannedButton>
          </>
        }
      />

      {/* Shift hero */}
      <section className="ws-hero" aria-label="Current shift">
        <div>
          <div className="ws-hero-label">Shift {d.shift.id} · sales this shift</div>
          <div className="ws-hero-value">{formatINR(d.shift.salesTotal, { decimals: false })}</div>
          <div className="ws-hero-meta">
            <span><Timer size={13} aria-hidden="true" /> Open since {d.shift.openedAt} ({d.shift.duration})</span>
            <span>{d.shift.bills} bills</span>
            <span>Opening float {formatINR(d.shift.openingFloat, { decimals: false })}</span>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
            <PlannedButton feature="Point of Sale" className="btn btn-light btn-sm"><ShoppingCart size={14} aria-hidden="true" /> Start billing</PlannedButton>
            <PlannedButton feature="Shift close" className="btn btn-ghost-light btn-sm"><Lock size={14} aria-hidden="true" /> Close shift</PlannedButton>
          </div>
        </div>
        <div className="ws-hero-split">
          <div className="ws-hero-label">By payment method</div>
          {d.shift.byMethod.map((m) => {
            const Icon = METHOD_ICON[m.method];
            return (
              <div key={m.method} className="ws-hero-row">
                <Icon size={15} aria-hidden="true" />
                <span className="name">{m.method}</span>
                <span className="bar" aria-hidden="true"><span style={{ width: `${(m.amount / d.shift.salesTotal) * 100}%` }} /></span>
                <span className="amt">{formatINR(m.amount, { decimals: false })}</span>
              </div>
            );
          })}
          <div className="ws-hero-row" style={{ borderTop: "1px solid rgb(255 255 255 / .15)", paddingTop: "0.625rem", marginTop: "0.125rem" }}>
            <Banknote size={15} aria-hidden="true" />
            <span style={{ flex: 1, color: "rgb(255 255 255 / .8)" }}>Expected cash in drawer</span>
            <span className="amt">{formatINR(expectedDrawer, { decimals: false })}</span>
          </div>
        </div>
      </section>

      {/* Quick search */}
      <PlannedButton feature="Medicine search" className="ws-quick">
        <Search size={18} aria-hidden="true" />
        <span style={{ flex: 1, textAlign: "left" }}>Search medicine by brand, salt or scan a barcode…</span>
        <span className="ws-kbd">/</span>
      </PlannedButton>

      <div className="ws-kpis">
        <KpiCard label="Average bill" value={formatINR(d.kpis.avgBill, { decimals: false })} icon={ReceiptText} />
        <KpiCard label="Items sold" value={formatCount(d.kpis.itemsSold)} icon={Package} tone="navy" />
        <KpiCard label="Held bills" value={d.kpis.heldBills} icon={CirclePause} tone="warning" foot="resume or cancel before close" />
        <KpiCard label="Return requests" value={d.kpis.returnsRequested} icon={Undo2} tone="info" foot="awaiting manager" />
      </div>

      <div className="ws-row split-3-2">
        <Panel id="recent" title="My recent sales" description="Only bills you created this shift" flush>
          <div className="ws-table-wrap">
            <table className="ws-table">
              <thead>
                <tr>
                  <th scope="col">Bill</th>
                  <th scope="col">Customer</th>
                  <th scope="col" className="num">Items</th>
                  <th scope="col">Payment</th>
                  <th scope="col" className="num">Amount</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {d.recentSales.map((s) => (
                  <tr key={s.bill}>
                    <td><span className="ws-mono">{s.bill}</span><span className="sub">{s.time}</span></td>
                    <td>{s.customer}</td>
                    <td className="num">{s.items}</td>
                    <td>{s.method}</td>
                    <td className="num strong">{formatINR(s.amount)}</td>
                    <td>{s.status === "paid" ? <Pill tone="success">Paid</Pill> : <Pill tone="info">Return requested</Pill>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel id="held" title="Held bills" description="Stock is re-checked when a bill is resumed" flush>
          {d.heldBills.length === 0 ? (
            <EmptyState icon={CirclePause}>No bills on hold.</EmptyState>
          ) : (
            <ul className="ws-list">
              {d.heldBills.map((h) => (
                <li key={h.id} className="ws-list-item">
                  <span className="ws-kpi-icon tone-warning" aria-hidden="true"><CirclePause size={16} /></span>
                  <div className="ws-list-main">
                    <div className="ws-list-title">{h.id} · {h.customer}</div>
                    <div className="ws-list-sub">{h.items} items · held {h.heldAt} · {h.note}</div>
                  </div>
                  <div className="ws-list-end">
                    <div style={{ fontWeight: 600, color: "var(--navy)" }}>{formatINR(h.amount)}</div>
                    <PlannedButton feature="Resume bill" className="btn btn-ghost btn-sm">Resume</PlannedButton>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="ws-row split-2-1">
        <Panel id="hourly" title="My sales by hour" description="This shift · current hour highlighted">
          <ColumnChart
            data={d.hourly.map((h) => ({ label: `${h.label}:00`, values: [h.value] }))}
            series={[{ name: "My sales", color: "primary" }]}
            label="My sales by hour this shift"
            unit="inr"
            height={200}
            highlightLast
          />
        </Panel>

        <Panel
          id="shortcuts"
          title="Keyboard shortcuts"
          description="Planned for the POS screen"
          action={<Keyboard size={18} aria-hidden="true" style={{ color: "var(--color-subtle)" }} />}
          footer="Refunds, voids after payment and discounts above your limit need manager approval."
        >
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {SHORTCUTS.map((s) => (
              <li key={s.keys} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", color: "var(--slate-700)" }}>
                {s.action} <span className="ws-kbd">{s.keys}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </DashboardShell>
  );
}
