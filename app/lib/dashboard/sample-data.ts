/**
 * SAMPLE DATA — layout preview only.
 *
 * No backend API is approved yet (docs/API_CONTRACTS.md), so every dashboard is
 * rendered from these fixed, fictional figures and the UI labels them as
 * preview data. Replace each export with a typed API call once the contract is
 * defined. Money values are integer paise.
 */

import type { Paise } from "./format";

// ─── Shared context ─────────────────────────────────────────────────────────

export type StoreStatus = "active" | "setup-pending" | "inactive";

export interface StoreSummary {
  id: string;
  name: string;
  code: string;
  city: string;
  status: StoreStatus;
  manager: string | null;
}

export const SAMPLE_ORG = { name: "Arogya Medicals", plan: "Preview" };

export const SAMPLE_STORES: StoreSummary[] = [
  { id: "s1", name: "Saheed Nagar", code: "BBS-01", city: "Bhubaneswar", status: "active", manager: "Ananya Mishra" },
  { id: "s2", name: "Patia", code: "BBS-02", city: "Bhubaneswar", status: "active", manager: "Rakesh Das" },
  { id: "s3", name: "Link Road", code: "CTC-01", city: "Cuttack", status: "active", manager: "Ananya Mishra" },
  { id: "s4", name: "Grand Road", code: "PUR-01", city: "Puri", status: "setup-pending", manager: null },
];

export interface SampleUser {
  name: string;
  initials: string;
  email: string;
  /** Stores this user is assigned to (employees). Owners see all. */
  storeIds: string[];
}

export const SAMPLE_USERS: Record<string, SampleUser> = {
  owner: { name: "Sanjay Mohanty", initials: "SM", email: "owner@example.com", storeIds: ["s1", "s2", "s3", "s4"] },
  manager: { name: "Ananya Mishra", initials: "AM", email: "manager@example.com", storeIds: ["s1", "s3"] },
  cashier: { name: "Priya Nayak", initials: "PN", email: "cashier@example.com", storeIds: ["s1"] },
  pharmacist: { name: "Dr. Kiran Sahoo", initials: "KS", email: "pharmacist@example.com", storeIds: ["s1", "s2"] },
  inventory: { name: "Manoj Behera", initials: "MB", email: "inventory@example.com", storeIds: ["s1"] },
  accountant: { name: "Ritu Panda", initials: "RP", email: "accounts@example.com", storeIds: ["s1", "s2", "s3"] },
  "platform-admin": { name: "Support Desk", initials: "SD", email: "admin@example.com", storeIds: [] },
};

export interface TrendPoint { label: string; value: number }

export type AlertSeverity = "critical" | "warning" | "info";
export interface Notification { id: string; title: string; detail: string; time: string; severity: AlertSeverity }

// ─── Owner ──────────────────────────────────────────────────────────────────

export type Period = "today" | "7d" | "30d";

export interface BranchPerformance {
  storeId: string;
  sales: Paise;
  bills: number;
  deltaPct: number;
  lowStock: number;
  nearExpiry: number;
}

