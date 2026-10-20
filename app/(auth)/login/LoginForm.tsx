"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback, Suspense } from "react";
import { authApi, tokenStorage, SushrushApiError, type AuthResponse } from "../../lib/api";
import { validateEmail, validateLoginPassword } from "../../lib/validation";
import { postLoginPath } from "../../lib/dashboard/roles";

const PREFILL_KEY = "sushrusha_prefill_email";

/** Only same-origin relative paths are accepted as ?redirect= targets (no open redirects). */
function safeRedirect(value: string | null): string | null {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : null;
}

// ─── Session-expired / link-expired banners ──────────────────────────────────
type BannerKind = "session-expired" | "link-expired" | "logged-out" | "verify-email" | null;

function bannerConfig(kind: BannerKind): { type: "warning" | "info" | "success"; text: string } | null {
  switch (kind) {
    case "session-expired":
      return { type: "warning", text: "Your session expired. Please log in again to continue." };
    case "link-expired":
      return { type: "warning", text: "This link has expired. Please log in to request a new one." };
    case "logged-out":
      return { type: "success", text: "You have been logged out successfully." };
    case "verify-email":
      return { type: "info", text: "Please check your email for a verification link before logging in." };
    default:
      return null;
  }
}

// ─── Left panel illustrations ─────────────────────────────────────────────────
const TESTIMONIAL = {
  quote: "Sushrusha cut our billing time by 60% and the multi-branch view is a game changer.",
  author: "Dr. Ramesh Patel",
  role: "Founder, Patel Medicals (7 branches)",
  avatar: "RP",
};

