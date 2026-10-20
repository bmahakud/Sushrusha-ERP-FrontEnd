/**
 * Role → workspace configuration.
 *
 * This only decides which dashboard UI a role sees. It is NOT an authorization
 * boundary: every protected operation must still be checked server-side
 * (see docs/PERSONAS_AND_ROLES.md). Navigation items without an `href` point to
 * modules that are planned but not built yet and render as unavailable.
 */

export type RoleKey =
  | "owner"
  | "manager"
  | "pharmacist"
  | "cashier"
  | "inventory"
  | "accountant"
  | "platform-admin";

/** Where a role's data comes from: the whole organization, one active store, or platform metadata. */
export type RoleScope = "organization" | "store" | "platform";

export type NavIcon =
  | "dashboard" | "store" | "users" | "reports" | "settings" | "audit"
  | "pos" | "held" | "history" | "returns" | "shift"
  | "prescriptions" | "dispense" | "register" | "customers" | "stock"
  | "products" | "purchase" | "grn" | "suppliers" | "adjust" | "alerts"
  | "tax" | "payables" | "receivables" | "expenses"
  | "organizations" | "support" | "announce";

export interface NavItem {
  label: string;
  icon: NavIcon;
  /** Present only for screens that exist. Missing → planned module. */
  href?: string;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export interface RoleConfig {
  key: RoleKey;
  label: string;
  /** One-line summary shown on the workspace chooser. */
  summary: string;
  scope: RoleScope;
  home: string;
  nav: NavSection[];
}

export const ROLES: Record<RoleKey, RoleConfig> = {
  owner: {
    key: "owner",
    label: "Organization Owner",
    summary: "Organization-wide view of branches, sales, stock alerts, staff and audit activity.",
    scope: "organization",
    home: "/dashboard/owner",
    nav: [
      { items: [{ label: "Dashboard", icon: "dashboard", href: "/dashboard/owner" }] },
      {
        title: "Organization",
        items: [
          { label: "Store Management", icon: "store" },
          { label: "Staff & Access", icon: "users" },
          { label: "Reports", icon: "reports" },
        ],
      },
      {
        title: "Governance",
        items: [
          { label: "Audit & Permissions", icon: "audit" },
          { label: "Organization Settings", icon: "settings" },
        ],
      },
    ],
  },
  manager: {
    key: "manager",
    label: "Store Manager",
    summary: "Run assigned stores: shift reviews, approvals, stock alerts and the store team.",
    scope: "store",
    home: "/dashboard/manager",
    nav: [
      { items: [{ label: "Dashboard", icon: "dashboard", href: "/dashboard/manager" }] },
      {
        title: "Operations",
        items: [
          { label: "Point of Sale", icon: "pos" },
          { label: "Shifts", icon: "shift" },
          { label: "Returns & Refunds", icon: "returns" },
          { label: "Inventory", icon: "stock" },
          { label: "Purchasing", icon: "purchase" },
        ],
      },
      {
        title: "Store",
        items: [
          { label: "Staff", icon: "users" },
          { label: "Reports", icon: "reports" },
        ],
      },
    ],
  },
  cashier: {
    key: "cashier",
    label: "Cashier",
    summary: "Billing counter: current shift, held bills, own sales and quick checkout.",
    scope: "store",
    home: "/dashboard/cashier",
    nav: [
      { items: [{ label: "Dashboard", icon: "dashboard", href: "/dashboard/cashier" }] },
      {
        title: "Counter",
        items: [
          { label: "New Bill", icon: "pos" },
          { label: "Held Bills", icon: "held" },
          { label: "My Sales", icon: "history" },
          { label: "Return Request", icon: "returns" },
          { label: "My Shift", icon: "shift" },
        ],
      },
    ],
  },
  pharmacist: {
    key: "pharmacist",
    label: "Pharmacist",
    summary: "Prescription review queue, dispensing sign-off and the scheduled-drug register.",
    scope: "store",
    home: "/dashboard/pharmacist",
    nav: [
      { items: [{ label: "Dashboard", icon: "dashboard", href: "/dashboard/pharmacist" }] },
      {
        title: "Clinical",
        items: [
          { label: "Prescription Queue", icon: "prescriptions" },
          { label: "Dispensing", icon: "dispense" },
          { label: "Drug Register", icon: "register" },
          { label: "Customers", icon: "customers" },
          { label: "Stock Lookup", icon: "stock" },
        ],
      },
    ],
  },
  inventory: {
    key: "inventory",
    label: "Inventory & Purchase",
    summary: "Batches, expiry, low stock, purchase orders and goods receipt.",
    scope: "store",
    home: "/dashboard/inventory",
    nav: [
      { items: [{ label: "Dashboard", icon: "dashboard", href: "/dashboard/inventory" }] },
      {
        title: "Stock",
        items: [
          { label: "Products", icon: "products" },
          { label: "Stock & Batches", icon: "stock" },
          { label: "Adjustments", icon: "adjust" },
          { label: "Alerts", icon: "alerts" },
        ],
      },
      {
        title: "Purchasing",
        items: [
          { label: "Purchase Orders", icon: "purchase" },
          { label: "Goods Receipt", icon: "grn" },
          { label: "Suppliers", icon: "suppliers" },
        ],
      },
    ],
  },
  accountant: {
    key: "accountant",
    label: "Accountant",
    summary: "Sales and tax summaries, payables, receivables and shift reconciliation.",
    scope: "store",
    home: "/dashboard/accountant",
    nav: [
      { items: [{ label: "Dashboard", icon: "dashboard", href: "/dashboard/accountant" }] },
      {
        title: "Finance",
        items: [
          { label: "Sales & Tax", icon: "tax" },
          { label: "Payables", icon: "payables" },
          { label: "Receivables", icon: "receivables" },
          { label: "Expenses", icon: "expenses" },
          { label: "Reports", icon: "reports" },
        ],
      },
    ],
  },
  "platform-admin": {
    key: "platform-admin",
    label: "Platform Administrator",
    summary: "Tenant status, consented support access and platform health — no business data by default.",
    scope: "platform",
    home: "/dashboard/admin",
    nav: [
      { items: [{ label: "Dashboard", icon: "dashboard", href: "/dashboard/admin" }] },
      {
        title: "Platform",
        items: [
          { label: "Organizations", icon: "organizations" },
          { label: "Support Access", icon: "support" },
          { label: "Announcements", icon: "announce" },
          { label: "Platform Audit Log", icon: "audit" },
        ],
      },
    ],
  },
};

export const ROLE_ORDER: RoleKey[] = [
  "owner", "manager", "cashier", "pharmacist", "inventory", "accountant", "platform-admin",
];

/**
 * Maps a backend role string to a workspace. The backend role vocabulary is not
 * finalized (docs/API_CONTRACTS.md), so unknown values fall back to the chooser.
 * Store-scoped roles go through store selection first (workflow spec §4.3).
 */
export function postLoginPath(role: string | undefined): string {
  const normalized = (role ?? "").toLowerCase().replace(/[\s_]+/g, "-");
  const aliases: Record<string, RoleKey> = {
    owner: "owner",
    "organization-owner": "owner",
    "store-manager": "manager",
    manager: "manager",
    cashier: "cashier",
    salesperson: "cashier",
    pharmacist: "pharmacist",
    inventory: "inventory",
    "inventory-staff": "inventory",
    "purchase-staff": "inventory",
    accountant: "accountant",
    "platform-admin": "platform-admin",
    "platform-administrator": "platform-admin",
  };
  const key = aliases[normalized];
  if (!key) return "/dashboard";
  return ROLES[key].scope === "store" ? `/select-store?role=${key}` : ROLES[key].home;
}