export const OWNER_DATA = {
  kpis: {
    stores: { total: 4, active: 3, setupPending: 1 },
    salesToday: 31842650 as Paise,
    salesDeltaPct: 8.4,
    billsToday: 412,
    lowStock: 37,
    nearExpiry: 22,
    blockedBatches: 6,
  },
  salesTrend: [
    { label: "21 Sep", value: 24100000 }, { label: "24 Sep", value: 25800000 }, { label: "27 Sep", value: 24900000 },
    { label: "30 Sep", value: 27600000 }, { label: "3 Oct", value: 26900000 }, { label: "6 Oct", value: 29100000 },
    { label: "9 Oct", value: 28500000 }, { label: "12 Oct", value: 30200000 }, { label: "15 Oct", value: 29600000 },
    { label: "18 Oct", value: 31100000 }, { label: "20 Oct", value: 31842650 },
  ] as TrendPoint[],
  branchPerformance: {
    today: [
      { storeId: "s1", sales: 13420500, bills: 168, deltaPct: 11.2, lowStock: 9, nearExpiry: 6 },
      { storeId: "s2", sales: 9876150, bills: 131, deltaPct: 4.1, lowStock: 14, nearExpiry: 9 },
      { storeId: "s3", sales: 8546000, bills: 113, deltaPct: -2.6, lowStock: 14, nearExpiry: 7 },
      { storeId: "s4", sales: 0, bills: 0, deltaPct: 0, lowStock: 0, nearExpiry: 0 },
    ],
    "7d": [
      { storeId: "s1", sales: 89214000, bills: 1104, deltaPct: 6.8, lowStock: 9, nearExpiry: 6 },
      { storeId: "s2", sales: 66310450, bills: 879, deltaPct: 3.2, lowStock: 14, nearExpiry: 9 },
      { storeId: "s3", sales: 58440900, bills: 765, deltaPct: 1.4, lowStock: 14, nearExpiry: 7 },
      { storeId: "s4", sales: 0, bills: 0, deltaPct: 0, lowStock: 0, nearExpiry: 0 },
    ],
    "30d": [
      { storeId: "s1", sales: 371820000, bills: 4688, deltaPct: 9.1, lowStock: 9, nearExpiry: 6 },
      { storeId: "s2", sales: 279455300, bills: 3702, deltaPct: 5.5, lowStock: 14, nearExpiry: 9 },
      { storeId: "s3", sales: 247190600, bills: 3291, deltaPct: -0.8, lowStock: 14, nearExpiry: 7 },
      { storeId: "s4", sales: 0, bills: 0, deltaPct: 0, lowStock: 0, nearExpiry: 0 },
    ],
  } satisfies Record<Period, BranchPerformance[]>,
  inventoryAlerts: [
    { label: "Expired (blocked from sale)", count: 4, severity: "critical" as const },
    { label: "Recalled / quarantined", count: 2, severity: "critical" as const },
    { label: "Expiring within 30 days", count: 9, severity: "warning" as const },
    { label: "Expiring in 31–90 days", count: 13, severity: "info" as const },
    { label: "Below reorder level", count: 37, severity: "warning" as const },
  ],
  approvals: [
    { id: "a1", type: "Purchase order", ref: "PO-BBS02-0142", store: "BBS-02", amount: 18450000 as Paise, by: "Rakesh Das", age: "2h" },
    { id: "a2", type: "Stock adjustment", ref: "ADJ-CTC01-0031", store: "CTC-01", amount: 1284000 as Paise, by: "Manoj Behera", age: "5h" },
    { id: "a3", type: "Refund above limit", ref: "RET-BBS01-0219", store: "BBS-01", amount: 642000 as Paise, by: "Priya Nayak", age: "1d" },
  ],
  staff: { active: 23, pendingInvites: 3, expiredInvites: 1, inactiveMemberships: 2 },
  setupChecklist: [
    { label: "Address & contact details", done: true },
    { label: "Drug licence & GSTIN", done: true },
    { label: "At least one active staff member", done: false },
    { label: "Receipt & invoice settings", done: false },
    { label: "Opening stock entered", done: false },
  ],
  audit: [
    { id: "e1", actor: "Ananya Mishra", action: "Approved shift close", target: "Shift #2291 · BBS-01", time: "10 min ago" },
    { id: "e2", actor: "Sanjay Mohanty", action: "Invited staff", target: "pharmacist · BBS-02", time: "1 h ago" },
    { id: "e3", actor: "Manoj Behera", action: "Quarantined batch", target: "AMOX500 · B2309K", time: "3 h ago" },
    { id: "e4", actor: "Rakesh Das", action: "Deactivated membership", target: "Cashier · BBS-02", time: "Yesterday" },
    { id: "e5", actor: "System", action: "Blocked expired batches", target: "4 batches · all stores", time: "Yesterday" },
  ],
  notifications: [
    { id: "n1", title: "2 batches recalled", detail: "Manufacturer recall notice for Cefixime 200 mg", time: "35 min ago", severity: "critical" },
    { id: "n2", title: "PO awaiting approval", detail: "PO-BBS02-0142 · ₹1,84,500", time: "2 h ago", severity: "warning" },
    { id: "n3", title: "Grand Road setup incomplete", detail: "3 checklist items remaining", time: "Today", severity: "info" },
  ] as Notification[],
};

// ─── Store manager ──────────────────────────────────────────────────────────

export type ShiftStatus = "open" | "pending-review" | "approved" | "variance";

