import { useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function OAuth2SuccessPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { dark }  = useTheme();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token        = params.get("token");
    const refreshToken = params.get("refreshToken");
    const name         = params.get("name");
    const email        = params.get("email");
    const role         = params.get("role");
    const error        = params.get("error");

    if (error || !token) {
      // ✅ Show the actual error from Google/backend in the redirect
      navigate(`/login?error=${error || "google_failed"}`);
      return;
    }

    const userData = { accessToken: token, refreshToken, name, email, role };
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    login(userData);
    navigate("/");
  }, []);

  const t = dark ? dm : s;

  return (
    <div style={t.page}>
      <div style={t.card}>
        <div style={s.spinner} />
        <p style={t.text}>Signing you in with Google...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default OAuth2SuccessPage;

// ── LIGHT ────────────────────────────────────────────────────────────────────
const s = {
  page: {
    display: "flex", alignItems: "center", justifyContent: "center",
    minHeight: "100vh", background: "#f8fafc",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  card: {
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: "16px",
    background: "white", border: "1px solid #e2e8f0",
    borderRadius: "12px", padding: "40px 48px",
  },
  spinner: {
    width: "32px", height: "32px",
    border: "3px solid #e2e8f0",
    borderTop: "3px solid #2563eb",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  text: { fontSize: "14px", color: "#64748b", margin: 0 },
};

// ── DARK ─────────────────────────────────────────────────────────────────────
const dm = {
  ...s,
  page: { ...s.page, background: "#0f172a" },
  card: { ...s.card, background: "#1e293b", border: "1px solid #334155" },
  text: { ...s.text, color: "#94a3b8" },
};