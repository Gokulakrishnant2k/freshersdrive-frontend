import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import axios from "../api/axiosInstance";

function ResetPassword() {
  const navigate = useNavigate();
  const { dark } = useTheme();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [loading,   setLoading]   = useState(false);
  const [validating,setValidating] = useState(true);
  const [tokenOk,   setTokenOk]   = useState(false);
  const [done,      setDone]       = useState(false);
  const [error,     setError]      = useState("");

  // On mount: validate the token before showing the form
  useEffect(() => {
    if (!token) {
      setTokenOk(false);
      setValidating(false);
      return;
    }
    axios.get(`/auth/reset-password/validate?token=${token}`)
      .then((res) => setTokenOk(res.data?.valid === true))
      .catch(() => setTokenOk(false))
      .finally(() => setValidating(false));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/auth/reset-password", { token, password });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const t = dark ? dm : s;

  // ── Loading state ──────────────────────────────────────────────────────────
  if (validating) {
    return (
      <div style={t.page}>
        <div style={s.card}>
          <p style={t.sub}>Validating your reset link…</p>
        </div>
      </div>
    );
  }

  // ── Invalid / expired token ────────────────────────────────────────────────
  if (!tokenOk) {
    return (
      <div style={t.page}>
        <div style={s.card}>
          <div style={s.iconWrap}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h1 style={{ ...t.title, color: "#dc2626" }}>Link expired or invalid</h1>
          <p style={t.sub}>This password reset link has expired or already been used. Request a new one.</p>
          <button onClick={() => navigate("/forgot-password")} style={s.btn}>
            Request new link
          </button>
        </div>
      </div>
    );
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (done) {
    return (
      <div style={t.page}>
        <div style={s.card}>
          <div style={{ ...s.iconWrap, background: "rgba(5,150,105,0.08)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 style={t.title}>Password updated!</h1>
          <p style={t.sub}>Your password has been reset successfully. You can now sign in with your new password.</p>
          <button onClick={() => navigate("/login")} style={s.btn}>
            Go to login
          </button>
        </div>
      </div>
    );
  }

  // ── Main form ──────────────────────────────────────────────────────────────
  return (
    <div style={t.page}>
      <div style={s.card}>

        <div style={s.iconWrap}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h1 style={t.title}>Set new password</h1>
        <p style={t.sub}>Choose a strong password with at least 8 characters.</p>

        {error && <div style={s.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={s.field}>
            <label style={t.label}>New password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={t.input}
              onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
              onBlur={(e)  => (e.target.style.borderColor = dark ? "#334155" : "#e2e8f0")}
            />
          </div>

          <div style={s.field}>
            <label style={t.label}>Confirm password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
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
            {loading ? "Updating…" : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;

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