import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import axios from "../api/axiosInstance";

export default function Contact() {
  const { dark } = useTheme();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      await axios.post("/contact", form);
      setSuccess(true);
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      console.log("Contact error:", err);
      alert("Failed to send message");
    }
    setLoading(false);
  };

  const t = dark ? dm : s;

  return (
    <div style={t.page}>
      <div style={t.card}>
        <h1 style={t.title}>Contact Us</h1>
        <p style={t.subtitle}>
          Have questions? We're here to help you with placements & drives.
        </p>

        <form onSubmit={handleSubmit} style={s.form}>
          <input
            name="name"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            style={t.input}
            required
          />
          <input
            name="email"
            placeholder="Your Email"
            value={form.email}
            onChange={handleChange}
            style={t.input}
            required
          />
          <textarea
            name="message"
            placeholder="Your Message..."
            value={form.message}
            onChange={handleChange}
            style={t.textarea}
            required
          />
          <button style={s.button} disabled={loading}>
            {loading ? "Sending..." : "Send Message"}
          </button>
          {success && <p style={s.success}>✔ Message sent successfully!</p>}
        </form>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f8fafc",
    fontFamily: "Inter, Arial",
    padding: "20px",
  },
  card: {
    width: "100%",
    maxWidth: "500px",
    background: "white",
    padding: "30px",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    border: "1px solid #f1f5f9",
  },
  title: {
    marginBottom: "5px",
    fontSize: "26px",
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitle: {
    marginBottom: "20px",
    color: "#64748b",
    fontSize: "14px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  input: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    outline: "none",
    fontSize: "14px",
    background: "#f8fafc",
    color: "#0f172a",
  },
  textarea: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    minHeight: "120px",
    resize: "none",
    fontSize: "14px",
    background: "#f8fafc",
    color: "#0f172a",
  },
  button: {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "#2563eb",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "14px",
  },
  success: {
    color: "#16a34a",
    fontSize: "13px",
    marginTop: "10px",
  },
};

const dm = {
  ...s,
  page:     { ...s.page,     background: "#0f172a" },
  card:     { ...s.card,     background: "#1e293b", border: "1px solid #334155", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" },
  title:    { ...s.title,    color: "#f1f5f9" },
  subtitle: { ...s.subtitle, color: "#64748b" },
  input:    { ...s.input,    background: "#0f172a", border: "1px solid #334155", color: "#f1f5f9" },
  textarea: { ...s.textarea, background: "#0f172a", border: "1px solid #334155", color: "#f1f5f9" },
};