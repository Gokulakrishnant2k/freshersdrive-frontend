// src/utils/ticketTheme.js
//
// Redesigned theme — "Placement OS" aesthetic.
// Deep navy base, electric indigo primary, Inter-only type hierarchy.
// All components that previously imported from here stay compatible:
// every export name is preserved, values are swapped.

// ── Base surfaces ────────────────────────────────────────────────────────────
export const INK     = "#0D1424"; // near-black navy — card header bg
export const PAGE_BG = { light: "#F0F4FA", dark: "#080E1C" };

// Card body surfaces — slightly elevated from page
export const PAPER      = { light: "#FFFFFF",  dark: "#111827" };
export const PAPER_TEXT = { light: "#0F172A",  dark: "#E8EDF5" };
export const MUTED      = { light: "#64748B",  dark: "#6B7FA3" };
export const HAIRLINE   = { light: "#E2E8F0",  dark: "#1E2D45" };

// ── Urgency — semantic, not decorative ──────────────────────────────────────
export const STATUS_INK = {
  urgent: "#EF4444", // red-500  — final call
  soon:   "#F59E0B", // amber-500 — closing soon
  closed: "#64748B", // slate-500 — over
};

// Urgency surface tints (bg + border for badges)
export const STATUS_TINT = {
  urgent: { bg: "#FEF2F2", border: "#FECACA", dark_bg: "#2D1515", dark_border: "#7F1D1D" },
  soon:   { bg: "#FFFBEB", border: "#FDE68A", dark_bg: "#2D2006", dark_border: "#78350F" },
  closed: { bg: "#F1F5F9", border: "#CBD5E1", dark_bg: "#1E293B", dark_border: "#334155" },
};

// ── Category labels ──────────────────────────────────────────────────────────
export const CATEGORY_LABELS = {
  IT_SOFTWARE:      "IT · Software",
  CORE_ENGINEERING: "Core · Engg",
  GOVERNMENT:       "Government",
  BANKING:          "Banking",
  MANAGEMENT:       "Management",
  INTERNSHIP:       "Internship",
  OFF_CAMPUS:       "Off Campus",
  OTHERS:           "Others",
};

// ── Company accent palette ───────────────────────────────────────────────────
// Shifted to more saturated, professional hues that pop on both
// light and dark surfaces without looking like a toy box.
export const ACCENTS = [
  "#6366F1", // Indigo     — primary brand feel
  "#3B82F6", // Blue       — clean, tech
  "#10B981", // Emerald    — growth, finance
  "#F59E0B", // Amber      — energy, FMCG
  "#EF4444", // Red        — bold, consulting
  "#8B5CF6", // Violet     — creative, product
  "#06B6D4", // Cyan       — startup, SaaS
  "#EC4899", // Pink       — media, consumer
  "#14B8A6", // Teal       — healthcare, ops
  "#F97316", // Orange     — core / manufacturing
];

export function getAccent(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return ACCENTS[hash % ACCENTS.length];
}

// ── Deterministic barcode decoration ────────────────────────────────────────
// Kept for visual continuity in DriveCard / ExpiringDrives.
export function barcodeBars(seed = "x", count = 22) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 131 + seed.charCodeAt(i)) >>> 0;
  const bars = [];
  for (let i = 0; i < count; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    bars.push(2 + (h % 5));
  }
  return bars;
}

// ── Urgency helper ───────────────────────────────────────────────────────────
export function getUrgency(deadline) {
  if (!deadline) return { daysLeft: null, level: null };
  const daysLeft = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
  const level =
    daysLeft <= 0 ? "closed" :
    daysLeft <= 2 ? "urgent" :
    daysLeft <= 7 ? "soon"   : null;
  return { daysLeft, level };
}

// ── Card shadow tokens ───────────────────────────────────────────────────────
export const SHADOW = {
  rest:  {
    light: "0 1px 3px rgba(15,23,42,0.06), 0 4px 12px rgba(15,23,42,0.04)",
    dark:  "0 1px 3px rgba(0,0,0,0.4),     0 4px 12px rgba(0,0,0,0.25)",
  },
  hover: {
    light: "0 8px 24px rgba(99,102,241,0.14), 0 2px 6px rgba(15,23,42,0.08)",
    dark:  "0 8px 28px rgba(99,102,241,0.22), 0 2px 6px rgba(0,0,0,0.45)",
  },
};