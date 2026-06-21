// src/utils/ticketTheme.js
//
// Shared "boarding pass" design tokens — the visual language DriveCard
// established (a campus drive as a ticket with a closing window). Any
// component that wants to feel like part of the same product imports
// from here instead of redefining its own palette.
export const INK = "#101a30";
export const PAGE_BG = { light: "#f8fafc", dark: "#0f172a" };
export const PAPER      = { light: "#fbfcfe",  dark: "#161f33" };
export const PAPER_TEXT = { light: "#19223a",  dark: "#e7ecf5" };
export const MUTED      = { light: "#8993ab",  dark: "#7c8aa8" };
export const HAIRLINE   = { light: "#e7ebf2",  dark: "#2a3550" };
// Universal — never themed by company, so urgency stays scannable.
export const STATUS_INK = {
  urgent: "#C92A2A", // final call
  soon:   "#B45309", // closing soon
  closed: "#5B6478", // closed
};
export const CATEGORY_LABELS = {
  IT_SOFTWARE:      "IT · Software",
  CORE_ENGINEERING: "Core · Engg",
  GOVERNMENT:       "Government",
  BANKING:          "Banking",
  MANAGEMENT:       "Management",
  INTERNSHIP:       "Internship",
  OFF_CAMPUS:       "Off Campus",
};
// Livery accents (one per company, like tail colors).
export const ACCENTS = [
  "#E8590C", // Tarmac Orange
  "#1C7ED6", // Aviation Blue
  "#2F9E44", // Runway Green
  "#E03131", // Beacon Red
  "#7048E8", // Slate Violet
  "#0CA678", // Teal Jet
  "#F08C00", // Signal Amber
];
export function getAccent(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return ACCENTS[hash % ACCENTS.length];
}
// Deterministic decorative barcode — same drive always renders the same bars.
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
export function getUrgency(deadline) {
  if (!deadline) return { daysLeft: null, level: null };
  const daysLeft = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
  const level =
    daysLeft <= 0 ? "closed" :
    daysLeft <= 2 ? "urgent" :
    daysLeft <= 7 ? "soon" : null;
  return { daysLeft, level };
}
