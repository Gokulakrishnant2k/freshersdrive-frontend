import { useState } from "react";
import axios from "../api/axiosInstance";
import { useTheme } from "../context/ThemeContext";
import { DARK, LIGHT } from "../theme/tokens";

export default function Contact() {
  const { dark } = useTheme();
  const tk = dark ? DARK : LIGHT;
  const styles = buildStyles(tk);

  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [focused, setFocused] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

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

  return (
    <div style={styles.page}>
      {/* Background orbs */}
      <div style={{ ...styles.orb, top: "-80px", right: "-80px", background: tk.orb1 }} />
      <div style={{ ...styles.orb, bottom: "-60px", left: "-60px", background: tk.orb2, width: "320px", height: "320px" }} />
      <div style={{ ...styles.orb, top: "40%", left: "30%", background: tk.orb3, width: "280px", height: "280px" }} />

      <div style={styles.card}>
        {/* Brand mark */}
        <div style={styles.brandMark}>
          <div style={styles.brandIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span style={styles.brandName}>FreshersDrive · Contact</span>
        </div>

        <h1 style={styles.title}>Get in touch</h1>
        <p style={styles.subtitle}>
          Questions about placements, drives, or anything else? We'll get back to you fast.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {[
            { name: "name",  placeholder: "Your name",  type: "text"  },
            { name: "email", placeholder: "Your email", type: "email" },
          ].map(({ name, placeholder, type }) => (
            <div key={name} style={styles.fieldWrap}>
              <label style={styles.label}>{placeholder}</label>
              <input
                name={name}
                type={type}
                placeholder={placeholder}
                value={form[name]}
                onChange={handleChange}
                onFocus={() => setFocused(name)}
                onBlur={() => setFocused(null)}
                required
                style={{
                  ...styles.input,
                  borderColor: focused === name ? tk.accentLight : tk.glassBorder,
                  boxShadow: focused === name ? `0 0 0 3px ${tk.accent}26` : "none",
                }}
              />
            </div>
          ))}

          <div style={styles.fieldWrap}>
            <label style={styles.label}>Your message</label>
            <textarea
              name="message"
              placeholder="Tell us what's on your mind…"
              value={form.message}
              onChange={handleChange}
              onFocus={() => setFocused("message")}
              onBlur={() => setFocused(null)}
              required
              style={{
                ...styles.textarea,
                borderColor: focused === "message" ? tk.accentLight : tk.glassBorder,
                boxShadow: focused === "message" ? `0 0 0 3px ${tk.accent}26` : "none",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.button, opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Sending…" : "Send message"}
          </button>

          {success && (
            <div style={styles.successBox}>
              <span style={{ color: tk.success, fontSize: "15px" }}>✓</span>
              Message sent! We'll be in touch soon.
            </div>
          )}
        </form>

        {/* Info strip */}
        <div style={styles.infoStrip}>
          {[
            { icon: "📧", label: "Email", value: "support@freshersdrive.in" },
            { icon: "⏱", label: "Response", value: "Within 24 hours" },
          ].map(({ icon, label, value }) => (
            <div key={label} style={styles.infoItem}>
              <span style={{ fontSize: "16px" }}>{icon}</span>
              <div>
                <div style={styles.infoLabel}>{label}</div>
                <div style={styles.infoValue}>{value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function buildStyles(tk) {
  return {
    page: {
      minHeight: "100vh",
      background: tk.bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
      fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
      position: "relative",
      overflow: "hidden",
    },
    orb: {
      position: "absolute",
      width: "400px",
      height: "400px",
      borderRadius: "50%",
      filter: "blur(80px)",
      pointerEvents: "none",
      zIndex: 0,
    },
    card: {
      position: "relative",
      zIndex: 1,
      width: "100%",
      maxWidth: "480px",
      background: tk.glass,
      border: `0.5px solid ${tk.glassBorder}`,
      borderRadius: "20px",
      padding: "36px 32px",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      boxShadow: tk.shadow,
    },
    brandMark: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginBottom: "24px",
    },
    brandIcon: {
      width: "28px",
      height: "28px",
      background: tk.accent,
      borderRadius: "7px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    brandName: {
      fontSize: "13px",
      fontWeight: "600",
      color: tk.textSecondary,
      letterSpacing: "-0.1px",
    },
    title: {
      fontSize: "28px",
      fontWeight: "700",
      letterSpacing: "-1px",
      margin: "0 0 8px",
      background: tk.gradient,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    },
    subtitle: {
      fontSize: "14px",
      color: tk.textSecondary,
      lineHeight: "1.6",
      margin: "0 0 28px",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    },
    fieldWrap: {
      display: "flex",
      flexDirection: "column",
      gap: "6px",
    },
    label: {
      fontSize: "11px",
      fontWeight: "600",
      color: tk.textMuted,
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    input: {
      padding: "11px 14px",
      borderRadius: "10px",
      border: `1px solid ${tk.glassBorder}`,
      background: tk.inputBg,
      color: tk.text,
      fontSize: "14px",
      outline: "none",
      transition: "border-color 0.15s, box-shadow 0.15s",
      fontFamily: "inherit",
    },
    textarea: {
      padding: "11px 14px",
      borderRadius: "10px",
      border: `1px solid ${tk.glassBorder}`,
      background: tk.inputBg,
      color: tk.text,
      fontSize: "14px",
      outline: "none",
      minHeight: "120px",
      resize: "vertical",
      transition: "border-color 0.15s, box-shadow 0.15s",
      fontFamily: "inherit",
    },
    button: {
      padding: "13px",
      borderRadius: "10px",
      border: "none",
      background: tk.accent,
      color: "white",
      fontWeight: "600",
      fontSize: "14px",
      letterSpacing: "-0.2px",
      transition: "opacity 0.15s",
      fontFamily: "inherit",
      marginTop: "4px",
    },
    successBox: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      background: tk.successBg,
      border: `0.5px solid ${tk.successBorder}`,
      borderRadius: "10px",
      padding: "12px 16px",
      fontSize: "13.5px",
      color: tk.textSecondary,
      fontWeight: "500",
    },
    infoStrip: {
      display: "flex",
      gap: "16px",
      marginTop: "28px",
      paddingTop: "24px",
      borderTop: `0.5px solid ${tk.divider}`,
    },
    infoItem: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      flex: 1,
    },
    infoLabel: {
      fontSize: "10px",
      fontWeight: "700",
      color: tk.textMuted,
      textTransform: "uppercase",
      letterSpacing: "0.4px",
    },
    infoValue: {
      fontSize: "12px",
      color: tk.textSecondary,
      fontWeight: "500",
      marginTop: "1px",
    },
  };
}