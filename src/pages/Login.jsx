import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";
import { API_BASE_URL } from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { DARK, LIGHT } from "../theme/tokens";

// The left brand panel mirrors Hero: it stays permanently dark regardless
// of the site-wide light/dark toggle, since it's the same "brand spotlight"
// surface, not a content surface. The right form panel is fully theme-aware.
const STAT_COLORS = ["#60a5fa", "#c084fc", "#34d399", "#f472b6"];

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { dark } = useTheme();
  const tk = dark ? DARK : LIGHT;
  const s = buildStyles(tk);

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [focused,  setFocused]  = useState(null);

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

  return (
    <div style={s.page}>
      {/* LEFT PANEL — permanently dark, matches Hero */}
      <div style={s.left}>
        <div aria-hidden="true" style={s.leftOrb1} />
        <div aria-hidden="true" style={s.leftOrb2} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={s.brandMark}>
            <div style={s.brandIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <span style={s.brandName}>FreshersDrive</span>
          </div>

          <div style={{ marginTop: "2.5rem" }}>
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
            ].map((item, i) => (
              <div key={item.label} style={s.statBox}>
                <div style={{ ...s.statNum, color: STAT_COLORS[i % STAT_COLORS.length] }}>{item.num}</div>
                <div style={s.statLabel}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL — theme-aware */}
      <div style={s.right}>
        <div style={s.formCard}>
          <div style={s.adminBadge}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke={tk.accentLight} strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Admin portal
          </div>

          <h1 style={s.formTitle}>Welcome back</h1>
          <p style={s.formSub}>Sign in to manage drives and announcements</p>

          {error && <div style={s.errorBox}>{error}</div>}

          <form onSubmit={handleLogin}>
            <div style={s.field}>
              <label style={s.label}>Email address</label>
              <input
                type="email"
                placeholder="admin@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                required
                style={{
                  ...s.input,
                  borderColor: focused === "email" ? tk.accentLight : tk.glassBorder,
                  boxShadow: focused === "email" ? `0 0 0 3px ${tk.accent}26` : "none",
                }}
              />
            </div>

            <div style={s.field}>
              <div style={s.labelRow}>
                <label style={s.label}>Password</label>
                <span onClick={() => navigate("/forgot-password")} style={s.forgotLink}>
                  Forgot password?
                </span>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
                required
                style={{
                  ...s.input,
                  borderColor: focused === "password" ? tk.accentLight : tk.glassBorder,
                  boxShadow: focused === "password" ? `0 0 0 3px ${tk.accent}26` : "none",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ ...s.primaryBtn, opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div style={s.divider}>
            <hr style={s.dividerLine} />
            <span style={s.dividerText}>or</span>
            <hr style={s.dividerLine} />
          </div>

          <button onClick={handleGoogleLogin} style={s.googleBtn}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          <p style={s.footerText}>
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

function buildStyles(tk) {
  return {
    page: { display: "flex", minHeight: "100vh", fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" },

    /* LEFT — permanently dark brand panel (matches Hero) */
    left: {
      width: "44%",
      background: DARK.bg,
      position: "relative",
      overflow: "hidden",
      display: "flex", flexDirection: "column",
      justifyContent: "center", padding: "3rem",
    },
    leftOrb1: {
      position: "absolute", top: "-60px", right: "-60px",
      width: "280px", height: "280px", borderRadius: "50%",
      background: "rgba(99,102,241,0.18)", filter: "blur(80px)", pointerEvents: "none",
    },
    leftOrb2: {
      position: "absolute", bottom: "-60px", left: "-40px",
      width: "260px", height: "260px", borderRadius: "50%",
      background: "rgba(192,132,252,0.1)", filter: "blur(80px)", pointerEvents: "none",
    },
    brandMark: { display: "flex", alignItems: "center", gap: "10px" },
    brandIcon: {
      width: "36px", height: "36px", background: DARK.accent, borderRadius: "8px",
      display: "flex", alignItems: "center", justifyContent: "center",
    },
    brandName: { fontSize: "16px", fontWeight: "700", color: "#ffffff", letterSpacing: "-0.3px" },
    tagline: {
      fontSize: "26px", fontWeight: "700", color: "#ffffff",
      lineHeight: "1.3", letterSpacing: "-0.5px", marginBottom: "12px",
    },
    leftSub: { fontSize: "14px", color: "rgba(255,255,255,0.55)", lineHeight: "1.7", margin: 0 },
    statsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "2.5rem" },
    statBox: {
      background: "rgba(255,255,255,0.05)",
      border: "0.5px solid rgba(255,255,255,0.1)",
      borderRadius: "10px", padding: "14px",
    },
    statNum:   { fontSize: "22px", fontWeight: "700" },
    statLabel: { fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "2px" },

    /* RIGHT — theme-aware */
    right: {
      flex: 1, display: "flex", alignItems: "center",
      justifyContent: "center", padding: "2rem", background: tk.bg,
    },
    formCard: {
      width: "100%", maxWidth: "380px",
      background: tk.glass,
      border: `0.5px solid ${tk.glassBorder}`,
      borderRadius: "20px",
      padding: "32px 28px",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      boxShadow: tk.shadow,
    },
    adminBadge: {
      display: "inline-flex", alignItems: "center", gap: "6px",
      background: tk.accent + "1A", color: tk.accentLight,
      fontSize: "12px", fontWeight: "500",
      padding: "5px 12px", borderRadius: "20px", marginBottom: "1.5rem",
    },
    formTitle: {
      fontSize: "24px", fontWeight: "700", color: tk.text,
      letterSpacing: "-0.4px", marginBottom: "6px", marginTop: 0,
    },
    formSub: { fontSize: "14px", color: tk.textSecondary, marginBottom: "1.5rem", marginTop: 0 },
    errorBox: {
      background: tk.errorBg, border: `1px solid ${tk.errorBorder}`,
      color: tk.error, borderRadius: "8px",
      padding: "10px 14px", fontSize: "13px", marginBottom: "1rem",
    },
    field: { marginBottom: "16px" },
    labelRow: {
      display: "flex", justifyContent: "space-between",
      alignItems: "center", marginBottom: "6px",
    },
    label: { display: "block", fontSize: "13px", fontWeight: "500", color: tk.textSecondary, marginBottom: "6px" },
    forgotLink: {
      fontSize: "12px", color: tk.accentLight, fontWeight: "500",
      cursor: "pointer", textDecoration: "none",
    },
    input: {
      width: "100%", padding: "10px 14px",
      border: `1px solid ${tk.glassBorder}`, borderRadius: "8px",
      fontSize: "14px", background: tk.inputBg, color: tk.text,
      outline: "none", transition: "border-color 0.15s, box-shadow 0.15s", boxSizing: "border-box",
      fontFamily: "inherit",
    },
    primaryBtn: {
      width: "100%", padding: "11px",
      background: tk.accent, color: "white",
      border: "none", borderRadius: "8px",
      fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit",
    },
    divider: { display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" },
    dividerLine: { flex: 1, border: "none", borderTop: `1px solid ${tk.divider}` },
    dividerText: { fontSize: "12px", color: tk.textMuted },
    googleBtn: {
      width: "100%", display: "flex", alignItems: "center",
      justifyContent: "center", gap: "10px",
      padding: "10px 14px", background: tk.inputBg,
      border: `1px solid ${tk.glassBorder}`, borderRadius: "8px",
      fontSize: "14px", fontWeight: "500", color: tk.text,
      cursor: "pointer", marginBottom: "1.5rem", fontFamily: "inherit",
    },
    footerText: { textAlign: "center", fontSize: "13px", color: tk.textMuted, margin: 0 },
    footerLink: { color: tk.accentLight, fontWeight: "500", cursor: "pointer" },
  };
} 