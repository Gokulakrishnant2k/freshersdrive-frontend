import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import axios from "../api/axiosInstance";

function ForgotPassword() {
  const navigate = useNavigate();
  const { dark } = useTheme();

  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const t = dark ? dm : s;

  return (
    <div style={t.page}>
      <div style={s.card}>

        {/* Back link */}
        <button onClick={() => navigate("/login")} style={s.backBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to login
        </button>

        {/* Icon */}
        <div style={s.iconWrap}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h1 style={t.title}>Forgot your password?</h1>
        <p style={t.sub}>
          Enter your Gmail address and we'll send you a link to reset your password.
        </p>

        {/* Success state */}
        {sent ? (
          <div style={s.successBox}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <div>
              <div style={s.successTitle}>Check your inbox</div>
              <div style={s.successSub}>
                If <strong>{email}</strong> is registered, a reset link has been sent.
                Check your spam folder too.
              </div>
            </div>
          </div>
        ) : (
          <>
            {error && <div style={s.errorBox}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div style={s.field}>
                <label style={t.label}>Gmail address</label>
                <input
                  type="email"
                  placeholder="you@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={t.input}
                  onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                  onBlur={(e)  => (e.target.style.borderColor = dark ? "#334155" : "#e2e8f0")}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}
              >
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;

// ── LIGHT ─────────────────────────────────────────────────────────────────────
const s = {
  page: {
    minHeight: "100vh", display: "flex", alignItems: "center",
    justifyContent: "center", background: "#f8fafc",
    fontFamily: "'Inter', system-ui, sans-serif", padding: "1rem",
  },
  card: {
    width: "100%", maxWidth: "400px",
    background: "white", borderRadius: "16px",
    padding: "2rem", boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
  },
  backBtn: {
    display: "inline-flex", alignItems: "center", gap: "6px",
    background: "none", border: "none", cursor: "pointer",
    color: "#64748b", fontSize: "13px", padding: 0, marginBottom: "1.5rem",
  },
  iconWrap: {
    width: "48px", height: "48px", borderRadius: "12px",
    background: "rgba(37,99,235,0.08)",
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: "1rem",
  },
  title: {
    fontSize: "22px", fontWeight: "700", color: "#0f172a",
    letterSpacing: "-0.4px", margin: "0 0 8px",
  },
  sub: { fontSize: "14px", color: "#64748b", lineHeight: "1.6", margin: "0 0 1.5rem" },
  errorBox: {
    background: "#fef2f2", border: "1px solid #fecaca",
    color: "#b91c1c", borderRadius: "8px",
    padding: "10px 14px", fontSize: "13px", marginBottom: "1rem",
  },
  successBox: {
    display: "flex", gap: "12px", alignItems: "flex-start",
    background: "#f0fdf4", border: "1px solid #bbf7d0",
    borderRadius: "10px", padding: "14px 16px",
  },
  successTitle: { fontWeight: "600", color: "#065f46", fontSize: "14px", marginBottom: "4px" },
  successSub:   { fontSize: "13px", color: "#047857", lineHeight: "1.6" },
  field: { marginBottom: "16px" },
  label: { display: "block", fontSize: "13px", fontWeight: "500", color: "#475569", marginBottom: "6px" },
  input: {
    width: "100%", padding: "10px 14px",
    border: "1px solid #e2e8f0", borderRadius: "8px",
    fontSize: "14px", background: "white", color: "#0f172a",
    outline: "none", boxSizing: "border-box",
  },
  btn: {
    width: "100%", padding: "11px",
    background: "#2563eb", color: "white",
    border: "none", borderRadius: "8px",
    fontSize: "14px", fontWeight: "600", cursor: "pointer",
  },
};

// ── DARK ──────────────────────────────────────────────────────────────────────
const dm = {
  ...s,
  page:  { ...s.page,  background: "#0f172a" },
  title: { ...s.title, color: "#f1f5f9" },
  sub:   { ...s.sub,   color: "#64748b" },
  label: { ...s.label, color: "#94a3b8" },
  input: { ...s.input, background: "#1e293b", border: "1px solid #334155", color: "#f1f5f9" },
};