export const MANAGER_DATA = {
  kpis: {
    sales: 13420500 as Paise, salesDeltaPct: 11.2, bills: 168, avgBill: 79884 as Paise,
    openShifts: 2, pendingApprovals: 4, lowStock: 9, nearExpiry: 6,
  },
  hourlySales: [
    { label: "8", value: 420000 }, { label: "9", value: 980000 }, { label: "10", value: 1460000 },
    { label: "11", value: 1720000 }, { label: "12", value: 1510000 }, { label: "13", value: 1180000 },
    { label: "14", value: 960000 }, { label: "15", value: 1120000 }, { label: "16", value: 1340000 },
    { label: "17", value: 1580000 }, { label: "18", value: 1150500 },
  ] as TrendPoint[],
  shifts: [
    { id: "sh1", cashier: "Priya Nayak", register: "Counter 1", opened: "08:02", expected: 4218000 as Paise, counted: null, status: "open" as ShiftStatus },
    { id: "sh2", cashier: "Sourav Jena", register: "Counter 2", opened: "09:15", expected: 3102500 as Paise, counted: null, status: "open" as ShiftStatus },
    { id: "sh3", cashier: "Lipsa Rout", register: "Counter 1", opened: "Yesterday 14:00", expected: 5640000 as Paise, counted: 5632000 as Paise, status: "variance" as ShiftStatus },
    { id: "sh4", cashier: "Priya Nayak", register: "Counter 1", opened: "Yesterday 08:00", expected: 4875000 as Paise, counted: 4875000 as Paise, status: "approved" as ShiftStatus },
  ],
  approvals: [
    { id: "ap1", type: "Refund above cashier limit", ref: "RET-BBS01-0219", amount: 642000 as Paise, by: "Priya Nayak", age: "25 min" },
    { id: "ap2", type: "Discount override 15%", ref: "Bill held · Counter 2", amount: 186000 as Paise, by: "Sourav Jena", age: "40 min" },
    { id: "ap3", type: "Stock adjustment (damage)", ref: "ADJ-BBS01-0058", amount: 94000 as Paise, by: "Manoj Behera", age: "3 h" },
    { id: "ap4", type: "Shift variance", ref: "Shift #2290", amount: -8000 as Paise, by: "Lipsa Rout", age: "Yesterday" },
  ],
  stockAlerts: [
    { product: "Pantoprazole 40 mg Tab", batch: "PN4021", issue: "Low stock", detail: "18 strips · reorder at 40", severity: "warning" as const },
    { product: "Azithromycin 500 mg Tab", batch: "AZ8812", issue: "Expires in 21 days", detail: "64 strips", severity: "warning" as const },
    { product: "Cefixime 200 mg Tab", batch: "CF1107", issue: "Recalled", detail: "Blocked from sale", severity: "critical" as const },
    { product: "Insulin Glargine 100 IU", batch: "IG0193", issue: "Low stock · cold chain", detail: "6 pens · reorder at 12", severity: "warning" as const },
  ],
  team: [
    { name: "Priya Nayak", role: "Cashier", status: "On shift" },
    { name: "Sourav Jena", role: "Cashier", status: "On shift" },
    { name: "Dr. Kiran Sahoo", role: "Pharmacist", status: "Active" },
    { name: "Manoj Behera", role: "Inventory", status: "Active" },
    { name: "Lipsa Rout", role: "Cashier", status: "Off today" },
    { name: "Deepak Swain", role: "Cashier", status: "Invite pending" },
  ],
  notifications: [
    { id: "n1", title: "Refund needs approval", detail: "RET-BBS01-0219 · ₹6,420", time: "25 min ago", severity: "warning" },
    { id: "n2", title: "Recalled batch blocked", detail: "Cefixime 200 mg · CF1107", time: "35 min ago", severity: "critical" },
    { id: "n3", title: "Shift variance", detail: "Shift #2290 short by ₹80", time: "Yesterday", severity: "info" },
  ] as Notification[],
};

// ─── Cashier ────────────────────────────────────────────────────────────────

export type PaymentMethod = "Cash" | "UPI" | "Card";

