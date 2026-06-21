// src/components/Logo.jsx
import { INK, getAccent } from "../utils/ticketTheme";

const BRAND_ACCENT = getAccent("FreshersDrive");

export default function Logo({ size = 26, textSize = 17, textColor = "#ffffff" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
      <span style={{
        width: size,
        height: size,
        background: BRAND_ACCENT,
        borderRadius: "7px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}>
        <svg width={size * 0.54} height={size * 0.54} viewBox="0 0 24 24" fill="none">
          <rect x="2" y="6" width="20" height="12" rx="3" stroke="#fff" strokeWidth="2" />
          <circle cx="2.5" cy="12" r="2" fill={INK} />
          <circle cx="21.5" cy="12" r="2" fill={INK} />
        </svg>
      </span>
      <span style={{
        fontFamily: "'Big Shoulders Display', 'Inter', sans-serif",
        fontWeight: "700",
        fontSize: textSize,
        color: textColor,
        letterSpacing: "0.4px",
        textTransform: "uppercase",
      }}>
        FreshersDrive
      </span>
    </div>
  );
}