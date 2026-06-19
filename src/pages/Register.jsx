import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import axios from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const { dark } = useTheme();

  const [form, setForm] = useState({
    name: "", email: "", password: "",
    degree: "", branch: "", cgpa: "",
    batchYear: "", college: "", phone: "",
  });

  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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

  const t = dark ? dm : s;

  const fields = [
    { name: "name",      placeholder: "Full Name",  type: "text"     },
    { name: "email",     placeholder: "Email",      type: "email"    },
    { name: "password",  placeholder: "Password",   type: "password" },
    { name: "degree",    placeholder: "Degree",     type: "text"     },
    { name: "branch",    placeholder: "Branch",     type: "text"     },
    { name: "cgpa",      placeholder: "CGPA",       type: "text"     },
    { name: "batchYear", placeholder: "Batch Year", type: "text"     },
    { name: "college",   placeholder: "College",    type: "text"     },
    { name: "phone",     placeholder: "Phone",      type: "text"     },
  ];

  return (
    <div style={t.page}>
      <div style={t.card}>
        <div style={s.brandMark}>
          <div style={s.brandIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <span style={t.brandName}>FreshersDrive</span>
        </div>

        <h2 style={t.title}>Create your account</h2>
        <p style={t.subtitle}>Fill in your details to get started</p>

        {error && <div style={s.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={s.grid}>
            {fields.map(({ name, placeholder, type }) => (
              <div key={name} style={s.field}>
                <label style={s.label}>{placeholder}</label>
                <input
                  name={name}
                  type={type}
                  placeholder={placeholder}
                  value={form[name]}
                  onChange={handleChange}
                  style={t.input}
                  required={["name", "email", "password"].includes(name)}
                  onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                  onBlur={(e)  => (e.target.style.borderColor = dark ? "#334155" : "#e2e8f0")}
                />
              </div>
            ))}
          </div>

          <button type="submit" disabled={loading} style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Registering..." : "Register"}
          </button>

          <p style={t.footerText}>
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

export default Register;

// ── LIGHT ────────────────────────────────────────────────────────────────────
const s = {
  page: {
    minHeight: "100vh", background: "#f8fafc",
    fontFamily: "'Inter', system-ui, sans-serif",
    display: "flex", alignItems: "center",
    justifyContent: "center", padding: "32px 20px",
  },
  card: {
    width: "100%", maxWidth: "560px",
    background: "white", borderRadius: "16px",
    border: "1px solid #f1f5f9",
    boxShadow: "0 4px 16px rgba(0,0,0,0.06)", padding: "32px",
  },
  brandMark: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" },
  brandIcon: {
    width: "28px", height: "28px", background: "#2563eb",
    borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center",
  },
  brandName: { fontSize: "14px", fontWeight: "700", color: "#0f172a" },
  title:     { fontSize: "22px", fontWeight: "700", color: "#0f172a", margin: "0 0 4px" },
  subtitle:  { fontSize: "14px", color: "#64748b", margin: "0 0 24px" },
  errorBox: {
    background: "#fef2f2", border: "1px solid #fecaca",
    color: "#b91c1c", borderRadius: "8px",
    padding: "10px 14px", fontSize: "13px", marginBottom: "1rem",
  },
  grid:      { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" },
  field:     { display: "flex", flexDirection: "column", gap: "5px" },
  label: {
    fontSize: "11px", fontWeight: "600", color: "#94a3b8",
    textTransform: "uppercase", letterSpacing: "0.4px",
  },
  input: {
    padding: "9px 12px", border: "1px solid #e2e8f0",
    borderRadius: "8px", fontSize: "14px",
    background: "#f8fafc", color: "#0f172a",
    outline: "none", boxSizing: "border-box",
    width: "100%", transition: "border-color 0.15s",
  },
  btn: {
    width: "100%", padding: "11px", background: "#2563eb",
    color: "white", border: "none", borderRadius: "8px",
    fontSize: "14px", fontWeight: "600", cursor: "pointer", marginBottom: "16px",
  },
  footerText: { textAlign: "center", fontSize: "13px", color: "#64748b", margin: 0 },
  footerLink: { color: "#2563eb", fontWeight: "500", cursor: "pointer" },
};

// ── DARK ─────────────────────────────────────────────────────────────────────
const dm = {
  ...s,
  page:      { ...s.page,      background: "#0f172a" },
  card:      { ...s.card,      background: "#1e293b", border: "1px solid #334155", boxShadow: "0 4px 16px rgba(0,0,0,0.3)" },
  brandName: { ...s.brandName, color: "#f1f5f9" },
  title:     { ...s.title,     color: "#f1f5f9" },
  subtitle:  { ...s.subtitle,  color: "#64748b" },
  input:     { ...s.input,     background: "#0f172a", border: "1px solid #334155", color: "#f1f5f9" },
  footerText:{ ...s.footerText,color: "#64748b" },
};