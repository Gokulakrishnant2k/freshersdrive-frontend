import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import axios from "../api/axiosInstance";

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

  if (!drive) {
    return (
      <div style={{ ...s.page, background: dark ? "#0f172a" : "#f8fafc" }}>
        <h2 style={{ color: dark ? "#94a3b8" : "#64748b", textAlign: "center", paddingTop: "80px" }}>
          Loading...
        </h2>
      </div>
    );
  }

  const t = dark ? dm : s;

  return (
    <div style={t.page}>
      <div style={s.container}>

        {/* HEADER CARD */}
        <div style={t.headerCard}>
          <h1 style={t.company}>{drive.companyName}</h1>
          <h2 style={t.role}>{drive.jobRole}</h2>
          <div style={s.badgeRow}>
            <span style={t.badge}>📍 {drive.location || "Remote/NA"}</span>
            <span style={t.badge}>💰 {drive.ctcDisplay || "Not Disclosed"}</span>
            <span style={t.badge}>{drive.isRemote ? "🌍 Remote" : "🏢 Onsite"}</span>
            <span style={t.badge}>🗂 {drive.jobType || "Full-Time"}</span>
            <span style={t.badge}>🎓 {drive.experienceLevel || "Freshers"}</span>
          </div>
        </div>

        {/* KEY DETAILS */}
        <div style={t.card}>
          <h3 style={t.sectionTitle}>Key Details</h3>
          {[
            ["Category",    drive.category          || "—"],
            ["Status",      drive.status            || "—"],
            ["Deadline",    drive.deadline          || "—"],
            ["Min CGPA",    drive.minCgpa           || "No minimum"],
            ["Max Backlogs",drive.maxBacklogs != null ? drive.maxBacklogs : "Not specified"],
            ["Apply Link",  drive.applyLink         || "—"],
          ].map(([label, value]) => (
            <div key={label} style={t.infoRow}>
              <span style={{ color: dark ? "#94a3b8" : "#64748b" }}>{label}</span>
              <b style={{ color: dark ? "#f1f5f9" : "#0f172a" }}>
                {label === "Apply Link" && drive.applyLink
                  ? (
                    <span
                      onClick={() => requireLoginThenApply(drive.applyLink)}
                      style={{ color: "#2563eb", cursor: "pointer" }}
                    >
                      Open Link
                    </span>
                  )
                  : value}
              </b>
            </div>
          ))}
        </div>

        {/* JOB DESCRIPTION */}
        {drive.jobDescription && (
          <div style={{ ...t.card, marginTop: "20px" }}>
            <h3 style={t.sectionTitle}>About the Role</h3>
            <p style={{
              color: dark ? "#94a3b8" : "#475569",
              fontSize: "14px",
              lineHeight: "1.8",
              margin: 0,
              whiteSpace: "pre-line",
            }}>
              {drive.jobDescription}
            </p>
          </div>
        )}

        {/* KEY SKILLS */}
        {drive.keySkills && (
          <div style={{ ...t.card, marginTop: "20px" }}>
            <h3 style={t.sectionTitle}>Key Skills</h3>
            <div style={s.tags}>
              {drive.keySkills
                .split(",")
                .map((skill) => skill.trim())
                .filter(Boolean)
                .map((skill) => (
                  <span key={skill} style={t.skillTag}>{skill}</span>
                ))}
            </div>
          </div>
        )}

        {/* ELIGIBILITY */}
        <div style={{ ...t.card, marginTop: "20px" }}>
          <h3 style={t.sectionTitle}>Eligibility</h3>
          <div style={s.tags}>
            {[
              drive.eligibleBranches  || "Any Branch",
              drive.eligibleBatches   || "Any Batch",
              drive.eligibleDegrees   || "Any Degree",
            ].map((tag) => (
              <span key={tag} style={t.tag}>{tag}</span>
            ))}
          </div>
        </div>

        {/* APPLY */}
        <div style={s.applyBox}>
          {drive.applyLink ? (
            <button
              style={s.applyBtn}
              onClick={() => requireLoginThenApply(drive.applyLink)}
            >
              🚀 Apply Now
            </button>
          ) : (
            <button style={s.disabledBtn} disabled>Application Not Available</button>
          )}
        </div>

      </div>
    </div>
  );
}

export default DriveDetails;

// ── LIGHT ────────────────────────────────────────────────────────────────────
const s = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    padding: "30px 16px",
    fontFamily: "Inter, Arial, sans-serif",
  },
  container: {
    maxWidth: "800px",
    margin: "0 auto",
  },
  headerCard: {
    background: "white",
    padding: "26px",
    borderRadius: "18px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    marginBottom: "20px",
    border: "1px solid #f1f5f9",
  },
  company: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "700",
    color: "#0f172a",
  },
  role: {
    marginTop: "6px",
    color: "#475569",
    fontSize: "17px",
    fontWeight: "500",
    marginBottom: 0,
  },
  badgeRow: {
    display: "flex",
    gap: "8px",
    marginTop: "14px",
    flexWrap: "wrap",
  },
  badge: {
    background: "#eef2ff",
    color: "#3730a3",
    padding: "6px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "500",
  },
  card: {
    background: "white",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
    border: "1px solid #f1f5f9",
  },
  sectionTitle: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: "12px",
    marginTop: 0,
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid #f1f5f9",
    fontSize: "14px",
    color: "#334155",
  },
  tags: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  tag: {
    background: "#f1f5f9",
    padding: "7px 14px",
    borderRadius: "999px",
    fontSize: "13px",
    color: "#334155",
  },
  // Slightly distinct style for skill tags vs eligibility tags
  skillTag: {
    background: "#eef2ff",
    color: "#3730a3",
    padding: "6px 14px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "500",
    border: "1px solid #c7d2fe",
  },
  applyBox: {
    display: "flex",
    justifyContent: "center",
    marginTop: "28px",
    marginBottom: "20px",
  },
  applyBtn: {
    background: "#2563eb",
    color: "white",
    padding: "12px 32px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
    boxShadow: "0 10px 20px rgba(37,99,235,0.25)",
  },
  disabledBtn: {
    background: "#cbd5e1",
    color: "#475569",
    padding: "12px 32px",
    borderRadius: "12px",
    border: "none",
    fontSize: "15px",
  },
};

// ── DARK ─────────────────────────────────────────────────────────────────────
const dm = {
  ...s,
  page:         { ...s.page,         background: "#0f172a" },
  headerCard:   { ...s.headerCard,   background: "#1e293b", border: "1px solid #334155", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" },
  company:      { ...s.company,      color: "#f1f5f9" },
  role:         { ...s.role,         color: "#94a3b8" },
  badge:        { ...s.badge,        background: "#1e3a5f", color: "#93c5fd" },
  card:         { ...s.card,         background: "#1e293b", border: "1px solid #334155", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" },
  sectionTitle: { ...s.sectionTitle, color: "#f1f5f9" },
  infoRow:      { ...s.infoRow,      borderBottom: "1px solid #334155", color: "#94a3b8" },
  tag:          { ...s.tag,          background: "#0f172a", color: "#94a3b8" },
  skillTag:     { ...s.skillTag,     background: "#1e3a5f", color: "#93c5fd", border: "1px solid #1e40af" },
};