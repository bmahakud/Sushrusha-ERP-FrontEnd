"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const NAV_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#pricing",  label: "Pricing" },
  { href: "/#testimonials", label: "Customers" },
  { href: "/#faq",      label: "FAQ" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change (adjust state during render, not in an effect)
  const [menuPathname, setMenuPathname] = useState(pathname);
  if (menuPathname !== pathname) {
    setMenuPathname(pathname);
    setMobileOpen(false);
  }

  return (
    <header
      className="navbar"
      style={{
        background: scrolled
          ? "rgba(255,255,255,0.96)"
          : "rgba(255,255,255,0.88)",
        boxShadow: scrolled ? "var(--shadow-sm)" : "none",
        borderBottomColor: scrolled ? "var(--color-border)" : "transparent",
      }}
    >
      <nav
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "4rem",
        }}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          id="navbar-logo"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.625rem",
            textDecoration: "none",
          }}
          aria-label="Sushrusha – go to home"
        >
          <div
            style={{
              width: "2.25rem",
              height: "2.25rem",
              borderRadius: "var(--radius-lg)",
              background: "linear-gradient(135deg, var(--teal-600), var(--teal-900))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <span
            style={{
              fontSize: "1.1875rem",
              fontWeight: 700,
              color: "var(--slate-900)",
              letterSpacing: "-0.02em",
            }}
          >
            Sushrusha
          </span>
        </Link>

        {/* Desktop links */}
        <ul
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            listStyle: "none",
            margin: 0,
            padding: 0,
          }}
          className="desktop-nav"
        >
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <a href={href} className="nav-link">
                {label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <div
          style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}
          className="desktop-cta"
        >
          <Link href="/login" className="btn btn-ghost btn-sm" id="nav-login-btn">
            Log in
          </Link>
          <Link
            href="/signup"
            className="btn btn-primary btn-sm"
            id="nav-signup-btn"
          >
            Start Free Trial
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          id="mobile-menu-toggle"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((o) => !o)}
          className="btn btn-ghost btn-icon mobile-menu-btn"
          style={{ display: "none" }}
        >
          {mobileOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 12h18M3 6h18M3 18h18"/>
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          style={{
            borderTop: "1px solid var(--color-border)",
            background: "var(--color-surface)",
            padding: "1rem 1.5rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
          }}
          id="mobile-menu"
        >
          {NAV_LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="nav-link"
              style={{ padding: "0.625rem 0.875rem", display: "block" }}
            >
              {label}
            </a>
          ))}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              marginTop: "0.75rem",
              paddingTop: "0.75rem",
              borderTop: "1px solid var(--color-border)",
            }}
          >
            <Link href="/login" className="btn btn-outline btn-lg" id="mobile-login-btn">
              Log in
            </Link>
            <Link href="/signup" className="btn btn-primary btn-lg" id="mobile-signup-btn">
              Start Free Trial
            </Link>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav, .desktop-cta { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
