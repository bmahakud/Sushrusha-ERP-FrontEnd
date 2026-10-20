import Link from "next/link";
import {
  ArrowDownRight, ArrowUpRight, CircleAlert, CircleCheck, Info, Minus, TriangleAlert, Eye,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { formatDelta } from "../../lib/dashboard/format";

// ─── Page scaffolding ───────────────────────────────────────────────────────

export function PreviewNotice() {
  return (
    <div className="ws-preview" role="note">
      <Eye size={16} aria-hidden="true" />
      <span>
        <strong>Preview data.</strong> Figures on this screen are fictional samples for layout review — the
        workspace is not connected to the Sushrusa backend yet.
      </span>
      <Link href="/dashboard">Switch role</Link>
    </div>
  );
}

export function PageHeader({
  eyebrow, title, subtitle, actions,
}: { eyebrow?: ReactNode; title: ReactNode; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="ws-page-head">
      <div>
        {eyebrow && <div className="ws-eyebrow">{eyebrow}</div>}
        <h1 className="ws-title">{title}</h1>
        {subtitle && <p className="ws-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="ws-actions">{actions}</div>}
    </header>
  );
}

export function Panel({
  title, description, action, footer, flush, children, id,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  footer?: ReactNode;
  flush?: boolean;
  children: ReactNode;
  id?: string;
}) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section className="ws-panel" aria-labelledby={headingId}>
      <div className="ws-panel-head">
        <div>
          <h2 className="ws-panel-title" id={headingId}>{title}</h2>
          {description && <p className="ws-panel-desc">{description}</p>}
        </div>
        {action}
      </div>
      <div className={`ws-panel-body${flush ? " flush" : ""}`}>{children}</div>
      {footer && <div className="ws-panel-foot">{footer}</div>}
    </section>
  );
}

// ─── Figures ────────────────────────────────────────────────────────────────

export type Tone = "brand" | "warning" | "critical" | "info" | "navy";

export function KpiCard({
  label, value, icon: Icon, tone = "brand", delta, deltaGoodWhenUp = true, foot,
}: {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  tone?: Tone;
  delta?: number;
  deltaGoodWhenUp?: boolean;
  foot?: ReactNode;
}) {
  return (
    <div className="ws-kpi">
      <div className="ws-kpi-top">
        <span className="ws-kpi-label">{label}</span>
        <span className={`ws-kpi-icon tone-${tone}`} aria-hidden="true"><Icon size={16} /></span>
      </div>
      <div className="ws-kpi-value">{value}</div>
      {(delta !== undefined || foot) && (
        <div className="ws-kpi-foot">
          {delta !== undefined && <Delta pct={delta} goodWhenUp={deltaGoodWhenUp} />}
          {foot}
        </div>
      )}
    </div>
  );
}

export function Delta({ pct, goodWhenUp = true }: { pct: number; goodWhenUp?: boolean }) {
  const dir = pct > 0 ? "up" : pct < 0 ? "down" : "flat";
  const good = dir === "flat" ? "flat" : (dir === "up") === goodWhenUp ? "up" : "down";
  const Icon = dir === "up" ? ArrowUpRight : dir === "down" ? ArrowDownRight : Minus;
  return (
    <span className={`ws-delta ${good}`}>
      <Icon size={12} aria-hidden="true" />
      {formatDelta(pct)}
    </span>
  );
}

export function Meter({ value, max, tone, label }: { value: number; max: number; tone?: "warning" | "critical"; label: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className={`ws-meter${tone ? ` ${tone}` : ""}`} role="meter" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-label={label}>
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}

// ─── Status ─────────────────────────────────────────────────────────────────

export type PillTone = "success" | "warning" | "critical" | "info" | "neutral" | "brand";

const PILL_ICON: Record<PillTone, LucideIcon | null> = {
  success: CircleCheck,
  warning: TriangleAlert,
  critical: CircleAlert,
  info: Info,
  neutral: null,
  brand: null,
};

/** Status chip: always icon + text so meaning never rests on colour. */
export function Pill({ tone, children }: { tone: PillTone; children: ReactNode }) {
  const Icon = PILL_ICON[tone];
  return (
    <span className={`ws-pill ${tone}`}>
      {Icon && <Icon size={12} aria-hidden="true" />}
      {children}
    </span>
  );
}

export function EmptyState({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <div className="ws-empty">
      <Icon size={28} aria-hidden="true" />
      {children}
    </div>
  );
}
