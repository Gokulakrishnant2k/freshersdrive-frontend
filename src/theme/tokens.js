// Shared theme tokens — single source of truth for colors used across
// Home, Hero, Updates, Contact, Login, and Register. Toggling dark/light
// in one place (ThemeContext) updates every page that imports these.

export const DARK = {
  bg: "#0c0b2b",
  glass: "rgba(255,255,255,0.045)",
  glassBorder: "rgba(255,255,255,0.1)",
  text: "#ffffff",
  textSecondary: "rgba(255,255,255,0.6)",
  textMuted: "rgba(255,255,255,0.38)",
  accent: "#6366f1",
  accentLight: "#818cf8",
  gradient: "linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #f472b6 100%)",
  warning: "#fbbf24",
  pink: "#f472b6",
  divider: "rgba(255,255,255,0.08)",
  inputBg: "rgba(255,255,255,0.05)",
  shadow: "0 20px 50px rgba(0,0,0,0.35)",

  success: "#4ade80",
  successBg: "rgba(74,222,128,0.1)",
  successBorder: "rgba(74,222,128,0.3)",

  error: "#fca5a5",
  errorBg: "rgba(239,68,68,0.1)",
  errorBorder: "rgba(239,68,68,0.35)",

  orb1: "rgba(99,102,241,0.18)",
  orb2: "rgba(16,185,129,0.12)",
  orb3: "rgba(192,132,252,0.08)",

  tagUrgentBg: "rgba(239,68,68,0.15)",   tagUrgentText: "#fca5a5",  tagUrgentBorder: "rgba(239,68,68,0.35)",
  tagHiringBg: "rgba(74,222,128,0.12)",  tagHiringText: "#4ade80",  tagHiringBorder: "rgba(74,222,128,0.3)",
  tagNewBg: "rgba(129,140,248,0.15)",    tagNewText: "#a5b4fc",     tagNewBorder: "rgba(129,140,248,0.35)",
  tagDefaultBg: "rgba(255,255,255,0.06)", tagDefaultText: "rgba(255,255,255,0.45)", tagDefaultBorder: "rgba(255,255,255,0.12)",
};

export const LIGHT = {
  bg: "#f6f5fb",
  glass: "#ffffff",
  glassBorder: "rgba(99,102,241,0.1)",
  text: "#1e1b3a",
  textSecondary: "rgba(30,27,58,0.6)",
  textMuted: "rgba(30,27,58,0.4)",
  accent: "#6366f1",
  accentLight: "#6366f1",
  gradient: "linear-gradient(135deg, #6366f1 0%, #9333ea 50%, #db2777 100%)",
  warning: "#d97706",
  pink: "#db2777",
  divider: "rgba(99,102,241,0.1)",
  inputBg: "#f8f7fc",
  shadow: "0 20px 50px rgba(76,29,149,0.08)",

  success: "#16a34a",
  successBg: "rgba(22,163,74,0.07)",
  successBorder: "rgba(22,163,74,0.25)",

  error: "#dc2626",
  errorBg: "rgba(220,38,38,0.06)",
  errorBorder: "rgba(220,38,38,0.25)",

  orb1: "rgba(99,102,241,0.08)",
  orb2: "rgba(16,185,129,0.06)",
  orb3: "rgba(147,51,234,0.05)",

  tagUrgentBg: "rgba(220,38,38,0.08)",  tagUrgentText: "#dc2626",  tagUrgentBorder: "rgba(220,38,38,0.25)",
  tagHiringBg: "rgba(22,163,74,0.08)",  tagHiringText: "#16a34a",  tagHiringBorder: "rgba(22,163,74,0.22)",
  tagNewBg: "rgba(99,102,241,0.1)",     tagNewText: "#4f46e5",     tagNewBorder: "rgba(99,102,241,0.3)",
  tagDefaultBg: "rgba(30,27,58,0.05)",  tagDefaultText: "rgba(30,27,58,0.45)", tagDefaultBorder: "rgba(30,27,58,0.12)",
};