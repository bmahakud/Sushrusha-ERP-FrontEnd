/**
 * Sushrusha API Client
 * Production-grade fetch wrapper with typed responses, error normalization,
 * and auth token management.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.sushrusha.com/v1";
const REQUEST_TIMEOUT_MS = 15_000;

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  field?: string; // for field-level validation errors
  details?: Record<string, string[]>;
}

export class SushrushApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly field?: string,
    public readonly details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "SushrushApiError";
  }
}

// ─── Auth token storage ──────────────────────────────────────────────────────

const TOKEN_KEY = "sushrusha_access_token";
const REFRESH_KEY = "sushrusha_refresh_token";

export const tokenStorage = {
  get: (): string | null =>
    typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null,

  set: (token: string): void => {
    if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, token);
  },

  getRefresh: (): string | null =>
    typeof window !== "undefined" ? localStorage.getItem(REFRESH_KEY) : null,

  setRefresh: (token: string): void => {
    if (typeof window !== "undefined") localStorage.setItem(REFRESH_KEY, token);
  },

  clear: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_KEY);
    }
  },
};

// ─── Core fetch wrapper ──────────────────────────────────────────────────────

async function request<T>(
  endpoint: string,
  options: RequestInit & { skipAuth?: boolean } = {},
): Promise<ApiResponse<T>> {
  const { skipAuth = false, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Client-Version": "1.0.0",
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (!skipAuth) {
    const token = tokenStorage.get();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    // Handle 204 No Content
    if (res.status === 204) {
      return { data: undefined as T, success: true };
    }

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      const err: ApiError = json.error ?? json;
      throw new SushrushApiError(
        err.code ?? `HTTP_${res.status}`,
        err.message ?? humanizeStatus(res.status),
        res.status,
        err.field,
        err.details,
      );
    }

    return json as ApiResponse<T>;
  } catch (err) {
    clearTimeout(timeout);

    if (err instanceof SushrushApiError) throw err;

    if ((err as Error).name === "AbortError") {
      throw new SushrushApiError(
        "REQUEST_TIMEOUT",
        "The request timed out. Please check your connection and try again.",
        408,
      );
    }

    throw new SushrushApiError(
      "NETWORK_ERROR",
      "Unable to reach the server. Please check your internet connection.",
      0,
    );
  }
}

function humanizeStatus(status: number): string {
  const map: Record<number, string> = {
    400: "Invalid request. Please check your input.",
    401: "Your session has expired. Please log in again.",
    403: "You don't have permission to perform this action.",
    404: "The requested resource was not found.",
    409: "A conflict occurred. The resource may already exist.",
    422: "Validation failed. Please check your input.",
    429: "Too many requests. Please wait a moment and try again.",
    500: "An unexpected server error occurred. Please try again.",
    502: "Service temporarily unavailable. Please try again shortly.",
    503: "Service is under maintenance. Please try again later.",
  };
  return map[status] ?? "An unexpected error occurred.";
}

// ─── Auth API ────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  organizationName: string;
  role: "owner" | "pharmacist" | "staff";
  agreedToTerms: boolean;
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  organizationId: string;
  organizationName: string;
  branchId?: string;
  branchName?: string;
  avatarUrl?: string;
  isEmailVerified: boolean;
  permissions: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export const authApi = {
  login: (payload: LoginRequest) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuth: true,
    }),

  signup: (payload: SignupRequest) =>
    request<AuthResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuth: true,
    }),

  refreshToken: (refreshToken: string) =>
    request<AuthTokens>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
      skipAuth: true,
    }),

  forgotPassword: (email: string) =>
    request<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
      skipAuth: true,
    }),

  logout: () =>
    request<void>("/auth/logout", { method: "POST" }),

  verifyEmail: (token: string) =>
    request<AuthUser>(`/auth/verify-email/${token}`, {
      method: "POST",
      skipAuth: true,
    }),

  me: () => request<AuthUser>("/auth/me"),
};
