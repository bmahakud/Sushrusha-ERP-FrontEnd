/**
 * Client-side validation utilities
 * Mirrors backend rules — always validate server-side too.
 */

// ─── Regex ───────────────────────────────────────────────────────────────────

const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const PHONE_IN_RE = /^[6-9]\d{9}$/;           // Indian mobile
const FULL_NAME_RE = /^[a-zA-Z\s'.]{2,80}$/;
const ORG_NAME_RE  = /^[a-zA-Z0-9\s'.,&\-()+]{2,100}$/;

// ─── Validators ─────────────────────────────────────────────────────────────

export function validateEmail(value: string): string | null {
  if (!value.trim()) return "Email address is required.";
  if (!EMAIL_RE.test(value)) return "Please enter a valid email address.";
  return null;
}

export function validatePhone(value: string): string | null {
  const cleaned = value.replace(/\D/g, "");
  if (!cleaned) return "Phone number is required.";
  if (!PHONE_IN_RE.test(cleaned)) return "Please enter a valid 10-digit Indian mobile number.";
  return null;
}

export function validateFullName(value: string): string | null {
  if (!value.trim()) return "Full name is required.";
  if (value.trim().length < 2) return "Name must be at least 2 characters.";
  if (!FULL_NAME_RE.test(value.trim())) return "Name contains invalid characters.";
  return null;
}

export function validateOrganizationName(value: string): string | null {
  if (!value.trim()) return "Organization / pharmacy name is required.";
  if (value.trim().length < 2) return "Name must be at least 2 characters.";
  if (!ORG_NAME_RE.test(value.trim())) return "Name contains invalid characters.";
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) return "Password is required.";
  if (value.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(value)) return "Password must contain at least one uppercase letter.";
  if (!/[a-z]/.test(value)) return "Password must contain at least one lowercase letter.";
  if (!/\d/.test(value)) return "Password must contain at least one number.";
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value))
    return "Password must contain at least one special character.";
  return null;
}

export function validateLoginPassword(value: string): string | null {
  if (!value) return "Password is required.";
  return null;
}

export function validateConfirmPassword(password: string, confirm: string): string | null {
  if (!confirm) return "Please confirm your password.";
  if (password !== confirm) return "Passwords do not match.";
  return null;
}

export function validateTerms(checked: boolean): string | null {
  if (!checked) return "You must accept the terms and privacy policy to continue.";
  return null;
}

// ─── Password strength ───────────────────────────────────────────────────────

export type PasswordStrength = "empty" | "weak" | "fair" | "good" | "strong";

export interface StrengthResult {
  level: PasswordStrength;
  score: number;   // 0–4
  label: string;
  color: string;
}

export function getPasswordStrength(password: string): StrengthResult {
  if (!password) return { level: "empty", score: 0, label: "", color: "" };

  let score = 0;
  if (password.length >= 8)  score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;

  const normalized = Math.min(score, 4);

  const map: Record<number, Omit<StrengthResult, "score">> = {
    0: { level: "weak",   label: "Weak",   color: "#dc2626" },
    1: { level: "weak",   label: "Weak",   color: "#dc2626" },
    2: { level: "fair",   label: "Fair",   color: "#d97706" },
    3: { level: "good",   label: "Good",   color: "#2dd4bf" },
    4: { level: "strong", label: "Strong", color: "#059669" },
  };

  return { score: normalized, ...map[normalized] };
}

// ─── Form error map ───────────────────────────────────────────────────────────

export type FormErrors<T extends string> = Partial<Record<T, string>>;

export function hasErrors<T extends string>(errors: FormErrors<T>): boolean {
  return Object.values(errors).some(Boolean);
}
