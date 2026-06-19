import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";

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
    <div style={s.page}>
      {/* Background orbs */}
      <div style={{ ...s.orb, top: "-100px", right: "-100px", background: "rgba(99,102,241,0.2)" }} />
      <div style={{ ...s.orb, bottom: "-80px", left: "-80px", background: "rgba(16,185,129,0.12)", width: "340px", height: "340px" }} />
      <div style={{ ...s.orb, top: "35%", left: "20%", background: "rgba(192,132,252,0.07)", width: "300px", height: "300px" }} />

      <div style={s.card}>
        {/* Brand */}
        <div style={s.brandMark}>
          <div style={s.brandIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <span style={s.brandName}>FreshersDrive</span>
        </div>

        <h2 style={s.title}>Create your account</h2>
        <p style={s.subtitle}>Fill in your details to start tracking drives</p>

        {error && <div style={s.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={s.grid}>
            {FIELDS.map(({ name, placeholder, type, col }) => (
              <div key={name} style={{ gridColumn: col === "full" ? "1 / -1" : "span 1" }}>
                <label style={s.label}>{placeholder}</label>
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
                    ...s.input,
                    borderColor: focused === name ? "rgba(99,102,241,0.7)" : "rgba(255,255,255,0.1)",
                    boxShadow: focused === name ? "0 0 0 3px rgba(99,102,241,0.15)" : "none",
                  }}
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...s.button, opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Creating account…" : "Create account"}
          </button>

          <p style={s.footerText}>
            Already have an account?{" "}
            <span onClick={() => navigate("/login")} style={s.footerLink}>
              Sign in
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    background: "#0c0b2b",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    fontFamily: "'Inter', 'SF Pro Display', system-ui, -apple-system, sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  orb: {
    position: "absolute",
    width: "420px",
    height: "420px",
    borderRadius: "50%",
    filter: "blur(90px)",
    pointerEvents: "none",
    zIndex: 0,
  },
  card: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: "560px",
    background: "rgba(255,255,255,0.04)",
    border: "0.5px solid rgba(255,255,255,0.12)",
    borderRadius: "20px",
    padding: "36px 32px",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
  },
  brandMark: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "22px",
  },
  brandIcon: {
    width: "28px",
    height: "28px",
    background: "#6366f1",
    borderRadius: "7px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    fontSize: "14px",
    fontWeight: "700",
    color: "rgba(255,255,255,0.6)",
    letterSpacing: "-0.2px",
  },
  title: {
    fontSize: "26px",
    fontWeight: "700",
    letterSpacing: "-1px",
    margin: "0 0 6px",
    background: "linear-gradient(135deg, #818cf8 0%, #c084fc 60%, #f472b6 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  subtitle: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.4)",
    margin: "0 0 24px",
  },
  errorBox: {
    background: "rgba(239,68,68,0.1)",
    border: "0.5px solid rgba(239,68,68,0.4)",
    color: "#fca5a5",
    borderRadius: "10px",
    padding: "10px 14px",
    fontSize: "13px",
    marginBottom: "16px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontSize: "11px",
    fontWeight: "600",
    color: "rgba(255,255,255,0.3)",
    textTransform: "uppercase",
    letterSpacing: "0.4px",
    marginBottom: "5px",
  },
  input: {
    width: "100%",
    padding: "10px 13px",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "9px",
    background: "rgba(255,255,255,0.05)",
    color: "white",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "13px",
    background: "#6366f1",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    letterSpacing: "-0.2px",
    marginBottom: "16px",
    fontFamily: "inherit",
    transition: "opacity 0.15s",
  },
  footerText: {
    textAlign: "center",
    fontSize: "13px",
    color: "rgba(255,255,255,0.35)",
    margin: 0,
  },
  footerLink: {
    color: "#818cf8",
    fontWeight: "600",
    cursor: "pointer",
  },
};