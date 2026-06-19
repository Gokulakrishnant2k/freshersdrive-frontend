import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import axios from "../api/axiosInstance";
import { API_BASE_URL } from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { dark } = useTheme();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("/auth/login", { email, password });
      const data = res.data;
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data));
      login(data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
  };

  const t = dark ? dm : s;

  return (
    <div style={s.page}>
      {/* LEFT PANEL */}
      <div style={s.left}>
        <div style={s.brandMark}>
          <div style={s.brandIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <span style={s.brandName}>FreshersDrive</span>
        </div>

        <div>
          <div style={s.tagline}>Your career journey starts here</div>
          <p style={s.leftSub}>
            Connect with top companies actively hiring freshers and early-career professionals.
          </p>
        </div>

        <div style={s.statsGrid}>
          {[
            { num: "1,200+", label: "Active drives" },
            { num: "340+",   label: "Companies"     },
            { num: "98%",    label: "Response rate" },
            { num: "48h",    label: "Avg. response" },
          ].map((item) => (
            <div key={item.label} style={s.statBox}>
              <div style={s.statNum}>{item.num}</div>
              <div style={s.statLabel}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={t.right}>
        <div style={s.formCard}>
          <div style={s.adminBadge}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="#2563eb" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Admin portal
          </div>

          <h1 style={t.formTitle}>Welcome back</h1>
          <p style={t.formSub}>Sign in to manage drives and announcements</p>

          {error && <div style={s.errorBox}>{error}</div>}

          <form onSubmit={handleLogin}>
            <div style={s.field}>
              <label style={t.label}>Email address</label>
              <input
                type="email"
                placeholder="admin@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={t.input}
                onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                onBlur={(e)  => (e.target.style.borderColor = dark ? "#334155" : "#e2e8f0")}
              />
            </div>

            <div style={s.field}>
              <div style={s.labelRow}>
                <label style={t.label}>Password</label>
                {/* ✅ ADDED: Forgot Password link */}
                <span
                  onClick={() => navigate("/forgot-password")}
                  style={s.forgotLink}
                >
                  Forgot password?
                </span>
              </div>
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

            <button
              type="submit"
              disabled={loading}
              style={{ ...s.primaryBtn, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div style={s.divider}>
            <hr style={t.dividerLine} />
            <span style={s.dividerText}>or</span>
            <hr style={t.dividerLine} />
          </div>

          <button onClick={handleGoogleLogin} style={t.googleBtn}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          <p style={t.footerText}>
            Don't have an account?{" "}
            <span onClick={() => navigate("/register")} style={s.footerLink}>
              Register
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;

// ── LIGHT ────────────────────────────────────────────────────────────────────
const s = {
  page: { display: "flex", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif" },
  left: {
    width: "44%", background: "#0f172a",
    display: "flex", flexDirection: "column",
    justifyContent: "center", gap: "2.5rem", padding: "3rem",
  },
  brandMark: { display: "flex", alignItems: "center", gap: "10px" },
  brandIcon: {
    width: "36px", height: "36px", background: "#2563eb", borderRadius: "8px",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  brandName: { fontSize: "16px", fontWeight: "700", color: "white", letterSpacing: "-0.3px" },
  tagline: {
    fontSize: "26px", fontWeight: "700", color: "white",
    lineHeight: "1.3", letterSpacing: "-0.5px", marginBottom: "12px",
  },
  leftSub: { fontSize: "14px", color: "#94a3b8", lineHeight: "1.7", margin: 0 },
  statsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  statBox: {
    background: "rgba(255,255,255,0.05)",
    border: "0.5px solid rgba(255,255,255,0.1)",
    borderRadius: "10px", padding: "14px",
  },
  statNum:   { fontSize: "22px", fontWeight: "700", color: "white" },
  statLabel: { fontSize: "12px", color: "#64748b", marginTop: "2px" },
  right: {
    flex: 1, display: "flex", alignItems: "center",
    justifyContent: "center", padding: "2rem", background: "#f8fafc",
  },
  formCard: { width: "100%", maxWidth: "380px" },
  adminBadge: {
    display: "inline-flex", alignItems: "center", gap: "6px",
    background: "rgba(37,99,235,0.08)", color: "#2563eb",
    fontSize: "12px", fontWeight: "500",
    padding: "5px 12px", borderRadius: "20px", marginBottom: "1.5rem",
  },
  formTitle: {
    fontSize: "24px", fontWeight: "700", color: "#0f172a",
    letterSpacing: "-0.4px", marginBottom: "6px", marginTop: 0,
  },
  formSub: { fontSize: "14px", color: "#64748b", marginBottom: "1.5rem", marginTop: 0 },
  errorBox: {
    background: "#fef2f2", border: "1px solid #fecaca",
    color: "#b91c1c", borderRadius: "8px",
    padding: "10px 14px", fontSize: "13px", marginBottom: "1rem",
  },
  field: { marginBottom: "16px" },
  // ✅ ADDED: labelRow to space label and forgot link apart
  labelRow: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginBottom: "6px",
  },
  label: { display: "block", fontSize: "13px", fontWeight: "500", color: "#475569", marginBottom: "6px" },
  // ✅ ADDED: forgotLink style
  forgotLink: {
    fontSize: "12px", color: "#2563eb", fontWeight: "500",
    cursor: "pointer", textDecoration: "none",
  },
  input: {
    width: "100%", padding: "10px 14px",
    border: "1px solid #e2e8f0", borderRadius: "8px",
    fontSize: "14px", background: "white", color: "#0f172a",
    outline: "none", transition: "border-color 0.15s", boxSizing: "border-box",
  },
  primaryBtn: {
    width: "100%", padding: "11px",
    background: "#2563eb", color: "white",
    border: "none", borderRadius: "8px",
    fontSize: "14px", fontWeight: "600", cursor: "pointer",
  },
  divider: { display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" },
  dividerLine: { flex: 1, border: "none", borderTop: "1px solid #e2e8f0" },
  dividerText: { fontSize: "12px", color: "#94a3b8" },
  googleBtn: {
    width: "100%", display: "flex", alignItems: "center",
    justifyContent: "center", gap: "10px",
    padding: "10px 14px", background: "white",
    border: "1px solid #e2e8f0", borderRadius: "8px",
    fontSize: "14px", fontWeight: "500", color: "#0f172a",
    cursor: "pointer", marginBottom: "1.5rem",
  },
  footerText: { textAlign: "center", fontSize: "13px", color: "#64748b", margin: 0 },
  footerLink: { color: "#2563eb", fontWeight: "500", cursor: "pointer" },
};

// ── DARK ─────────────────────────────────────────────────────────────────────
const dm = {
  ...s,
  right:       { ...s.right,       background: "#0f172a" },
  formTitle:   { ...s.formTitle,   color: "#f1f5f9" },
  formSub:     { ...s.formSub,     color: "#64748b" },
  label:       { ...s.label,       color: "#94a3b8" },
  input:       { ...s.input,       background: "#1e293b", border: "1px solid #334155", color: "#f1f5f9" },
  dividerLine: { ...s.dividerLine, borderTop: "1px solid #334155" },
  googleBtn:   { ...s.googleBtn,   background: "#1e293b", border: "1px solid #334155", color: "#f1f5f9" },
  footerText:  { ...s.footerText,  color: "#64748b" },
};