// ─── Inner form (needs Suspense for useSearchParams) ─────────────────────────

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const banner = bannerConfig(searchParams.get("reason") as BannerKind);
  const redirectTo = safeRedirect(searchParams.get("redirect"));

  // Form state
  // This component renders on the client only (useSearchParams inside Suspense), so reading storage here is safe.
  const [email, setEmail] = useState(() => {
    try { return sessionStorage.getItem(PREFILL_KEY) ?? ""; } catch { return ""; }
  });
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);

  // Forgot password flow
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  // Pre-fill is single-use: drop it once read
  useEffect(() => {
    try { sessionStorage.removeItem(PREFILL_KEY); } catch { /* storage unavailable */ }
  }, []);

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = useCallback(() => {
    const e: typeof errors = {};
    const em = validateEmail(email);
    const pw = validateLoginPassword(password);
    if (em) e.email = em;
    if (pw) e.password = pw;
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [email, password]);

  const clearFieldError = (field: keyof typeof errors) =>
    setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await authApi.login({ email: email.trim().toLowerCase(), password, rememberMe });
      const { user, tokens } = res.data as AuthResponse;
      tokenStorage.set(tokens.accessToken);
      tokenStorage.setRefresh(tokens.refreshToken);

      // Short success flash before redirect
      setApiSuccess(`Welcome back, ${user.fullName.split(" ")[0]}! Redirecting…`);
      // Owners go to their dashboard; employees pick an assigned store first (workflow spec §4.3)
      setTimeout(() => router.push(redirectTo ?? postLoginPath(user.role)), 800);
    } catch (err) {
      if (err instanceof SushrushApiError) {
        // Never expose auth internals — show safe generic messages
        if (err.status === 401) {
          setApiError("Incorrect email or password. Please try again.");
        } else if (err.status === 429) {
          setApiError("Too many login attempts. Please wait a few minutes and try again.");
        } else if (err.status === 403) {
          setApiError("Your account has been suspended. Please contact support.");
        } else {
          setApiError(err.message);
        }
      } else {
        setApiError("Unable to sign in right now. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Forgot password ───────────────────────────────────────────────────────
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    const err = validateEmail(forgotEmail);
    if (err) { setForgotError(err); return; }

    setForgotLoading(true);
    try {
      await authApi.forgotPassword(forgotEmail.trim().toLowerCase());
      setForgotSent(true);
    } catch {
      // Always show success to prevent email enumeration
      setForgotSent(true);
    } finally {
      setForgotLoading(false);
    }
  };

  // ── JSX ───────────────────────────────────────────────────────────────────
  return (
    <div className="auth-layout" style={{ fontFamily: "var(--font-sans)" }}>
      {/* ── Left panel ─────────────────────────────────────────────── */}
      <aside className="auth-panel-left" aria-hidden="true">
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none", color: "white" }}>
            <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "var(--radius-xl)", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: "1.25rem", letterSpacing: "-0.02em" }}>Sushrusha</span>
          </Link>

          {/* Central content */}
          <div>
            <div style={{ marginBottom: "2.5rem" }}>
              <div style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 800, lineHeight: 1.15, marginBottom: "1rem", letterSpacing: "-0.025em" }}>
                The smarter way to<br/>run your pharmacy
              </div>
              <p style={{ fontSize: "1.0625rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.7, maxWidth: "22rem" }}>
                Manage billing, inventory, and multiple branches from a single, elegant dashboard.
              </p>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2.5rem" }}>
              {[
                { value: "500+", label: "Pharmacies" },
                { value: "99.97%", label: "Uptime" },
                { value: "₹12Cr+", label: "Processed" },
                { value: "< 2min", label: "Support SLA" },
              ].map(({ value, label }) => (
                <div key={label} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "var(--radius-xl)", padding: "1rem" }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.025em" }}>{value}</div>
                  <div style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.65)", marginTop: "0.125rem" }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Testimonial */}
            <div style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "var(--radius-xl)", padding: "1.25rem 1.5rem" }}>
              <div style={{ display: "flex", gap: "0.25rem", marginBottom: "0.75rem" }}>
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="14" height="14" fill="#fbbf24" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                ))}
              </div>
              <p style={{ fontSize: "0.9375rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.6, fontStyle: "italic", margin: "0 0 1rem" }}>
                &ldquo;{TESTIMONIAL.quote}&rdquo;
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8125rem", fontWeight: 700 }}>
                  {TESTIMONIAL.avatar}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.875rem" }}>{TESTIMONIAL.author}</div>
                  <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)" }}>{TESTIMONIAL.role}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Compliance badges */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {["HIPAA Compliant", "ISO 27001", "256-bit Encryption"].map((b) => (
              <span key={b} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "var(--radius-full)", padding: "0.25rem 0.75rem", fontSize: "0.6875rem", fontWeight: 600 }}>
                ✓ {b}
              </span>
            ))}
          </div>
        </div>
      </aside>

      {/* ── Right panel ────────────────────────────────────────────── */}
      <div className="auth-panel" style={{ background: "var(--color-bg)", overflowY: "auto" }}>
        <div className="auth-form-card animate-fade-in">
          {/* Banner (session-expired, link-expired, etc.) */}
          {banner && !apiSuccess && (
            <div
              className={`alert alert-${banner.type === "warning" ? "warning" : banner.type === "info" ? "info" : "success"}`}
              style={{ marginBottom: "1.5rem" }}
              role="status"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
                {banner.type === "warning"
                  ? <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>
                  : banner.type === "info"
                  ? <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>
                  : <><polyline points="20 6 9 17 4 12"/></>
                }
              </svg>
              <span style={{ flex: 1, fontSize: "0.875rem" }}>{banner.text}</span>
            </div>
          )}

          {/* Toggle: login vs forgot */}
          {!showForgot ? (
            <>
              {/* Header */}
              <div style={{ marginBottom: "1.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1.25rem" }}>
                  <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }} className="md-only-logo">
                    <div style={{ width: "2rem", height: "2rem", borderRadius: "var(--radius-md)", background: "linear-gradient(135deg, var(--teal-600), var(--teal-900))", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    </div>
                    <span style={{ fontWeight: 800, fontSize: "1.0625rem", letterSpacing: "-0.02em", color: "var(--slate-900)" }}>Sushrusha</span>
                  </Link>
                </div>
                <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: "var(--slate-900)", margin: "0 0 0.375rem", letterSpacing: "-0.025em" }}>
                  Welcome back
                </h1>
                <p style={{ fontSize: "0.9375rem", color: "var(--color-muted)", margin: 0 }}>
                  Sign in to your pharmacy account
                </p>
              </div>

              {/* API Error */}
              {apiError && (
                <div className="alert alert-error" role="alert" style={{ marginBottom: "1.25rem" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span style={{ flex: 1, fontSize: "0.875rem" }}>{apiError}</span>
                </div>
              )}

              {/* API Success */}
              {apiSuccess && (
                <div className="alert alert-success" role="status" style={{ marginBottom: "1.25rem" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span style={{ flex: 1, fontSize: "0.875rem" }}>{apiSuccess}</span>
                </div>
              )}

              {/* Login form */}
              <form onSubmit={handleSubmit} noValidate aria-label="Login form">
                <div style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
                  {/* Email */}
                  <div className="form-group">
                    <label htmlFor="login-email" className="form-label">
                      Email address <span className="required">*</span>
                    </label>
                    <div className="input-wrapper">
                      <span className="input-icon-left" aria-hidden="true">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      </span>
                      <input
                        id="login-email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); clearFieldError("email"); setApiError(null); }}
                        onBlur={() => { if (email) { const err = validateEmail(email); if (err) setErrors((p) => ({ ...p, email: err })); } }}
                        className={`form-input has-left-icon${errors.email ? " is-error" : ""}`}
                        aria-describedby={errors.email ? "login-email-error" : undefined}
                        aria-invalid={!!errors.email}
                        disabled={isLoading || !!apiSuccess}
                      />
                    </div>
                    {errors.email && (
                      <span id="login-email-error" className="form-error" role="alert">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        {errors.email}
                      </span>
                    )}
                  </div>

                  {/* Password */}
                  <div className="form-group">
                    <label htmlFor="login-password" className="form-label">
                      Password <span className="required">*</span>
                    </label>
                    <div className="input-wrapper">
                      <span className="input-icon-left" aria-hidden="true">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      </span>
                      <input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); clearFieldError("password"); setApiError(null); }}
                        className={`form-input has-left-icon has-right-icon${errors.password ? " is-error" : ""}`}
                        aria-describedby={errors.password ? "login-password-error" : undefined}
                        aria-invalid={!!errors.password}
                        disabled={isLoading || !!apiSuccess}
                      />
                      <button
                        type="button"
                        id="login-toggle-password"
                        className="input-icon-right btn-ghost"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        style={{ background: "none", border: "none", padding: "0.25rem", borderRadius: "var(--radius-sm)", cursor: "pointer", color: "var(--color-subtle)" }}
                      >
                        {showPassword ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <span id="login-password-error" className="form-error" role="alert">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        {errors.password}
                      </span>
                    )}
                  </div>

                  {/* Remember me + Forgot */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.875rem", color: "var(--slate-700)", userSelect: "none" }}>
                      <input
                        id="login-remember"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="form-checkbox"
                      />
                      Remember me
                    </label>
                    <button
                      type="button"
                      id="login-forgot-password"
                      onClick={() => { setShowForgot(true); setForgotEmail(email); setApiError(null); }}
                      style={{ background: "none", border: "none", padding: 0, fontSize: "0.875rem", fontWeight: 600, color: "var(--color-primary)", cursor: "pointer" }}
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Submit */}
                  <button
                    id="login-submit-btn"
                    type="submit"
                    className={`btn btn-primary btn-lg${isLoading ? " btn-loading" : ""}`}
                    style={{ width: "100%", justifyContent: "center", marginTop: "0.25rem" }}
                    disabled={isLoading || !!apiSuccess}
                    aria-busy={isLoading}
                  >
                    {isLoading ? "Signing in…" : "Sign In"}
                    {!isLoading && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    )}
                  </button>
                </div>
              </form>

              {/* Divider */}
              <div className="divider" style={{ margin: "1.5rem 0" }}>or continue with</div>

              {/* SSO placeholder */}
              <button
                id="login-google-btn"
                type="button"
                className="btn btn-outline btn-lg"
                style={{ width: "100%", justifyContent: "center", gap: "0.75rem" }}
                disabled={isLoading}
                onClick={() => setApiError("Google login is coming soon. Please use your email and password.")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continue with Google
              </button>

              {/* Sign up link */}
              <p style={{ textAlign: "center", fontSize: "0.9375rem", color: "var(--color-muted)", marginTop: "1.5rem", marginBottom: 0 }}>
                Don&apos;t have an account?{" "}
                <Link href="/signup" id="login-signup-link" style={{ color: "var(--color-primary)", fontWeight: 700, textDecoration: "none" }}>
                  Start free trial
                </Link>
              </p>
            </>
          ) : (
            /* ── Forgot password panel ─────────────────────────────── */
            <>
              <button
                type="button"
                id="forgot-back-btn"
                onClick={() => { setShowForgot(false); setForgotSent(false); setForgotError(null); }}
                style={{ display: "flex", alignItems: "center", gap: "0.375rem", background: "none", border: "none", padding: 0, color: "var(--color-muted)", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", marginBottom: "1.5rem" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                Back to login
              </button>

              <div style={{ marginBottom: "1.75rem" }}>
                <div style={{ width: "3.5rem", height: "3.5rem", borderRadius: "var(--radius-xl)", background: "var(--teal-50)", border: "1px solid var(--teal-100)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem", color: "var(--teal-600)" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--slate-900)", margin: "0 0 0.375rem", letterSpacing: "-0.02em" }}>
                  Reset your password
                </h1>
                <p style={{ fontSize: "0.9375rem", color: "var(--color-muted)", margin: 0, lineHeight: 1.6 }}>
                  Enter your email and we&apos;ll send you a secure reset link.
                </p>
              </div>

              {forgotSent ? (
                <div className="alert alert-success" role="status">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Check your inbox</div>
                    <div style={{ fontSize: "0.875rem" }}>
                      If an account exists for <strong>{forgotEmail}</strong>, you&apos;ll receive a reset link within 5 minutes. Check your spam folder if you don&apos;t see it.
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleForgot} noValidate aria-label="Forgot password form">
                  <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                    <label htmlFor="forgot-email" className="form-label">
                      Email address <span className="required">*</span>
                    </label>
                    <div className="input-wrapper">
                      <span className="input-icon-left" aria-hidden="true">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      </span>
                      <input
                        id="forgot-email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={forgotEmail}
                        onChange={(e) => { setForgotEmail(e.target.value); setForgotError(null); }}
                        className={`form-input has-left-icon${forgotError ? " is-error" : ""}`}
                        aria-describedby={forgotError ? "forgot-email-error" : undefined}
                        aria-invalid={!!forgotError}
                        disabled={forgotLoading}
                      />
                    </div>
                    {forgotError && (
                      <span id="forgot-email-error" className="form-error" role="alert">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        {forgotError}
                      </span>
                    )}
                  </div>

                  <button
                    id="forgot-submit-btn"
                    type="submit"
                    className={`btn btn-primary btn-lg${forgotLoading ? " btn-loading" : ""}`}
                    style={{ width: "100%", justifyContent: "center" }}
                    disabled={forgotLoading}
                    aria-busy={forgotLoading}
                  >
                    {forgotLoading ? "Sending…" : "Send reset link"}
                  </button>
                </form>
              )}

              {/* Security note */}
              <div style={{ marginTop: "1.5rem", padding: "0.875rem 1rem", background: "var(--slate-50)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", display: "flex", gap: "0.625rem", alignItems: "flex-start" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <p style={{ fontSize: "0.8125rem", color: "var(--color-muted)", margin: 0, lineHeight: 1.5 }}>
                  For your security, reset links expire in 30 minutes and can only be used once.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (min-width: 769px) { .md-only-logo { display: none !important; } }
      `}</style>
    </div>
  );
}

// Wrap in Suspense for useSearchParams
export default function LoginForm() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-bg)" }}>
        <div style={{ width: 40, height: 40, border: "3px solid var(--teal-100)", borderTop: "3px solid var(--teal-600)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}/>
      </div>
    }>
      <LoginFormInner />
    </Suspense>
  );
}
