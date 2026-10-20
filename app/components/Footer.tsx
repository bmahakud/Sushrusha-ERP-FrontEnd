"use client";

import Link from "next/link";

const FOOTER_LINKS = {
  Product: [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Changelog", href: "/changelog" },
    { label: "Roadmap", href: "/roadmap" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ],
  Legal: [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "HIPAA Compliance", href: "/hipaa" },
  ],
  Support: [
    { label: "Help Center", href: "/help" },
    { label: "API Docs", href: "/docs" },
    { label: "System Status", href: "/status" },
    { label: "Community", href: "/community" },
  ],
};

// Evaluated once at module-load time — stable, no prerender instability
const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  const year = CURRENT_YEAR;

  return (
    <footer
      style={{
        background: "var(--slate-900)",
        color: "var(--slate-400)",
        padding: "4rem 0 2rem",
        marginTop: "auto",
      }}
      aria-label="Site footer"
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem" }}>
        {/* Top section */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr repeat(4, 1fr)",
            gap: "3rem",
            marginBottom: "3rem",
          }}
          className="footer-grid"
        >
          {/* Brand */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                textDecoration: "none",
              }}
              aria-label="Sushrusha home"
            >
              <div
                style={{
                  width: "2.25rem",
                  height: "2.25rem",
                  borderRadius: "var(--radius-lg)",
                  background: "linear-gradient(135deg, var(--teal-600), var(--teal-400))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <span style={{ fontSize: "1.125rem", fontWeight: 700, color: "white", letterSpacing: "-0.02em" }}>
                Sushrusha
              </span>
            </Link>
            <p style={{ fontSize: "0.875rem", lineHeight: 1.7, maxWidth: "20rem" }}>
              The all-in-one pharmacy management platform trusted by 500+ pharmacies across India.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              <span className="badge badge-success" style={{ fontSize: "0.6875rem" }}>
                ✓ HIPAA Compliant
              </span>
              <span className="badge badge-primary" style={{ fontSize: "0.6875rem" }}>
                ✓ ISO 27001
              </span>
            </div>
          </div>

          {/* Link groups */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              <h3
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  color: "white",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  margin: 0,
                }}
              >
                {group}
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--slate-400)",
                        textDecoration: "none",
                        transition: "color var(--duration-base) var(--ease-smooth)",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--slate-400)")}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid var(--slate-800)", paddingTop: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <p style={{ fontSize: "0.8125rem", margin: 0 }}>
              © {year} Sushrusha Technologies Pvt. Ltd. All rights reserved.
            </p>
            <p style={{ fontSize: "0.8125rem", margin: 0 }}>
              Made with ♥ in India
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .footer-grid { grid-template-columns: 1fr 1fr 1fr !important; }
        }
        @media (max-width: 640px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 2rem !important; }
        }
      `}</style>
    </footer>
  );
}