export const CASHIER_DATA = {
  shift: {
    id: "#2294", register: "Counter 1", openedAt: "08:02", duration: "6h 41m",
    openingFloat: 500000 as Paise, salesTotal: 4218000 as Paise, bills: 58,
    byMethod: [
      { method: "Cash" as PaymentMethod, amount: 1896000 as Paise, count: 29 },
      { method: "UPI" as PaymentMethod, amount: 1642000 as Paise, count: 22 },
      { method: "Card" as PaymentMethod, amount: 680000 as Paise, count: 7 },
    ],
  },
  kpis: { avgBill: 72724 as Paise, itemsSold: 214, heldBills: 2, returnsRequested: 1 },
  heldBills: [
    { id: "H-118", customer: "Walk-in", items: 4, amount: 46250 as Paise, heldAt: "14:22", note: "Customer fetching prescription" },
    { id: "H-117", customer: "Suresh Patra", items: 7, amount: 186000 as Paise, heldAt: "13:58", note: "Waiting on discount approval" },
  ],
  recentSales: [
    { bill: "INV-BBS01-08841", time: "14:39", customer: "Walk-in", items: 3, amount: 34800 as Paise, method: "UPI" as PaymentMethod, status: "paid" },
    { bill: "INV-BBS01-08840", time: "14:31", customer: "Meera Das", items: 6, amount: 128450 as Paise, method: "Card" as PaymentMethod, status: "paid" },
    { bill: "INV-BBS01-08839", time: "14:18", customer: "Walk-in", items: 1, amount: 9600 as Paise, method: "Cash" as PaymentMethod, status: "paid" },
    { bill: "INV-BBS01-08838", time: "14:05", customer: "Arun Kumar", items: 2, amount: 52000 as Paise, method: "Cash" as PaymentMethod, status: "return-requested" },
    { bill: "INV-BBS01-08837", time: "13:51", customer: "Walk-in", items: 5, amount: 71240 as Paise, method: "UPI" as PaymentMethod, status: "paid" },
  ],
  hourly: [
    { label: "8", value: 180000 }, { label: "9", value: 420000 }, { label: "10", value: 610000 },
    { label: "11", value: 720000 }, { label: "12", value: 590000 }, { label: "13", value: 640000 },
    { label: "14", value: 1058000 },
  ] as TrendPoint[],
  notifications: [
    { id: "n1", title: "Discount override pending", detail: "Held bill H-117 · waiting for manager", time: "40 min ago", severity: "info" },
    { id: "n2", title: "Batch blocked", detail: "Cefixime 200 mg CF1107 can't be billed", time: "35 min ago", severity: "warning" },
  ] as Notification[],
};

// ─── Pharmacist ─────────────────────────────────────────────────────────────

export type RxStatus = "pending" | "in-review" | "partial" | "verified" | "rejected";

export const PHARMACIST_DATA = {
  registration: { number: "OPC/RPh/2016/0412", validUntil: "31 Mar 2027", daysLeft: 162 },
  kpis: { pending: 7, verifiedToday: 23, partialOrRejected: 3, scheduledDispensed: 11 },
  queue: [
    { id: "RX-5531", patient: "Meera Das", age: 64, doctor: "Dr. P. Rath", items: 4, scheduled: true, waiting: "4 min", source: "Counter 1 · held bill", status: "pending" as RxStatus },
    { id: "RX-5530", patient: "Suresh Patra", age: 47, doctor: "Dr. S. Behera", items: 2, scheduled: false, waiting: "11 min", source: "Counter 2", status: "in-review" as RxStatus },
    { id: "RX-5529", patient: "Baby Ishani", age: 3, doctor: "Dr. A. Mohapatra", items: 3, scheduled: false, waiting: "16 min", source: "Counter 1", status: "pending" as RxStatus },
    { id: "RX-5528", patient: "Ramesh Lenka", age: 71, doctor: "Dr. P. Rath", items: 6, scheduled: true, waiting: "22 min", source: "Refill", status: "pending" as RxStatus },
    { id: "RX-5527", patient: "Anita Swain", age: 35, doctor: "Dr. K. Dash", items: 1, scheduled: true, waiting: "28 min", source: "Counter 2", status: "pending" as RxStatus },
  ],
  register: [
    { time: "14:12", drug: "Alprazolam 0.5 mg", schedule: "H1", patient: "R. Lenka", doctor: "Dr. P. Rath", batch: "AL2207", qty: "10 tab" },
    { time: "13:40", drug: "Tramadol 50 mg", schedule: "H1", patient: "S. Mallick", doctor: "Dr. K. Dash", batch: "TR1180", qty: "6 tab" },
    { time: "12:05", drug: "Cefuroxime 500 mg", schedule: "H1", patient: "M. Das", doctor: "Dr. P. Rath", batch: "CU0931", qty: "10 tab" },
    { time: "11:21", drug: "Zolpidem 10 mg", schedule: "H1", patient: "A. Pradhan", doctor: "Dr. S. Behera", batch: "ZP0457", qty: "5 tab" },
  ],
  blockedStock: [
    { product: "Cefixime 200 mg Tab", batch: "CF1107", reason: "Recalled" },
    { product: "Amoxicillin 500 mg Cap", batch: "B2309K", reason: "Quarantined" },
    { product: "Paracetamol Syrup 60 ml", batch: "PS0882", reason: "Expired" },
  ],
  weekly: [
    { label: "Mon", value: 31 }, { label: "Tue", value: 27 }, { label: "Wed", value: 35 },
    { label: "Thu", value: 29 }, { label: "Fri", value: 38 }, { label: "Sat", value: 42 }, { label: "Today", value: 23 },
  ] as TrendPoint[],
  notifications: [
    { id: "n1", title: "Scheduled drug awaiting sign-off", detail: "RX-5531 · Meera Das", time: "4 min ago", severity: "warning" },
    { id: "n2", title: "Recall notice", detail: "Cefixime 200 mg CF1107 blocked", time: "35 min ago", severity: "critical" },
  ] as Notification[],
};

