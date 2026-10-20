"use client";

import Link from "next/link";
import { useState, useCallback, Suspense } from "react";
import { authApi, tokenStorage, SushrushApiError, type AuthResponse } from "../../lib/api";
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateFullName,
  validatePhone,
  validateOrganizationName,
  validateTerms,
  getPasswordStrength,
  hasErrors,
  type FormErrors,
} from "../../lib/validation";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3;
type Role = "owner" | "pharmacist" | "staff";

interface Fields {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirm: string;
  organizationName: string;
  role: Role;
  agreedToTerms: boolean;
}

type FieldKey = keyof Fields;
type ErrorMap = FormErrors<FieldKey>;

const ROLE_OPTIONS: { value: Role; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    value: "owner",
    label: "Owner / Admin",
    desc: "Full access to all branches, billing, reports, and staff management.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    value: "pharmacist",
    label: "Pharmacist",
    desc: "Billing, dispensing, prescription management, and inventory access.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
  },
  {
    value: "staff",
    label: "Staff / Cashier",
    desc: "POS billing and basic inventory lookups only.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
];

const STEP_LABELS = ["Account", "Pharmacy", "Confirm"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function validateStep(step: Step, fields: Fields): ErrorMap {
  const errs: ErrorMap = {};
  if (step === 1) {
    const n = validateFullName(fields.fullName);
    const e = validateEmail(fields.email);
    const p = validatePhone(fields.phone);
    const pw = validatePassword(fields.password);
    const cf = validateConfirmPassword(fields.password, fields.confirm);
    if (n)  errs.fullName = n;
    if (e)  errs.email    = e;
    if (p)  errs.phone    = p;
    if (pw) errs.password = pw;
    if (cf) errs.confirm  = cf;
  }
  if (step === 2) {
    const o = validateOrganizationName(fields.organizationName);
    if (o)  errs.organizationName = o;
  }
  if (step === 3) {
    const t = validateTerms(fields.agreedToTerms);
    if (t)  errs.agreedToTerms = t;
  }
  return errs;
}

// ─── Success screen ───────────────────────────────────────────────────────────

function SuccessScreen({ name, org }: { name: string; org: string }) {
  return (
    <div style={{ textAlign: "center", padding: "1rem 0" }}>
      <div style={{ width: "5rem", height: "5rem", borderRadius: "50%", background: "var(--color-success-bg)", border: "2px solid var(--color-success-border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", color: "var(--color-success)" }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--slate-900)", margin: "0 0 0.5rem", letterSpacing: "-0.02em" }}>
        Account created!
      </h2>
      <p style={{ fontSize: "0.9375rem", color: "var(--color-muted)", margin: "0 0 1.5rem", lineHeight: 1.6, maxWidth: "22rem", marginLeft: "auto", marginRight: "auto" }}>
        Welcome to Sushrusha, <strong>{name}</strong>! Your <strong>{org}</strong> workspace is ready.
      </p>

      <div className="alert alert-info" style={{ textAlign: "left", marginBottom: "1.5rem" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
        </svg>
        <div style={{ fontSize: "0.875rem" }}>
          <strong>Verify your email:</strong> We&apos;ve sent a confirmation link to your inbox. Click it to unlock all features.
        </div>
      </div>

      <Link href="/dashboard" id="signup-goto-dashboard" className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center" }}>
        Go to Dashboard
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </Link>
    </div>
  );
}

// ─── Main form ────────────────────────────────────────────────────────────────

function SignupFormInner() {

  const [step, setStep] = useState<Step>(1);
  const [done, setDone] = useState(false);
  const [doneUser, setDoneUser] = useState({ name: "", org: "" });

  const [fields, setFields] = useState<Fields>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    organizationName: "",
    role: "owner",
    agreedToTerms: false,
  });

  const [errors, setErrors] = useState<ErrorMap>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const strength = getPasswordStrength(fields.password);

  // Field helpers
  const set = useCallback((key: FieldKey, value: string | boolean) => {
    setFields((f) => ({ ...f, [key]: value }));
    setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
    setApiError(null);
  }, []);

  // Navigation between steps
  const goNext = () => {
    const errs = validateStep(step, fields);
    if (hasErrors(errs)) { setErrors(errs); return; }
    setErrors({});
    setStep((s) => (s < 3 ? ((s + 1) as Step) : s));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setErrors({});
    setApiError(null);
    setStep((s) => (s > 1 ? ((s - 1) as Step) : s));
  };

  // Final submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateStep(3, fields);
    if (hasErrors(errs)) { setErrors(errs); return; }

    setIsLoading(true);
    setApiError(null);

    try {
      const res = await authApi.signup({
        fullName: fields.fullName.trim(),
        email: fields.email.trim().toLowerCase(),
        phone: fields.phone.replace(/\D/g, ""),
        password: fields.password,
        organizationName: fields.organizationName.trim(),
        role: fields.role,
        agreedToTerms: fields.agreedToTerms,
      });

      const { user, tokens } = res.data as AuthResponse;
      tokenStorage.set(tokens.accessToken);
      tokenStorage.setRefresh(tokens.refreshToken);

      setDoneUser({ name: user.fullName.split(" ")[0], org: user.organizationName });
      setDone(true);
    } catch (err) {
      if (err instanceof SushrushApiError) {
        if (err.status === 409) {
          // Email already exists — go back to step 1
          setErrors({ email: "An account with this email already exists." });
          setStep(1);
        } else if (err.field && err.field in fields) {
          setErrors({ [err.field as FieldKey]: err.message });
        } else {
          setApiError(err.message);
        }
      } else {
        setApiError("Unable to create account. Please try again.");
      }
    } finally {
      setIsLoading(false);
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

          {/* Content */}
          <div>
            <div style={{ fontSize: "clamp(1.625rem, 3vw, 2.25rem)", fontWeight: 800, lineHeight: 1.2, marginBottom: "1rem", letterSpacing: "-0.025em" }}>
              Start managing your pharmacy smarter today
            </div>
            <p style={{ fontSize: "1.0625rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.7, marginBottom: "2rem" }}>
              14-day free trial. No credit card. Cancel anytime.
            </p>

            {/* What you get */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {[
                { icon: "✓", text: "Smart POS with GST-compliant invoicing" },
                { icon: "✓", text: "Full inventory & expiry tracking" },
                { icon: "✓", text: "Multi-branch management dashboard" },
                { icon: "✓", text: "Your own branded online store" },
                { icon: "✓", text: "Role-based access control" },
                { icon: "✓", text: "Real-time analytics & reports" },
                { icon: "✓", text: "Free data migration & onboarding" },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.9375rem" }}>
                  <div style={{ width: "1.5rem", height: "1.5rem", borderRadius: "50%", background: "rgba(74,222,128,0.2)", border: "1px solid rgba(74,222,128,0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "0.6875rem", color: "#4ade80", fontWeight: 800 }}>
                    {icon}
                  </div>
                  <span style={{ color: "rgba(255,255,255,0.85)" }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Social proof */}
          <div style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "var(--radius-xl)", padding: "1rem 1.25rem", display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <div style={{ display: "flex" }}>
              {["RP", "SR", "KN", "MA"].map((av, i) => (
                <div key={av} style={{ width: 32, height: 32, borderRadius: "50%", background: `hsl(${i * 30 + 180}, 60%, 35%)`, border: "2px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6875rem", fontWeight: 700, color: "white", marginLeft: i ? "-8px" : 0 }}>
                  {av}
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: "0.875rem", fontWeight: 700 }}>500+ pharmacies</div>
              <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.65)" }}>already using Sushrusha</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Right panel ────────────────────────────────────────────── */}
      <div className="auth-panel" style={{ background: "var(--color-bg)", overflowY: "auto", alignItems: "flex-start", paddingTop: "3rem", paddingBottom: "3rem" }}>
        <div className="auth-form-card animate-fade-in" style={{ maxWidth: "28rem" }}>
          {done ? (
            <SuccessScreen name={doneUser.name} org={doneUser.org} />
          ) : (
            <>
              {/* Mobile logo */}
              <Link href="/" style={{ display: "none", alignItems: "center", gap: "0.5rem", textDecoration: "none", marginBottom: "1.5rem" }} className="mobile-only-logo">
                <div style={{ width: "2rem", height: "2rem", borderRadius: "var(--radius-md)", background: "linear-gradient(135deg, var(--teal-600), var(--teal-900))", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                </div>
                <span style={{ fontWeight: 800, fontSize: "1.0625rem", letterSpacing: "-0.02em", color: "var(--slate-900)" }}>Sushrusha</span>
              </Link>

              {/* Header */}
              <div style={{ marginBottom: "1.75rem" }}>
                <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: "var(--slate-900)", margin: "0 0 0.25rem", letterSpacing: "-0.025em" }}>
                  Create your account
                </h1>
                <p style={{ fontSize: "0.9375rem", color: "var(--color-muted)", margin: 0 }}>
                  14-day free trial · No credit card required
                </p>
              </div>

              {/* Progress steps */}
              <div style={{ marginBottom: "2rem" }}>
                <div className="step-list">
                  {STEP_LABELS.map((label, i) => {
                    const s = (i + 1) as Step;
                    const cls = s < step ? "completed" : s === step ? "active" : "";
                    return (
                      <div key={label} className={`step-item ${cls}`}>
                        <div className="step-circle">
                          {s < step ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                          ) : s}
                        </div>
                        <span className="step-label">{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* API error */}
              {apiError && (
                <div className="alert alert-error" role="alert" style={{ marginBottom: "1.25rem" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span style={{ flex: 1, fontSize: "0.875rem" }}>{apiError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate aria-label="Signup form">

                {/* ── STEP 1: Personal info ──────────────────────── */}
                {step === 1 && (
                  <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
                    {/* Full name */}
                    <div className="form-group">
                      <label htmlFor="signup-name" className="form-label">Full name <span className="required">*</span></label>
                      <div className="input-wrapper">
                        <span className="input-icon-left" aria-hidden="true">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        </span>
                        <input
                          id="signup-name"
                          type="text"
                          autoComplete="name"
                          placeholder="Dr. Ramesh Patel"
                          value={fields.fullName}
                          onChange={(e) => set("fullName", e.target.value)}
                          onBlur={() => { if (fields.fullName) { const e = validateFullName(fields.fullName); if (e) setErrors((p) => ({ ...p, fullName: e })); } }}
                          className={`form-input has-left-icon${errors.fullName ? " is-error" : ""}`}
                          aria-describedby={errors.fullName ? "signup-name-error" : undefined}
                          aria-invalid={!!errors.fullName}
                        />
                      </div>
                      {errors.fullName && <span id="signup-name-error" className="form-error" role="alert"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{errors.fullName}</span>}
                    </div>

                    {/* Email */}
                    <div className="form-group">
                      <label htmlFor="signup-email" className="form-label">Email address <span className="required">*</span></label>
                      <div className="input-wrapper">
                        <span className="input-icon-left" aria-hidden="true">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        </span>
                        <input
                          id="signup-email"
                          type="email"
                          autoComplete="email"
                          placeholder="you@example.com"
                          value={fields.email}
                          onChange={(e) => set("email", e.target.value)}
                          onBlur={() => { if (fields.email) { const e = validateEmail(fields.email); if (e) setErrors((p) => ({ ...p, email: e })); } }}
                          className={`form-input has-left-icon${errors.email ? " is-error" : ""}`}
                          aria-describedby={errors.email ? "signup-email-error" : undefined}
                          aria-invalid={!!errors.email}
                        />
                      </div>
                      {errors.email && <span id="signup-email-error" className="form-error" role="alert"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{errors.email}</span>}
                    </div>

                    {/* Phone */}
                    <div className="form-group">
                      <label htmlFor="signup-phone" className="form-label">Mobile number <span className="required">*</span></label>
                      <div className="input-wrapper">
                        <span className="input-icon-left" aria-hidden="true" style={{ left: "0.875rem" }}>
                          <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-muted)", whiteSpace: "nowrap" }}>🇮🇳 +91</span>
                        </span>
                        <input
                          id="signup-phone"
                          type="tel"
                          inputMode="numeric"
                          autoComplete="tel"
                          placeholder="98765 43210"
                          value={fields.phone}
                          onChange={(e) => set("phone", e.target.value.replace(/[^\d\s-]/g, ""))}
                          onBlur={() => { if (fields.phone) { const e = validatePhone(fields.phone); if (e) setErrors((p) => ({ ...p, phone: e })); } }}
                          className={`form-input${errors.phone ? " is-error" : ""}`}
                          style={{ paddingLeft: "4.5rem" }}
                          aria-describedby={errors.phone ? "signup-phone-error" : undefined}
                          aria-invalid={!!errors.phone}
                          maxLength={14}
                        />
                      </div>
                      {errors.phone && <span id="signup-phone-error" className="form-error" role="alert"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{errors.phone}</span>}
                    </div>

                    {/* Password */}
                    <div className="form-group">
                      <label htmlFor="signup-password" className="form-label">Password <span className="required">*</span></label>
                      <div className="input-wrapper">
                        <span className="input-icon-left" aria-hidden="true">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        </span>
                        <input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="Min. 8 chars, upper, lower, number, symbol"
                          value={fields.password}
                          onChange={(e) => set("password", e.target.value)}
                          onBlur={() => { if (fields.password) { const e = validatePassword(fields.password); if (e) setErrors((p) => ({ ...p, password: e })); } }}
                          className={`form-input has-left-icon has-right-icon${errors.password ? " is-error" : ""}`}
                          aria-describedby="signup-password-strength"
                          aria-invalid={!!errors.password}
                        />
                        <button type="button" className="input-icon-right" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Hide" : "Show"} style={{ background: "none", border: "none", padding: "0.25rem", cursor: "pointer", color: "var(--color-subtle)", borderRadius: "var(--radius-sm)" }}>
                          {showPassword ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                        </button>
                      </div>

                      {/* Strength meter */}
                      {fields.password && (
                        <div id="signup-password-strength" aria-live="polite">
                          <div className={`password-strength strength-${strength.level}`}>
                            {[1, 2, 3, 4].map((n) => <div key={n} className="password-strength-bar"/>)}
                          </div>
                          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: strength.color, marginTop: "0.25rem" }}>
                            {strength.label} password
                          </div>
                        </div>
                      )}
                      {errors.password && <span className="form-error" role="alert"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{errors.password}</span>}
                    </div>

                    {/* Confirm password */}
                    <div className="form-group">
                      <label htmlFor="signup-confirm" className="form-label">Confirm password <span className="required">*</span></label>
                      <div className="input-wrapper">
                        <span className="input-icon-left" aria-hidden="true">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        </span>
                        <input
                          id="signup-confirm"
                          type={showConfirm ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="Re-enter your password"
                          value={fields.confirm}
                          onChange={(e) => set("confirm", e.target.value)}
                          onBlur={() => { if (fields.confirm) { const e = validateConfirmPassword(fields.password, fields.confirm); if (e) setErrors((p) => ({ ...p, confirm: e })); } }}
                          className={`form-input has-left-icon has-right-icon${errors.confirm ? " is-error" : ""}`}
                          aria-describedby={errors.confirm ? "signup-confirm-error" : undefined}
                          aria-invalid={!!errors.confirm}
                        />
                        <button type="button" className="input-icon-right" onClick={() => setShowConfirm((v) => !v)} aria-label={showConfirm ? "Hide" : "Show"} style={{ background: "none", border: "none", padding: "0.25rem", cursor: "pointer", color: "var(--color-subtle)", borderRadius: "var(--radius-sm)" }}>
                          {showConfirm ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                        </button>
                      </div>
                      {errors.confirm && <span id="signup-confirm-error" className="form-error" role="alert"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{errors.confirm}</span>}
                    </div>
                  </div>
                )}

                {/* ── STEP 2: Pharmacy info ──────────────────────── */}
                {step === 2 && (
                  <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    {/* Org name */}
                    <div className="form-group">
                      <label htmlFor="signup-org" className="form-label">Pharmacy / organization name <span className="required">*</span></label>
                      <div className="input-wrapper">
                        <span className="input-icon-left" aria-hidden="true">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                        </span>
                        <input
                          id="signup-org"
                          type="text"
                          autoComplete="organization"
                          placeholder="Patel Medicals"
                          value={fields.organizationName}
                          onChange={(e) => set("organizationName", e.target.value)}
                          onBlur={() => { if (fields.organizationName) { const e = validateOrganizationName(fields.organizationName); if (e) setErrors((p) => ({ ...p, organizationName: e })); } }}
                          className={`form-input has-left-icon${errors.organizationName ? " is-error" : ""}`}
                          aria-describedby={errors.organizationName ? "signup-org-error" : "signup-org-hint"}
                          aria-invalid={!!errors.organizationName}
                        />
                      </div>
                      {errors.organizationName
                        ? <span id="signup-org-error" className="form-error" role="alert"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{errors.organizationName}</span>
                        : <span id="signup-org-hint" className="form-hint"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>This will be your workspace name visible to your team.</span>}
                    </div>

                    {/* Role */}
                    <div className="form-group">
                      <label className="form-label">Your role <span className="required">*</span></label>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }} role="radiogroup" aria-label="Select your role">
                        {ROLE_OPTIONS.map(({ value, label, desc, icon }) => (
                          <label
                            key={value}
                            htmlFor={`signup-role-${value}`}
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "0.875rem",
                              padding: "0.875rem 1rem",
                              border: `1.5px solid ${fields.role === value ? "var(--color-primary)" : "var(--color-border)"}`,
                              borderRadius: "var(--radius-lg)",
                              cursor: "pointer",
                              background: fields.role === value ? "var(--teal-50)" : "white",
                              transition: "all var(--duration-base) var(--ease-smooth)",
                            }}
                          >
                            <input
                              id={`signup-role-${value}`}
                              type="radio"
                              name="role"
                              value={value}
                              checked={fields.role === value}
                              onChange={() => set("role", value)}
                              className="sr-only"
                            />
                            <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "var(--radius-lg)", background: fields.role === value ? "var(--teal-600)" : "var(--slate-100)", color: fields.role === value ? "white" : "var(--color-muted)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all var(--duration-base) var(--ease-smooth)" }}>
                              {icon}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--slate-900)", marginBottom: "0.125rem" }}>{label}</div>
                              <div style={{ fontSize: "0.8125rem", color: "var(--color-muted)", lineHeight: 1.5 }}>{desc}</div>
                            </div>
                            {fields.role === value && (
                              <div style={{ marginLeft: "auto", color: "var(--teal-600)", flexShrink: 0 }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                              </div>
                            )}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Context info */}
                    <div style={{ background: "var(--slate-50)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "0.875rem 1rem", display: "flex", gap: "0.625rem", alignItems: "flex-start" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      <p style={{ fontSize: "0.8125rem", color: "var(--color-muted)", margin: 0, lineHeight: 1.5 }}>
                        You can add more branches and invite team members after account setup. Permissions can be adjusted at any time.
                      </p>
                    </div>
                  </div>
                )}

                {/* ── STEP 3: Review & confirm ──────────────────── */}
                {step === 3 && (
                  <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    {/* Summary */}
                    <div style={{ background: "var(--teal-50)", border: "1px solid var(--teal-200)", borderRadius: "var(--radius-xl)", padding: "1.125rem 1.25rem" }}>
                      <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--teal-700)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>Account summary</div>
                      <dl style={{ margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {[
                          { label: "Name", value: fields.fullName },
                          { label: "Email", value: fields.email },
                          { label: "Phone", value: `+91 ${fields.phone}` },
                          { label: "Pharmacy", value: fields.organizationName },
                          { label: "Role", value: ROLE_OPTIONS.find((r) => r.value === fields.role)?.label ?? fields.role },
                        ].map(({ label, value }) => (
                          <div key={label} style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                            <dt style={{ fontSize: "0.8125rem", color: "var(--teal-600)", fontWeight: 600, minWidth: "5rem" }}>{label}</dt>
                            <dd style={{ fontSize: "0.9375rem", color: "var(--slate-800)", fontWeight: 500, margin: 0, wordBreak: "break-all" }}>{value}</dd>
                          </div>
                        ))}
                      </dl>
                      <button
                        type="button"
                        id="signup-edit-btn"
                        onClick={() => setStep(1)}
                        style={{ display: "flex", alignItems: "center", gap: "0.375rem", background: "none", border: "none", padding: 0, fontSize: "0.8125rem", fontWeight: 600, color: "var(--teal-700)", cursor: "pointer", marginTop: "0.875rem" }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Edit details
                      </button>
                    </div>

                    {/* Terms */}
                    <div>
                      <label
                        htmlFor="signup-terms"
                        style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", cursor: "pointer", padding: "0.875rem 1rem", background: "white", border: `1.5px solid ${errors.agreedToTerms ? "var(--color-error)" : "var(--color-border)"}`, borderRadius: "var(--radius-lg)", transition: "border-color var(--duration-base)" }}
                      >
                        <input
                          id="signup-terms"
                          type="checkbox"
                          checked={fields.agreedToTerms}
                          onChange={(e) => set("agreedToTerms", e.target.checked)}
                          className="form-checkbox"
                          style={{ marginTop: "0.125rem" }}
                          aria-describedby={errors.agreedToTerms ? "signup-terms-error" : undefined}
                          aria-invalid={!!errors.agreedToTerms}
                        />
                        <span style={{ fontSize: "0.875rem", color: "var(--slate-700)", lineHeight: 1.6 }}>
                          I agree to Sushrusha&apos;s{" "}
                          <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-primary)", fontWeight: 600 }}>Terms of Service</a>
                          {" "}and{" "}
                          <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-primary)", fontWeight: 600 }}>Privacy Policy</a>.
                          I understand that my pharmacy data will be stored securely.
                        </span>
                      </label>
                      {errors.agreedToTerms && (
                        <span id="signup-terms-error" className="form-error" role="alert" style={{ marginTop: "0.375rem" }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                          {errors.agreedToTerms}
                        </span>
                      )}
                    </div>

                    {/* Security note */}
                    <div style={{ background: "var(--slate-50)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "0.875rem 1rem", display: "flex", gap: "0.625rem" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      <p style={{ fontSize: "0.8125rem", color: "var(--color-muted)", margin: 0, lineHeight: 1.5 }}>
                        Your data is encrypted with AES-256 and never shared with third parties. HIPAA and ISO 27001 compliant.
                      </p>
                    </div>
                  </div>
                )}

                {/* Navigation buttons */}
                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
                  {step > 1 && (
                    <button
                      type="button"
                      id="signup-back-btn"
                      onClick={goBack}
                      className="btn btn-outline btn-lg"
                      style={{ flex: "0 0 auto" }}
                      disabled={isLoading}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                      Back
                    </button>
                  )}

                  {step < 3 ? (
                    <button
                      type="button"
                      id={`signup-next-step-${step}-btn`}
                      onClick={goNext}
                      className="btn btn-primary btn-lg"
                      style={{ flex: 1, justifyContent: "center" }}
                    >
                      Continue
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                  ) : (
                    <button
                      id="signup-submit-btn"
                      type="submit"
                      className={`btn btn-primary btn-lg${isLoading ? " btn-loading" : ""}`}
                      style={{ flex: 1, justifyContent: "center" }}
                      disabled={isLoading}
                      aria-busy={isLoading}
                    >
                      {isLoading ? "Creating account…" : "Create Account"}
                      {!isLoading && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>}
                    </button>
                  )}
                </div>
              </form>

              {/* Login link */}
              <p style={{ textAlign: "center", fontSize: "0.9375rem", color: "var(--color-muted)", marginTop: "1.5rem", marginBottom: 0 }}>
                Already have an account?{" "}
                <Link href="/login" id="signup-login-link" style={{ color: "var(--color-primary)", fontWeight: 700, textDecoration: "none" }}>
                  Log in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .mobile-only-logo { display: flex !important; } }
      `}</style>
    </div>
  );
}

export default function SignupForm() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-bg)" }}>
        <div style={{ width: 40, height: 40, border: "3px solid var(--teal-100)", borderTop: "3px solid var(--teal-600)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}/>
      </div>
    }>
      <SignupFormInner />
    </Suspense>
  );
}
