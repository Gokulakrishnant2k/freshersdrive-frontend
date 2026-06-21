import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import axios from "../api/axiosInstance";
import {
  INK,
  PAGE_BG,
  PAPER,
  PAPER_TEXT,
  MUTED,
  HAIRLINE,
  STATUS_INK,
  CATEGORY_LABELS,
  getAccent,
  barcodeBars,
  getUrgency,
} from "../utils/ticketTheme";

function DriveDetails() {
  const { id } = useParams();
  const { dark } = useTheme();
  const navigate = useNavigate();
  const [drive, setDrive] = useState(null);

  useEffect(() => {
    axios
      .get(`/drives/${id}`)
      .then((res) => setDrive(res.data))
      .catch((err) => console.log(err));
  }, [id]);

  const requireLoginThenApply = (applyLink) => {
    const token = localStorage.getItem("token");

    if (!token) {
      sessionStorage.setItem("postLoginRedirect", window.location.pathname);
      sessionStorage.setItem("pendingApplyLink", applyLink);
      navigate("/login");
      return;
    }

    window.open(applyLink, "_blank", "noopener,noreferrer");
  };

  const pageBg   = dark ? PAGE_BG.dark : PAGE_BG.light;
  const paper    = dark ? PAPER.dark : PAPER.light;
  const text     = dark ? PAPER_TEXT.dark : PAPER_TEXT.light;
  const muted    = dark ? MUTED.dark : MUTED.light;
  const hairline = dark ? HAIRLINE.dark : HAIRLINE.light;

  if (!drive) {
    return (
      <div style={{ minHeight: "100vh", background: pageBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{STYLE_BLOCK}</style>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: muted, letterSpacing: "0.5px" }}>
          LOADING TICKET…
        </div>
      </div>
    );
  }

  const accent = getAccent(drive.companyName);
  const { daysLeft, level: urgency } = getUrgency(drive.deadline);

  const stamp =
    urgency === "urgent" ? { text: "FINAL CALL",   ink: STATUS_INK.urgent } :
    urgency === "soon"   ? { text: "CLOSING SOON", ink: STATUS_INK.soon } :
    urgency === "closed" ? { text: "CLOSED",       ink: STATUS_INK.closed } :
    null;

  const bars = barcodeBars(String(drive.id ?? drive.companyName ?? "x"), 38);

  const skills = (drive.keySkills || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const eligibility = [
    drive.eligibleBranches || "Any Branch",
    drive.eligibleBatches  || "Any Batch",
    drive.eligibleDegrees  || "Any Degree",
  ];

  const deadlineDate = drive.deadline
    ? new Date(drive.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  const deadlineValue = drive.deadline ? (
    <>
      {deadlineDate}
      {(urgency === "urgent" || urgency === "soon") && (
        <span style={{ marginLeft: 8, color: stamp.ink, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>
          ({daysLeft === 0 ? "today" : `${daysLeft}d left`})
        </span>
      )}
    </>
  ) : "—";

  const manifest = [
    ["CATEGORY", CATEGORY_LABELS[drive.category] || drive.category || "—"],
    ["STATUS", drive.status || "—"],
    ["DEADLINE", deadlineValue],
    ["MIN. CGPA", drive.minCgpa || "No minimum"],
    ["MAX BACKLOGS", drive.maxBacklogs != null ? String(drive.maxBacklogs) : "Not specified"],
  ];

  return (
    <div style={{ minHeight: "100vh", background: pageBg, padding: "32px 16px 60px", fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      <style>{STYLE_BLOCK}</style>

      <div style={{ maxWidth: 720, margin: "0 auto" }}>

        <button
          className="dd-focus"
          onClick={() => navigate(-1)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "transparent", border: "none", cursor: "pointer",
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 600,
            color: muted, padding: "6px 2px", marginBottom: 16,
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          BACK TO DRIVES
        </button>

        <div style={{
          borderRadius: 20, overflow: "hidden",
          boxShadow: dark ? "0 24px 60px rgba(0,0,0,0.45)" : "0 20px 50px rgba(16,26,48,0.12)",
        }}>

          {/* ── STUB ── */}
          <div style={{ background: INK, position: "relative", padding: "28px 26px 24px" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, background: accent }} />

            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 13, background: accent,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Big Shoulders Display', 'Inter', sans-serif",
                fontSize: 24, fontWeight: 800, color: "#fff", flexShrink: 0,
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.25)",
              }}>
                {(drive.companyName || "?").charAt(0).toUpperCase()}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: "'Big Shoulders Display', 'Inter', sans-serif",
                  fontSize: 30, fontWeight: 700, color: "#fff",
                  textTransform: "uppercase", letterSpacing: "0.3px", lineHeight: 1.05,
                }}>
                  {drive.companyName}
                </div>
                <div style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 13.5, color: "rgba(255,255,255,0.68)",
                  marginTop: 6, letterSpacing: "0.2px",
                }}>
                  {drive.jobRole}
                </div>
              </div>

              {drive.status === "ACTIVE" && (
                <span style={{
                  display: "flex", alignItems: "center", gap: 5,
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  borderRadius: 99, padding: "4px 10px",
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10.5, fontWeight: 700, color: "#fff",
                  letterSpacing: "0.5px", flexShrink: 0,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 6px #4ade80" }} />
                  LIVE
                </span>
              )}
            </div>

            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(96px, 1fr))",
              gap: "14px 10px", marginTop: 22,
            }}>
              <StubField label="LOCATION" value={drive.location || "Remote/NA"} />
              <StubField label="PACKAGE" value={drive.ctcDisplay ? `₹${drive.ctcDisplay}` : "Not disclosed"} color={accent} />
              <StubField label="WORK MODE" value={drive.isRemote ? "Remote" : "Onsite"} />
              <StubField label="ROLE TYPE" value={drive.jobType || "Full-Time"} />
              <StubField label="EXPERIENCE" value={drive.experienceLevel || "Freshers"} />
            </div>
          </div>

          {/* ── PERFORATION ── */}
          <div style={{ position: "relative", height: 16, background: INK }}>
            <div style={{ position: "absolute", left: 22, right: 22, top: "50%", borderTop: "2px dashed rgba(255,255,255,0.18)" }} />
            <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 9, height: 9, borderRadius: "50%", background: pageBg }} />
            <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 9, height: 9, borderRadius: "50%", background: pageBg }} />
          </div>

          {/* ── BODY (paper) ── */}
          <div style={{ background: paper, padding: "24px 26px 26px", position: "relative" }}>

            {stamp && (
              <div style={{
                position: "absolute", top: 18, right: -4, transform: "rotate(8deg)",
                border: `1.5px solid ${stamp.ink}`, color: stamp.ink, borderRadius: 6,
                padding: "4px 12px", fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11, fontWeight: 700, letterSpacing: "1px", opacity: 0.9,
              }}>
                {stamp.text}
              </div>
            )}

            <SectionLabel muted={muted}>Manifest</SectionLabel>
            <div style={{ marginBottom: 22 }}>
              {manifest.map(([label, value]) => (
                <ManifestRow key={label} label={label} value={value} text={text} muted={muted} hairline={hairline} />
              ))}
              {drive.applyLink && (
                <ManifestRow
                  label="APPLY LINK"
                  value={
                    <span
                      onClick={() => requireLoginThenApply(drive.applyLink)}
                      className="dd-link"
                      style={{ color: accent, cursor: "pointer", fontWeight: 700 }}
                    >
                      OPEN LINK ↗
                    </span>
                  }
                  text={text} muted={muted} hairline={hairline}
                />
              )}
            </div>

            {drive.jobDescription && (
              <div style={{ marginBottom: 22 }}>
                <SectionLabel muted={muted}>Flight notes</SectionLabel>
                <p style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 14, lineHeight: 1.75, color: text,
                  margin: 0, whiteSpace: "pre-line", opacity: 0.85,
                }}>
                  {drive.jobDescription}
                </p>
              </div>
            )}

            {skills.length > 0 && (
              <div style={{ marginBottom: 22 }}>
                <SectionLabel muted={muted}>Key skills</SectionLabel>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {skills.map((skill) => (
                    <span key={skill} style={{
                      fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, fontWeight: 600,
                      color: accent, background: accent + "14", border: `1px solid ${accent}40`,
                      borderRadius: 99, padding: "5px 12px", letterSpacing: "0.2px",
                    }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginBottom: 24 }}>
              <SectionLabel muted={muted}>Fare class · eligibility</SectionLabel>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {eligibility.map((tag) => (
                  <span key={tag} style={{
                    fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, fontWeight: 600,
                    color: text, background: dark ? "rgba(255,255,255,0.05)" : "#f1f4f9",
                    border: `1px solid ${hairline}`, borderRadius: 99, padding: "5px 12px",
                    letterSpacing: "0.2px",
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexWrap: "wrap", gap: 16, paddingTop: 18, borderTop: `1px solid ${hairline}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 2, height: 26 }}>
                {bars.map((w, i) => (
                  <span key={i} style={{
                    width: w, height: i % 6 === 0 ? 26 : 16,
                    background: dark ? "#3a4666" : "#cbd3e1", display: "inline-block",
                  }} />
                ))}
              </div>

              {drive.applyLink ? (
                <button
                  className="dd-focus dd-apply-btn"
                  onClick={() => requireLoginThenApply(drive.applyLink)}
                  style={{
                    background: accent, color: "#fff", border: "none",
                    borderRadius: 11, padding: "13px 30px", cursor: "pointer",
                    fontFamily: "'IBM Plex Mono', monospace", fontSize: 13.5, fontWeight: 700,
                    letterSpacing: "0.4px", boxShadow: `0 12px 24px ${accent}40`,
                  }}
                >
                  BOARD THIS ROLE →
                </button>
              ) : (
                <button
                  disabled
                  style={{
                    background: dark ? "rgba(255,255,255,0.06)" : "#e9edf3",
                    color: muted, border: "none", borderRadius: 11,
                    padding: "13px 26px", fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 13, fontWeight: 600, cursor: "not-allowed",
                  }}
                >
                  APPLICATION UNAVAILABLE
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StubField({ label, value, color }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, fontWeight: 700,
        letterSpacing: "0.6px", color: "rgba(255,255,255,0.45)", marginBottom: 4,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 14, fontWeight: 700, color: color || "#fff",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>
        {value}
      </div>
    </div>
  );
}

function SectionLabel({ children, muted }) {
  return (
    <div style={{
      fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, fontWeight: 700,
      letterSpacing: "1.2px", textTransform: "uppercase", color: muted, marginBottom: 12,
    }}>
      {children}
    </div>
  );
}

function ManifestRow({ label, value, text, muted, hairline }) {
  return (
    <div style={{
      display: "flex", alignItems: "baseline", gap: 8,
      padding: "9px 0", borderBottom: `1px dashed ${hairline}`,
    }}>
      <span style={{
        fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, fontWeight: 700,
        letterSpacing: "0.4px", color: muted, flexShrink: 0,
      }}>
        {label}
      </span>
      <span style={{ flex: 1, borderBottom: `1px dotted ${hairline}`, minWidth: 12 }} />
      <span style={{ fontSize: 13.5, fontWeight: 700, color: text, textAlign: "right", flexShrink: 0 }}>
        {value}
      </span>
    </div>
  );
}

const STYLE_BLOCK = `
@import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800&family=IBM+Plex+Mono:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');

.dd-focus:focus-visible { outline: 2.5px solid #1C7ED6; outline-offset: 3px; border-radius: 8px; }
.dd-apply-btn { transition: transform 0.15s ease, box-shadow 0.15s ease; }
.dd-apply-btn:hover { transform: translateY(-1px); }
.dd-link:hover { text-decoration: underline; }

@media (prefers-reduced-motion: reduce) {
  .dd-apply-btn { transition: none; }
}
`;

export default DriveDetails;