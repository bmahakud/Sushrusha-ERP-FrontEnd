"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { OWNER_DATA, SAMPLE_STORES, type Period, type StoreStatus } from "../../../lib/dashboard/sample-data";
import { formatCount, formatINR } from "../../../lib/dashboard/format";
import { Delta, Pill, type PillTone } from "../../../components/dashboard/ui";
import { PlannedButton } from "../../../components/dashboard/client";

const PERIODS: { key: Period; label: string; compare: string }[] = [
  { key: "today", label: "Today", compare: "vs same day last week" },
  { key: "7d", label: "7 days", compare: "vs previous 7 days" },
  { key: "30d", label: "30 days", compare: "vs previous 30 days" },
];

const STATUS: Record<StoreStatus, { tone: PillTone; label: string }> = {
  active: { tone: "success", label: "Active" },
  "setup-pending": { tone: "warning", label: "Setup pending" },
  inactive: { tone: "neutral", label: "Inactive" },
};

/** Branch-wise performance for a selected period (spec §6.1). */
export default function BranchPerformance() {
  const [period, setPeriod] = useState<Period>("today");
  const rows = OWNER_DATA.branchPerformance[period];
  const maxSales = Math.max(...rows.map((r) => r.sales), 1);
  const current = PERIODS.find((p) => p.key === period)!;

  return (
    <section className="ws-panel" aria-labelledby="branch-perf-title">
      <div className="ws-panel-head" style={{ flexWrap: "wrap" }}>
        <div>
          <h2 className="ws-panel-title" id="branch-perf-title">Branch performance</h2>
          <p className="ws-panel-desc">Sales and stock health by branch · change {current.compare}</p>
        </div>
        <div className="ws-seg" role="group" aria-label="Period">
          {PERIODS.map((p) => (
            <button key={p.key} type="button" aria-pressed={period === p.key} onClick={() => setPeriod(p.key)}>
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="ws-table-wrap">
        <table className="ws-table">
          <thead>
            <tr>
              <th scope="col">Branch</th>
              <th scope="col">Manager</th>
              <th scope="col">Status</th>
              <th scope="col" style={{ minWidth: "9rem" }}>Sales</th>
              <th scope="col" className="num">Bills</th>
              <th scope="col" className="num">Change</th>
              <th scope="col" className="num">Low stock</th>
              <th scope="col" className="num">Near expiry</th>
              <th scope="col"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const store = SAMPLE_STORES.find((s) => s.id === r.storeId)!;
              const status = STATUS[store.status];
              const live = store.status === "active";
              return (
                <tr key={r.storeId}>
                  <td>
                    <span className="strong">{store.name}</span>
                    <span className="sub" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <MapPin size={11} aria-hidden="true" /> {store.city} · <span className="ws-mono">{store.code}</span>
                    </span>
                  </td>
                  <td>{store.manager ?? <span style={{ color: "var(--color-subtle)" }}>Not assigned</span>}</td>
                  <td><Pill tone={status.tone}>{status.label}</Pill></td>
                  <td>
                    {live ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                        <div className="ws-meter" style={{ flex: 1, minWidth: "3rem" }} aria-hidden="true">
                          <span style={{ width: `${(r.sales / maxSales) * 100}%` }} />
                        </div>
                        <span className="strong" style={{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                          {formatINR(r.sales, { decimals: false })}
                        </span>
                      </div>
                    ) : (
                      <span style={{ color: "var(--color-subtle)" }}>Not trading yet</span>
                    )}
                  </td>
                  <td className="num">{live ? formatCount(r.bills) : "—"}</td>
                  <td className="num">{live ? <Delta pct={r.deltaPct} /> : "—"}</td>
                  <td className="num">{live ? r.lowStock : "—"}</td>
                  <td className="num">{live ? r.nearExpiry : "—"}</td>
                  <td className="num">
                    <PlannedButton feature="Branch workspace" className="btn btn-ghost btn-sm">
                      {live ? "Open" : "Finish setup"}
                    </PlannedButton>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