// ─── Inventory & purchase ───────────────────────────────────────────────────

export type PoStatus = "draft" | "submitted" | "approved" | "partially-received" | "received";
export type GrnStatus = "draft" | "pending-confirmation" | "confirmed";

export const INVENTORY_DATA = {
  kpis: { skus: 1842, lowStock: 9, nearExpiry90: 22, blocked: 6, openPOs: 7, draftGRNs: 2 },
  expiryBuckets: [
    { label: "Expired", value: 4, tone: "critical" as const },
    { label: "≤ 30 days", value: 9, tone: "warning" as const },
    { label: "31–60 days", value: 6, tone: "info" as const },
    { label: "61–90 days", value: 7, tone: "info" as const },
  ],
  lowStock: [
    { product: "Pantoprazole 40 mg Tab", onHand: 18, reorder: 40, unit: "strips", supplier: "Utkal Pharma Dist." },
    { product: "Metformin 500 mg Tab", onHand: 26, reorder: 60, unit: "strips", supplier: "Kalinga Medisales" },
    { product: "Insulin Glargine 100 IU", onHand: 6, reorder: 12, unit: "pens", supplier: "Utkal Pharma Dist." },
    { product: "ORS Sachet 21 g", onHand: 40, reorder: 100, unit: "sachets", supplier: "Kalinga Medisales" },
    { product: "Amlodipine 5 mg Tab", onHand: 22, reorder: 45, unit: "strips", supplier: "Odisha Health Traders" },
  ],
  nearExpiry: [
    { product: "Azithromycin 500 mg Tab", batch: "AZ8812", expires: "10 Nov 2026", days: 21, qty: "64 strips" },
    { product: "Cough Syrup 100 ml", batch: "CS3310", expires: "14 Nov 2026", days: 25, qty: "18 bottles" },
    { product: "Vitamin D3 60K Cap", batch: "VD1029", expires: "2 Dec 2026", days: 43, qty: "30 strips" },
  ],
  poPipeline: [
    { status: "draft" as PoStatus, label: "Draft", count: 2 },
    { status: "submitted" as PoStatus, label: "Awaiting approval", count: 1 },
    { status: "approved" as PoStatus, label: "Approved", count: 3 },
    { status: "partially-received" as PoStatus, label: "Partially received", count: 1 },
  ],
  grns: [
    { id: "GRN-BBS01-0311", supplier: "Utkal Pharma Dist.", invoice: "UPD/26/88412", lines: 14, value: 9842000 as Paise, status: "pending-confirmation" as GrnStatus, issues: 1 },
    { id: "GRN-BBS01-0310", supplier: "Kalinga Medisales", invoice: "KM-55120", lines: 6, value: 2210500 as Paise, status: "draft" as GrnStatus, issues: 0 },
    { id: "GRN-BBS01-0309", supplier: "Odisha Health Traders", invoice: "OHT/3381", lines: 22, value: 14560000 as Paise, status: "confirmed" as GrnStatus, issues: 0 },
  ],
  notifications: [
    { id: "n1", title: "GRN has a validation flag", detail: "GRN-BBS01-0311 · MRP above PO", time: "1 h ago", severity: "warning" },
    { id: "n2", title: "Recall received", detail: "Cefixime 200 mg CF1107", time: "35 min ago", severity: "critical" },
  ] as Notification[],
};

// ─── Accountant ─────────────────────────────────────────────────────────────

