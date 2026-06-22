import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";
import { useTheme } from "../context/ThemeContext";
import { DARK, LIGHT } from "../theme/tokens";
import Logo from "../components/Logo";

const FIELDS = [
  { name: "name",      placeholder: "Full name",   type: "text",     col: "full" },
  { name: "email",     placeholder: "Email",        type: "email",    col: "full" },
  { name: "password",  placeholder: "Password",     type: "password", col: "full" },
  { name: "degree",    placeholder: "Degree",       type: "text",     col: "half" },
  { name: "branch",    placeholder: "Branch",       type: "text",     col: "half" },
  { name: "cgpa",      placeholder: "CGPA",         type: "text",     col: "half" },
  { name: "batchYear", placeholder: "Batch year",   type: "text",     col: "half" },
  { name: "college",   placeholder: "College",      type: "text",     col: "full" },
  { name: "phone",     placeholder: "Phone number", type: "text",     col: "full" },
];

export default function Register() {
  const navigate = useNavigate();
  const { dark } = useTheme();
  const tk = dark ? DARK : LIGHT;

  const [form, setForm] = useState({
    name: "", email: "", password: "",
    degree: "", branch: "", cgpa: "",
    batchYear: "", college: "", phone: "",
  });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post("/auth/register", form);
      alert("Registered successfully");
      navigate("/login");
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Responsive styles — collapses 2-col grid to 1-col on mobile */}
      <style>{`
        .fd-register-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 20px;
        }
        @media (max-width: 480px) {
          .fd-register-grid {
            grid-template-columns: 1fr;
          }
          .fd-register-grid > div {
            grid-column: span 1 !important;
          }
        }
      `}</style>

      <div style={styles.page(tk)}>
        {/* Background orbs */}
        <div style={styles.orb(tk.orb1, "-100px", "auto", "auto", "-100px", "420px")} />
        <div style={styles.orb(tk.orb2, "auto", "-80px", "-80px", "auto",  "340px")} />
        <div style={styles.orb(tk.orb3, "35%",  "auto", "auto", "20%",    "300px")} />

        <div style={styles.card(tk)}>
          {/* Brand — uses Logo.jsx (ticket icon, #0CA678) */}
          <div style={{ marginBottom: "22px" }}>
            <Logo size={26} textSize={14} textColor={tk.textSecondary} />
          </div>

          <h2 style={styles.title(tk)}>Create your account</h2>
          <p style={styles.subtitle(tk)}>Fill in your details to start tracking drives</p>

          {error && <div style={styles.errorBox(tk)}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="fd-register-grid">
              {FIELDS.map(({ name, placeholder, type, col }) => (
                <div
                  key={name}
                  style={{ gridColumn: col === "full" ? "1 / -1" : "span 1" }}
                >
                  <label style={styles.label(tk)}>{placeholder}</label>
                  <input
                    name={name}
                    type={type}
                    placeholder={placeholder}
                    value={form[name]}
                    onChange={handleChange}
                    onFocus={() => setFocused(name)}
                    onBlur={() => setFocused(null)}
                    required={["name", "email", "password"].includes(name)}
                    style={{
                      ...styles.input(tk),
                      borderColor: focused === name ? tk.accentLight : tk.glassBorder,
                      boxShadow:   focused === name ? `0 0 0 3px ${tk.accent}26` : "none",
                    }}
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button(tk),
                opacity: loading ? 0.7 : 1,
                cursor:  loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Creating account…" : "Create account"}
            </button>

            <p style={styles.footerText(tk)}>
              Already have an account?{" "}
              <span onClick={() => navigate("/login")} style={styles.footerLink(tk)}>
                Sign in
              </span>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}

// ── Style helpers ─────────────────────────────────────────────────────────────
const styles = {
  page: (tk) => ({
    minHeight: "100vh",
    background: tk.bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 16px",
    fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    position: "relative",
    overflow: "hidden",
  }),

  orb: (bg, top, right, bottom, left, size) => ({
    position: "absolute",
    width: size,
    height: size,
    borderRadius: "50%",
    background: bg,
    filter: "blur(90px)",
    pointerEvents: "none",
    zIndex: 0,
    top, right, bottom, left,
  }),

  card: (tk) => ({
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: "560px",
    background: tk.glass,
    border: `0.5px solid ${tk.glassBorder}`,
    borderRadius: "20px",
    padding: "clamp(24px, 5vw, 36px) clamp(18px, 5vw, 32px)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    boxShadow: tk.shadow,
  }),

  title: (tk) => ({
    fontSize: "clamp(20px, 5vw, 26px)",
    fontWeight: "700",
    letterSpacing: "-1px",
    margin: "0 0 6px",
    background: tk.gradient,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  }),

  subtitle: (tk) => ({
    fontSize: "14px",
    color: tk.textMuted,
    margin: "0 0 24px",
  }),

  errorBox: (tk) => ({
    background: tk.errorBg,
    border: `0.5px solid ${tk.errorBorder}`,
    color: tk.error,
    borderRadius: "10px",
    padding: "10px 14px",
    fontSize: "13px",
    marginBottom: "16px",
  }),

  label: (tk) => ({
    display: "block",
    fontSize: "11px",
    fontWeight: "600",
    color: tk.textMuted,
    textTransform: "uppercase",
    letterSpacing: "0.4px",
    marginBottom: "5px",
  }),

  input: (tk) => ({
    width: "100%",
    padding: "10px 13px",
    border: `1px solid ${tk.glassBorder}`,
    borderRadius: "9px",
    background: tk.inputBg,
    color: tk.text,
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
    fontFamily: "inherit",
    boxSizing: "border-box",
  }),

  button: (tk) => ({
    width: "100%",
    padding: "13px",
    background: tk.accent,
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    letterSpacing: "-0.2px",
    marginBottom: "16px",
    fontFamily: "inherit",
    transition: "opacity 0.15s",
  }),

  footerText: (tk) => ({
    textAlign: "center",
    fontSize: "13px",
    color: tk.textMuted,
    margin: 0,
  }),

  footerLink: (tk) => ({
    color: tk.accentLight,
    fontWeight: "600",
    cursor: "pointer",
  }),
};