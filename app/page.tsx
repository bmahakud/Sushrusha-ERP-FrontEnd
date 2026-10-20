import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: "Sushrusha — Smarter Pharmacy Management",
  description:
    "All-in-one pharmacy management platform with POS, inventory tracking, multi-branch support, and an integrated online store. Trusted by 500+ pharmacies across India.",
};

// ─── Static data ─────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <path d="M8 21h8M12 17v4"/>
      </svg>
    ),
    title: "Smart POS System",
    description: "Lightning-fast billing with drug interaction checks, batch tracking, and GST-compliant invoices in seconds.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    title: "Multi-Branch Control",
    description: "Manage all your branches from a single dashboard. Transfer stock, set branch-level permissions, and track performance.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ),
    title: "Inventory Intelligence",
    description: "Auto-reorder alerts, expiry date tracking, FIFO management, and supplier integrations keep stock at optimal levels.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    title: "Online Store",
    description: "Launch your branded online pharmacy in minutes. Manage orders, home delivery, and digital prescriptions from one place.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: "Staff & Role Management",
    description: "Fine-grained permission system. Assign roles per branch, track activity logs, and protect sensitive operations.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    title: "Analytics & Reports",
    description: "Daily sales summaries, profit margins, slow-moving stock, and GST filings — all exportable to PDF or Excel.",
  },
];

const STATS = [
  { value: "500+", label: "Pharmacies Onboarded" },
  { value: "₹12Cr+", label: "Transactions Processed" },
  { value: "99.97%", label: "Uptime Guarantee" },
  { value: "< 2min", label: "Avg. Support Response" },
];

const PRICING = [
  {
    name: "Starter",
    price: "₹999",
    period: "/month",
    description: "Perfect for single-branch independent pharmacies.",
    features: [
      "1 branch, up to 3 users",
      "POS & billing",
      "Inventory management",
      "Basic reports",
      "Email support",
      "5 GB storage",
    ],
    cta: "Start Free Trial",
    featured: false,
  },
  {
    name: "Professional",
    price: "₹2,499",
    period: "/month",
    description: "Built for growing pharmacy chains with multiple branches.",
    features: [
      "Up to 5 branches, unlimited users",
      "Everything in Starter",
      "Online store",
      "Staff permissions & audit logs",
      "Advanced analytics",
      "Priority support (< 4h SLA)",
      "50 GB storage",
      "API access",
    ],
    cta: "Start Free Trial",
    featured: true,
    badge: "Most Popular",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large chains and hospital pharmacy networks.",
    features: [
      "Unlimited branches & users",
      "Everything in Professional",
      "Custom integrations",
      "Dedicated account manager",
      "SLA-backed uptime",
      "On-premise option",
      "Unlimited storage",
      "HIPAA / NABH compliance",
    ],
    cta: "Talk to Sales",
    featured: false,
  },
];

const TESTIMONIALS = [
  {
    quote: "Sushrusha cut our billing time by 60% and the multi-branch inventory view is a game changer. Highly recommend it to any growing chain.",
    name: "Dr. Ramesh Patel",
    role: "Founder, Patel Medicals (7 branches)",
    avatar: "RP",
    avatarColor: "#0f766e",
  },
  {
    quote: "The expiry tracking alone saved us from a ₹3L write-off this year. The interface is clean and our pharmacists picked it up within a day.",
    name: "Sunita Rao",
    role: "Operations Manager, HealthFirst Pharmacy",
    avatar: "SR",
    avatarColor: "#164e63",
  },
  {
    quote: "We launched our online store in under 30 minutes. Customer orders now come directly into the same POS — zero double entry.",
    name: "Karthik Nair",
    role: "Owner, CarePoint Pharmacy",
    avatar: "KN",
    avatarColor: "#0e7490",
  },
];