export const ACCOUNTANT_DATA = {
  kpis: {
    revenueMtd: 898466000 as Paise, revenueDeltaPct: 6.1,
    outputTaxMtd: 43218000 as Paise, payables: 186540000 as Paise, receivables: 12480000 as Paise,
    unreconciledShifts: 3,
  },
  monthly: [
    { label: "May", sales: 812000000, purchases: 598000000 },
    { label: "Jun", sales: 846500000, purchases: 640200000 },
    { label: "Jul", sales: 879200000, purchases: 655000000 },
    { label: "Aug", sales: 902800000, purchases: 701400000 },
    { label: "Sep", sales: 951300000, purchases: 688900000 },
    { label: "Oct", sales: 898466000, purchases: 622100000 },
  ],
  payablesAging: [
    { label: "Not due", value: 92400000 as Paise },
    { label: "1–30 days", value: 58200000 as Paise },
    { label: "31–60 days", value: 24840000 as Paise },
    { label: "60+ days", value: 11100000 as Paise },
  ],
  taxByRate: [
    { rate: "5%", taxable: 512300000 as Paise, tax: 25615000 as Paise },
    { rate: "12%", taxable: 128900000 as Paise, tax: 15468000 as Paise },
    { rate: "18%", taxable: 11950000 as Paise, tax: 2135000 as Paise },
  ],
  settlement: [
    { method: "Cash", amount: 412300000 as Paise, status: "Deposited" },
    { method: "UPI", amount: 356800000 as Paise, status: "Settled" },
    { method: "Card", amount: 129366000 as Paise, status: "2 batches pending" },
  ],
  reconciliation: [
    { shift: "#2290", cashier: "Lipsa Rout", variance: -8000 as Paise, status: "Reason pending" },
    { shift: "#1877", cashier: "Arpita Sethi", variance: 25000 as Paise, status: "Manager review" },
    { shift: "#1442", cashier: "Bikash Ray", variance: -120000 as Paise, status: "Manager review" },
  ],
  notifications: [
    { id: "n1", title: "Supplier payment overdue", detail: "Utkal Pharma Dist. · 64 days", time: "Today", severity: "warning" },
    { id: "n2", title: "Card settlement pending", detail: "2 batches from 18 Oct", time: "Yesterday", severity: "info" },
  ] as Notification[],
};

// ─── Platform administrator ─────────────────────────────────────────────────

export type TenantStatus = "trial" | "active" | "suspended" | "setup-pending";

export const ADMIN_DATA = {
  kpis: { organizations: 128, active: 104, trial: 17, suspended: 7, stores: 311, users: 1946 },
  signups: [
    { label: "May", value: 9 }, { label: "Jun", value: 12 }, { label: "Jul", value: 15 },
    { label: "Aug", value: 11 }, { label: "Sep", value: 18 }, { label: "Oct", value: 14 },
  ] as TrendPoint[],
  organizations: [
    { name: "Arogya Medicals", owner: "S. Mohanty", stores: 4, users: 23, status: "active" as TenantStatus, created: "12 Mar 2026" },
    { name: "Jeevan Pharmacy", owner: "R. Agarwal", stores: 1, users: 4, status: "trial" as TenantStatus, created: "16 Oct 2026" },
    { name: "Sai Health Mart", owner: "P. Reddy", stores: 6, users: 41, status: "active" as TenantStatus, created: "2 Jan 2026" },
    { name: "CityCare Chemists", owner: "M. Khan", stores: 2, users: 9, status: "suspended" as TenantStatus, created: "28 Jun 2026" },
    { name: "Nirmal Medico", owner: "A. Das", stores: 1, users: 1, status: "setup-pending" as TenantStatus, created: "19 Oct 2026" },
  ],
  supportSessions: [
    { org: "Sai Health Mart", reason: "GRN import failing", granted: "Owner consent · read-only", expires: "in 1h 20m", state: "active" },
    { org: "Jeevan Pharmacy", reason: "Invoice prefix setup", granted: "Awaiting owner consent", expires: "—", state: "requested" },
  ],
  health: [
    { service: "API", status: "operational" },
    { service: "Background jobs", status: "operational" },
    { service: "Email delivery", status: "degraded" },
    { service: "SMS gateway", status: "not-configured" },
  ],
  notifications: [
    { id: "n1", title: "Email delivery degraded", detail: "Provider latency above threshold", time: "15 min ago", severity: "warning" },
    { id: "n2", title: "New organization registered", detail: "Nirmal Medico", time: "Yesterday", severity: "info" },
  ] as Notification[],
};
