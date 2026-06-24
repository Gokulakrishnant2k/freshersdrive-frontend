// src/utils/ticketTheme.js
//
// Professional token system — subdued palette, Inter-only, no decorative exports.
// All component imports remain compatible; decorative helpers (barcodeBars) are
// kept as no-ops so nothing breaks, but are no longer used in DriveCard / ExpiringDrives.

// ── Base surfaces ────────────────────────────────────────────────────────────
export const INK     = "#0D1424";
export const PAGE_BG = { light: "#F8FAFC", dark: "#080E1C" };

export const PAPER      = { light: "#FFFFFF",  dark: "#111827" };
export const PAPER_TEXT = { light: "#0F172A",  dark: "#E8EDF5" };
export const MUTED      = { light: "#64748B",  dark: "#6B7FA3" };
export const HAIRLINE   = { light: "#E2E8F0",  dark: "#1E2D45" };

// ── Urgency — semantic, restrained ──────────────────────────────────────────
export const STATUS_INK = {
  urgent: "#BE123C", // rose-700  — clear danger, not aggressive
  soon:   "#B45309", // amber-700 — warm caution
  closed: "#64748B", // slate-500 — neutral
};

export const STATUS_TINT = {
  urgent: { bg: "#FFF1F2", border: "#FECDD3", dark_bg: "#1C0611", dark_border: "#9F1239" },
  soon:   { bg: "#FFFBEB", border: "#FDE68A", dark_bg: "#1C1202", dark_border: "#92400E" },
  closed: { bg: "#F8FAFC", border: "#E2E8F0", dark_bg: "#1E293B", dark_border: "#334155" },
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

// ── Company accent palette ────────────────────────────────────────────────────
// Reduced saturation — these are subtle identity hints, not decorations.
// They appear only in the avatar letter + the "View role" link.
export const ACCENTS = [
  "#4F46E5", // Indigo   — primary brand
  "#0369A1", // Sky      — clean, tech
  "#047857", // Emerald  — finance, growth
  "#B45309", // Amber    — energy, FMCG
  "#B91C1C", // Red      — bold verticals
  "#7C3AED", // Violet   — product, creative
  "#0E7490", // Cyan     — SaaS, startup
  "#1D4ED8", // Blue     — default enterprise
  "#0F766E", // Teal     — healthcare, ops
  "#C2410C", // Orange   — manufacturing
];

export function getAccent(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return ACCENTS[hash % ACCENTS.length];
}

// ── Urgency helper ────────────────────────────────────────────────────────────
export function getUrgency(deadline) {
  if (!deadline) return { daysLeft: null, level: null };
  const daysLeft = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
  const level =
    daysLeft <= 0 ? "closed" :
    daysLeft <= 2 ? "urgent" :
    daysLeft <= 7 ? "soon"   : null;
  return { daysLeft, level };
}

// ── Shadow tokens ─────────────────────────────────────────────────────────────
export const SHADOW = {
  rest: {
    light: "0 1px 2px rgba(15,23,42,0.05)",
    dark:  "0 1px 3px rgba(0,0,0,0.4)",
  },
  hover: {
    light: "0 4px 16px rgba(15,23,42,0.10), 0 1px 3px rgba(15,23,42,0.06)",
    dark:  "0 4px 20px rgba(0,0,0,0.5),     0 1px 3px rgba(0,0,0,0.3)",
  },
};

// ── Kept for backward compatibility — no longer used visually ─────────────────
export function barcodeBars(seed = "x", count = 22) { return []; }