const FAQS = [
  {
    q: "Is there a free trial?",
    a: "Yes — all plans come with a 14-day free trial, no credit card required. You can upgrade, downgrade, or cancel at any time.",
  },
  {
    q: "Can I migrate my existing inventory data?",
    a: "Absolutely. Our onboarding team will assist you with a free data migration from Excel, Busy, Marg, or any other system.",
  },
  {
    q: "Is my data secure and compliant?",
    a: "All data is encrypted at rest (AES-256) and in transit (TLS 1.3). We maintain SOC 2 Type II and are working towards NABH digital certification.",
  },
  {
    q: "Does it work offline?",
    a: "Yes. Our POS module has a full offline mode. Sales, billing, and inventory updates sync automatically when connectivity is restored.",
  },
  {
    q: "How are software updates handled?",
    a: "Updates are automatic and rolled out without any downtime. You always have the latest features and security patches.",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main id="main-content">
        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section
          aria-labelledby="hero-heading"
          style={{
            background: "linear-gradient(155deg, var(--teal-900) 0%, var(--teal-700) 45%, #0e7490 75%, #0891b2 100%)",
            color: "white",
            padding: "6rem 1.5rem 5rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative circles */}
          <div aria-hidden="true" style={{
            position: "absolute", width: 600, height: 600, borderRadius: "50%",
            background: "rgba(255,255,255,0.04)", top: -200, right: -100, pointerEvents: "none",
          }}/>
          <div aria-hidden="true" style={{
            position: "absolute", width: 400, height: 400, borderRadius: "50%",
            background: "rgba(255,255,255,0.04)", bottom: -150, left: -80, pointerEvents: "none",
          }}/>
          <div aria-hidden="true" style={{
            position: "absolute", width: 200, height: 200, borderRadius: "50%",
            background: "rgba(255,255,255,0.06)", top: "30%", left: "15%", pointerEvents: "none",
          }}/>

          <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
            <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
              {/* Badge */}
              <div className="animate-fade-in" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "var(--radius-full)", padding: "0.375rem 1rem", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "1.75rem", backdropFilter: "blur(8px)" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block", animation: "pulse-ring 2s ease infinite" }}/>
                India&apos;s Leading Pharmacy Management Platform
              </div>

              <h1
                id="hero-heading"
                className="animate-fade-in delay-100"
                style={{ fontSize: "clamp(2.25rem, 5vw, 3.75rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em", margin: "0 0 1.25rem" }}
              >
                Manage Your Pharmacy{" "}
                <span style={{ background: "linear-gradient(90deg, #4ade80 0%, #2dd4bf 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  Smarter
                </span>
                , Not Harder
              </h1>

              <p
                className="animate-fade-in delay-200"
                style={{ fontSize: "clamp(1rem, 2vw, 1.2rem)", lineHeight: 1.7, color: "rgba(255,255,255,0.8)", margin: "0 0 2.25rem" }}
              >
                All-in-one pharmacy management with POS, inventory tracking, multi-branch control, and your own online store. Start in minutes — no technical skills required.
              </p>

              <div
                className="animate-fade-in delay-300"
                style={{ display: "flex", gap: "0.875rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "2.5rem" }}
              >
                <Link href="/signup" id="hero-cta-primary" className="btn btn-lg" style={{ background: "white", color: "var(--teal-700)", border: "1.5px solid white", fontWeight: 700 }}>
                  Start Free Trial — 14 days free
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
                <a href="#features" id="hero-cta-secondary" className="btn btn-lg" style={{ background: "rgba(255,255,255,0.12)", color: "white", border: "1.5px solid rgba(255,255,255,0.3)", backdropFilter: "blur(8px)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
                  Watch Demo
                </a>
              </div>

              {/* Trust signals */}
              <div
                className="animate-fade-in delay-400"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1.5rem", flexWrap: "wrap", fontSize: "0.8125rem", color: "rgba(255,255,255,0.7)", fontWeight: 500 }}
              >
                {["No credit card required", "14-day free trial", "Cancel anytime"].map((t) => (
                  <span key={t} style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Dashboard mockup card */}
            <div
              className="animate-fade-in delay-500"
              style={{ maxWidth: 900, margin: "3.5rem auto 0", position: "relative" }}
            >
              <div style={{
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "var(--radius-2xl)",
                padding: "1rem",
                boxShadow: "0 40px 80px rgba(0,0,0,0.4)",
              }}>
                {/* Fake browser chrome */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem", paddingLeft: "0.25rem" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", opacity: 0.8 }}/>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b", opacity: 0.8 }}/>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e", opacity: 0.8 }}/>
                  <div style={{ flex: 1, background: "rgba(255,255,255,0.1)", borderRadius: "var(--radius-md)", height: 24, marginLeft: "0.5rem", display: "flex", alignItems: "center", paddingLeft: "0.75rem", fontSize: "0.6875rem", color: "rgba(255,255,255,0.5)" }}>
                    app.sushrusha.com/dashboard
                  </div>
                </div>

                {/* Dashboard preview */}
                <div style={{ background: "var(--slate-50)", borderRadius: "var(--radius-xl)", overflow: "hidden", minHeight: 300 }}>
                  {/* Top bar */}
                  <div style={{ background: "white", borderBottom: "1px solid var(--color-border)", padding: "0.875rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{ width: 32, height: 32, borderRadius: "var(--radius-md)", background: "var(--teal-600)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      </div>
                      <span style={{ fontWeight: 700, color: "var(--slate-800)", fontSize: "0.9375rem" }}>Sushrusha</span>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <div style={{ background: "var(--teal-50)", border: "1px solid var(--teal-100)", borderRadius: "var(--radius-full)", padding: "0.25rem 0.75rem", fontSize: "0.75rem", fontWeight: 600, color: "var(--teal-700)" }}>
                        🏪 City Center Branch
                      </div>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--teal-600)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "white" }}>R</div>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div style={{ padding: "1rem 1.25rem", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem" }}>
                    {[
                      { label: "Today's Sales", value: "₹48,230", change: "+12%", up: true },
                      { label: "Orders", value: "184", change: "+8%", up: true },
                      { label: "Low Stock Items", value: "7", change: "-2", up: false },
                      { label: "Expiring Soon", value: "12", change: "30 days", up: false },
                    ].map((stat) => (
                      <div key={stat.label} style={{ background: "white", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "0.75rem" }}>
                        <div style={{ fontSize: "0.6875rem", color: "var(--color-muted)", fontWeight: 600, marginBottom: "0.25rem" }}>{stat.label}</div>
                        <div style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--slate-900)" }}>{stat.value}</div>
                        <div style={{ fontSize: "0.6875rem", color: stat.up ? "var(--color-success)" : "var(--color-warning)", fontWeight: 600, marginTop: "0.125rem" }}>
                          {stat.change}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Charts row placeholder */}
                  <div style={{ padding: "0 1.25rem 1rem", display: "grid", gridTemplateColumns: "2fr 1fr", gap: "0.75rem" }}>
                    <div style={{ background: "white", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "0.875rem", height: 100, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--slate-700)" }}>Sales Trend (7 days)</div>
                      <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: "6px" }}>
                        {[40, 65, 45, 80, 55, 90, 72].map((h, i) => (
                          <div key={i} style={{ flex: 1, background: `linear-gradient(to top, var(--teal-600), var(--teal-400))`, borderRadius: "2px 2px 0 0", height: `${h}%`, opacity: 0.85 }}/>
                        ))}
                      </div>
                    </div>
                    <div style={{ background: "white", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "0.875rem", height: 100, display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                      <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--slate-700)" }}>Top Categories</div>
                      {[["Antibiotics", 38], ["Vitamins", 22], ["Cardiac", 18]].map(([label, pct]) => (
                        <div key={label as string}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.625rem", color: "var(--color-muted)", marginBottom: "2px" }}>
                            <span>{label}</span><span>{pct}%</span>
                          </div>
                          <div style={{ height: 4, background: "var(--slate-100)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                            <div style={{ width: `${pct}%`, height: "100%", background: "var(--teal-600)", borderRadius: "var(--radius-full)" }}/>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating notification */}
              <div
                className="animate-float"
                style={{
                  position: "absolute",
                  bottom: "-1rem",
                  right: "-1rem",
                  background: "white",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-xl)",
                  padding: "0.75rem 1rem",
                  boxShadow: "var(--shadow-xl)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.625rem",
                  fontSize: "0.8125rem",
                }}
              >
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--color-success-bg)", border: "2px solid var(--color-success-border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: "var(--slate-800)", lineHeight: 1.3 }}>New Online Order!</div>
                  <div style={{ color: "var(--color-muted)", fontSize: "0.75rem" }}>₹1,250 · 3 items</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats Bar ────────────────────────────────────────────── */}
        <section aria-label="Key statistics" style={{ background: "white", borderBottom: "1px solid var(--color-border)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem" }} className="stats-grid">
              {STATS.map(({ value, label }) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 800, color: "var(--teal-700)", letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: "0.875rem", color: "var(--color-muted)", marginTop: "0.375rem", fontWeight: 500 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
          <style>{`.stats-grid { @media (max-width: 640px) { grid-template-columns: 1fr 1fr !important; } }`}</style>
        </section>

        {/* ── Features ─────────────────────────────────────────────── */}
        <section
          id="features"
          aria-labelledby="features-heading"
          style={{ padding: "6rem 1.5rem", background: "var(--color-bg)" }}
        >
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
              <span className="badge badge-primary" style={{ marginBottom: "1rem", display: "inline-flex" }}>Features</span>
              <h2 id="features-heading" style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 800, letterSpacing: "-0.025em", color: "var(--slate-900)", margin: "0 0 1rem" }}>
                Everything a pharmacy needs, built in
              </h2>
              <p style={{ fontSize: "1.0625rem", color: "var(--color-muted)", maxWidth: 540, margin: "0 auto", lineHeight: 1.7 }}>
                From billing to branch management, every feature is purpose-built for pharmacies — not generic businesses.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem" }} className="features-grid">
              {FEATURES.map(({ icon, title, description }) => (
                <article key={title} className="feature-card">
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <div className="icon-box icon-box-lg" style={{ marginBottom: "1.25rem" }}>{icon}</div>
                    <h3 style={{ fontSize: "1.0625rem", fontWeight: 700, color: "var(--slate-900)", margin: "0 0 0.5rem" }}>{title}</h3>
                    <p style={{ fontSize: "0.9375rem", color: "var(--color-muted)", lineHeight: 1.6, margin: 0 }}>{description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <style>{`
            .features-grid {
              @media (max-width: 1024px) { grid-template-columns: repeat(2, 1fr) !important; }
              @media (max-width: 640px)  { grid-template-columns: 1fr !important; }
            }
          `}</style>
        </section>

        {/* ── How it works ─────────────────────────────────────────── */}
        <section
          id="how-it-works"
          aria-labelledby="how-heading"
          style={{ padding: "6rem 1.5rem", background: "white" }}
        >
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
              <span className="badge badge-primary" style={{ marginBottom: "1rem", display: "inline-flex" }}>Simple Setup</span>
              <h2 id="how-heading" style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 800, letterSpacing: "-0.025em", color: "var(--slate-900)", margin: "0 0 1rem" }}>
                Up and running in 3 steps
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem", position: "relative" }} className="steps-grid">
              {/* Connector line */}
              <div aria-hidden="true" style={{ position: "absolute", top: "2.25rem", left: "16%", right: "16%", height: 2, background: "linear-gradient(to right, var(--teal-200), var(--teal-400), var(--teal-200))" }} className="step-connector"/>

              {[
                {
                  step: "01",
                  title: "Sign up & add your pharmacy",
                  desc: "Create your account, enter your pharmacy details, and add branches — takes less than 5 minutes.",
                  icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
                },
                {
                  step: "02",
                  title: "Import your inventory",
                  desc: "Upload your existing stock from Excel or let our team migrate it for free.",
                  icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
                },
                {
                  step: "03",
                  title: "Start billing & growing",
                  desc: "Your pharmacists can start billing, tracking stock, and serving online customers right away.",
                  icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
                },
              ].map(({ step, title, desc, icon }) => (
                <div key={step} style={{ textAlign: "center", position: "relative" }}>
                  <div style={{ width: "4rem", height: "4rem", borderRadius: "50%", background: "linear-gradient(135deg, var(--teal-600), var(--teal-800))", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem", color: "white", boxShadow: "0 4px 16px rgba(15,118,110,0.3)", position: "relative", zIndex: 1 }}>
                    {icon}
                  </div>
                  <div className="badge badge-primary" style={{ marginBottom: "0.75rem", display: "inline-flex" }}>Step {step}</div>
                  <h3 style={{ fontSize: "1.0625rem", fontWeight: 700, color: "var(--slate-900)", margin: "0 0 0.5rem" }}>{title}</h3>
                  <p style={{ fontSize: "0.9375rem", color: "var(--color-muted)", lineHeight: 1.6, margin: 0 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <style>{`
            .steps-grid  { @media (max-width: 640px) { grid-template-columns: 1fr !important; } }
            .step-connector { @media (max-width: 640px) { display: none !important; } }
          `}</style>
        </section>

        {/* ── Pricing ──────────────────────────────────────────────── */}
        <section
          id="pricing"
          aria-labelledby="pricing-heading"
          style={{ padding: "6rem 1.5rem", background: "var(--color-bg)" }}
        >
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
              <span className="badge badge-primary" style={{ marginBottom: "1rem", display: "inline-flex" }}>Pricing</span>
              <h2 id="pricing-heading" style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 800, letterSpacing: "-0.025em", color: "var(--slate-900)", margin: "0 0 1rem" }}>
                Simple, transparent pricing
              </h2>
              <p style={{ fontSize: "1.0625rem", color: "var(--color-muted)", maxWidth: 500, margin: "0 auto" }}>
                14-day free trial on all plans. No setup fees. No hidden charges.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", alignItems: "start" }} className="pricing-grid">
              {PRICING.map(({ name, price, period, description, features, cta, featured, badge }) => (
                <div key={name} className={`pricing-card ${featured ? "featured" : ""}`}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                      <h3 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0, color: featured ? "white" : "var(--slate-900)" }}>{name}</h3>
                      {badge && <span style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "var(--radius-full)", padding: "0.1875rem 0.625rem", fontSize: "0.6875rem", fontWeight: 700, color: "white" }}>{badge}</span>}
                    </div>
                    <p style={{ fontSize: "0.875rem", color: featured ? "rgba(255,255,255,0.7)" : "var(--color-muted)", margin: "0 0 1.25rem", lineHeight: 1.5 }}>{description}</p>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem", marginBottom: "1.5rem" }}>
                      <span style={{ fontSize: "2.25rem", fontWeight: 800, letterSpacing: "-0.03em", color: featured ? "white" : "var(--slate-900)" }}>{price}</span>
                      {period && <span style={{ fontSize: "0.9375rem", color: featured ? "rgba(255,255,255,0.6)" : "var(--color-muted)" }}>{period}</span>}
                    </div>
                  </div>

                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.5rem", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                    {features.map((f) => (
                      <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.9375rem", color: featured ? "rgba(255,255,255,0.85)" : "var(--slate-700)" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={featured ? "#4ade80" : "var(--teal-600)"} strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}><polyline points="20 6 9 17 4 12"/></svg>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={cta === "Talk to Sales" ? "/contact" : "/signup"}
                    id={`pricing-cta-${name.toLowerCase()}`}
                    className="btn btn-lg"
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      background: featured ? "white" : "var(--color-primary)",
                      color: featured ? "var(--teal-700)" : "white",
                      border: featured ? "1.5px solid white" : "1.5px solid var(--color-primary)",
                      fontWeight: 700,
                    }}
                  >
                    {cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <style>{`
            .pricing-grid {
              @media (max-width: 1024px) { grid-template-columns: 1fr !important; max-width: 440px; margin: 0 auto; }
            }
          `}</style>
        </section>

        {/* ── Testimonials ─────────────────────────────────────────── */}
        <section
          id="testimonials"
          aria-labelledby="testimonials-heading"
          style={{ padding: "6rem 1.5rem", background: "white" }}
        >
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
              <span className="badge badge-primary" style={{ marginBottom: "1rem", display: "inline-flex" }}>Customers</span>
              <h2 id="testimonials-heading" style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 800, letterSpacing: "-0.025em", color: "var(--slate-900)", margin: "0 0 1rem" }}>
                Trusted by pharmacists across India
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }} className="testimonials-grid">
              {TESTIMONIALS.map(({ quote, name, role, avatar, avatarColor }) => (
                <article key={name} className="testimonial-card">
                  {/* Stars */}
                  <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1rem" }}>
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    ))}
                  </div>
                  <blockquote style={{ fontSize: "0.9375rem", color: "var(--slate-700)", lineHeight: 1.7, fontStyle: "italic", margin: "0 0 1.25rem" }}>
                    &ldquo;{quote}&rdquo;
                  </blockquote>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: avatarColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.875rem", fontWeight: 700, color: "white", flexShrink: 0 }}>
                      {avatar}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: "var(--slate-900)", fontSize: "0.9375rem" }}>{name}</div>
                      <div style={{ fontSize: "0.8125rem", color: "var(--color-muted)" }}>{role}</div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <style>{`
            .testimonials-grid {
              @media (max-width: 1024px) { grid-template-columns: 1fr 1fr !important; }
              @media (max-width: 640px)  { grid-template-columns: 1fr !important; }
            }
          `}</style>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────── */}
        <section
          id="faq"
          aria-labelledby="faq-heading"
          style={{ padding: "6rem 1.5rem", background: "var(--color-bg)" }}
        >
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
              <span className="badge badge-primary" style={{ marginBottom: "1rem", display: "inline-flex" }}>FAQ</span>
              <h2 id="faq-heading" style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 800, letterSpacing: "-0.025em", color: "var(--slate-900)", margin: 0 }}>
                Frequently asked questions
              </h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {FAQS.map(({ q, a }) => (
                <details
                  key={q}
                  style={{ background: "white", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", overflow: "hidden" }}
                >
                  <summary style={{ padding: "1.125rem 1.25rem", fontWeight: 600, fontSize: "1rem", color: "var(--slate-800)", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", listStyle: "none", userSelect: "none" }}>
                    {q}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, transition: "transform var(--duration-base)" }}>
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </summary>
                  <div style={{ padding: "0 1.25rem 1.125rem", fontSize: "0.9375rem", color: "var(--color-muted)", lineHeight: 1.7 }}>
                    {a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Banner ───────────────────────────────────────────── */}
        <section
          aria-labelledby="cta-heading"
          style={{
            background: "linear-gradient(135deg, var(--teal-900) 0%, var(--teal-700) 60%, #0e7490 100%)",
            padding: "5rem 1.5rem",
            textAlign: "center",
            color: "white",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }}/>
          <div style={{ maxWidth: 640, margin: "0 auto", position: "relative", zIndex: 1 }}>
            <h2 id="cta-heading" style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 800, letterSpacing: "-0.025em", margin: "0 0 1rem" }}>
              Ready to modernise your pharmacy?
            </h2>
            <p style={{ fontSize: "1.0625rem", color: "rgba(255,255,255,0.8)", margin: "0 0 2.25rem", lineHeight: 1.7 }}>
              Join 500+ pharmacies saving time and growing revenue with Sushrusha. Start your free 14-day trial today.
            </p>
            <div style={{ display: "flex", gap: "0.875rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/signup" id="cta-signup-btn" className="btn btn-lg" style={{ background: "white", color: "var(--teal-700)", fontWeight: 700, border: "1.5px solid white" }}>
                Start Free Trial
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              <Link href="/login" id="cta-login-btn" className="btn btn-lg" style={{ background: "rgba(255,255,255,0.12)", color: "white", border: "1.5px solid rgba(255,255,255,0.3)" }}>
                Already have an account? Log in
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
