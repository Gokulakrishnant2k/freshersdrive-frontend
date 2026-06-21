import { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { DARK, LIGHT } from "../theme/tokens";

const PAGE_SIZE = 6;

function getTagStyle(tag, tk) {
  const map = {
    URGENT: { background: tk.tagUrgentBg, color: tk.tagUrgentText, border: `0.5px solid ${tk.tagUrgentBorder}` },
    HIRING: { background: tk.tagHiringBg, color: tk.tagHiringText, border: `0.5px solid ${tk.tagHiringBorder}` },
    NEW:    { background: tk.tagNewBg,    color: tk.tagNewText,    border: `0.5px solid ${tk.tagNewBorder}` },
  };
  return map[(tag || "").toUpperCase()] || {
    background: tk.tagDefaultBg, color: tk.tagDefaultText, border: `0.5px solid ${tk.tagDefaultBorder}`,
  };
}

export default function Updates() {
  const { auth } = useAuth();
  const { dark } = useTheme();
  const tk = dark ? DARK : LIGHT;
  const s = buildStyles(tk);

  const [updates,    setUpdates]    = useState([]);
  const [title,      setTitle]      = useState("");
  const [message,    setMessage]    = useState("");
  const [tag,        setTag]        = useState("NEW");
  const [loading,    setLoading]    = useState(true);
  const [posting,    setPosting]    = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [page,       setPage]       = useState(1);
  const [focused,    setFocused]    = useState(null);

  useEffect(() => { fetchUpdates(); }, []);

  const fetchUpdates = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/updates");
      setUpdates(res.data || []);
    } catch (err) {
      console.log("Fetch updates error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    if (!title.trim() || !message.trim()) {
      alert("Title and message cannot be empty");
      return;
    }
    try {
      setPosting(true);
      await axios.post("/updates", { title, message, tag });
      setTitle(""); setMessage(""); setTag("NEW");
      setPage(1);
      fetchUpdates();
    } catch (err) {
      console.log("Post error:", err);
      alert("Failed to post update");
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this update? This can't be undone.")) return;
    try {
      setDeletingId(id);
      await axios.delete(`/updates/${id}`);
      setUpdates((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.log("Delete error:", err);
      alert("Failed to delete update");
    } finally {
      setDeletingId(null);
    }
  };

  const totalPages  = Math.max(1, Math.ceil(updates.length / PAGE_SIZE));
  const pageUpdates = updates.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const inputStyle = (name) => ({
    ...s.input,
    borderColor: focused === name ? tk.accentLight : tk.glassBorder,
    boxShadow:   focused === name ? `0 0 0 3px ${tk.accent}26` : "none",
  });

  return (
    <div style={s.page}>
      {/* Background orbs */}
      <div style={{ ...s.orb, top: "-80px", right: "-80px",  background: tk.orb1 }} />
      <div style={{ ...s.orb, bottom: "-60px", left: "-60px", background: tk.orb2, width: "320px", height: "320px" }} />

      <div style={s.inner}>
        {/* Page header */}
        <div style={s.pageHeader}>
          <div style={s.pill}>
            <span style={s.pillDot} />
            <span style={s.pillText}>Live feed</span>
          </div>
          <h1 style={s.pageTitle}>Announcements</h1>
          <p style={s.pageSubtitle}>Latest updates on drives, deadlines, and placement news.</p>
        </div>

        {/* Admin post panel */}
        {auth.role === "ROLE_ADMIN" && (
          <div style={s.postBox}>
            <div style={s.postBoxHeader}>
              <div style={s.postBoxIcon}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
              <span style={s.postBoxTitle}>Post announcement</span>
            </div>

            <input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={() => setFocused("title")}
              onBlur={() => setFocused(null)}
              style={inputStyle("title")}
            />
            <textarea
              placeholder="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onFocus={() => setFocused("message")}
              onBlur={() => setFocused(null)}
              style={{ ...s.textarea, ...inputStyle("message") }}
            />
            <div style={s.postRow}>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                style={{ ...inputStyle("select"), ...s.select }}
                onFocus={() => setFocused("select")}
                onBlur={() => setFocused(null)}
              >
                <option value="NEW">NEW</option>
                <option value="HIRING">HIRING</option>
                <option value="URGENT">URGENT</option>
              </select>
              <button
                onClick={handlePost}
                disabled={posting}
                style={{ ...s.postBtn, opacity: posting ? 0.6 : 1, cursor: posting ? "not-allowed" : "pointer" }}
              >
                {posting ? "Posting…" : "Post update"}
              </button>
            </div>
          </div>
        )}

        {/* Feed */}
        <div style={s.feed}>
          {loading ? (
            <div style={s.stateText}>Loading updates…</div>
          ) : updates.length === 0 ? (
            <div style={s.stateText}>No updates yet.</div>
          ) : (
            pageUpdates.map((u) => {
              const ts = getTagStyle(u.tag, tk);
              return (
                <div key={u.id} style={s.card}>
                  <div style={s.cardHeader}>
                    <h3 style={s.cardTitle}>{u.title}</h3>
                    <div style={s.cardRight}>
                      <span style={{ ...s.tag, ...ts }}>{u.tag || "INFO"}</span>
                      {auth.role === "ROLE_ADMIN" && (
                        <button
                          style={{ ...s.deleteBtn, opacity: deletingId === u.id ? 0.5 : 1 }}
                          onClick={() => handleDelete(u.id)}
                          disabled={deletingId === u.id}
                          title="Delete update"
                        >
                          {deletingId === u.id ? "…" : "✕"}
                        </button>
                      )}
                    </div>
                  </div>
                  <p style={s.cardMessage}>{u.message}</p>
                  <small style={s.cardTime}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleString() : ""}
                  </small>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {!loading && updates.length > PAGE_SIZE && (
          <div style={s.pagination}>
            <button
              style={{ ...s.pageBtn, ...(page === 1 ? s.pageBtnOff : {}) }}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ← Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                style={{ ...s.pageBtn, ...(n === page ? s.pageBtnActive : {}) }}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            ))}

            <button
              style={{ ...s.pageBtn, ...(page === totalPages ? s.pageBtnOff : {}) }}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function buildStyles(tk) {
  return {
    page: {
      minHeight: "100vh",
      background: tk.bg,
      fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
      position: "relative",
      overflow: "hidden",
      padding: "0 0 60px",
    },
    orb: {
      position: "absolute",
      width: "400px",
      height: "400px",
      borderRadius: "50%",
      filter: "blur(90px)",
      pointerEvents: "none",
      zIndex: 0,
    },
    inner: {
      position: "relative",
      zIndex: 1,
      maxWidth: "720px",
      margin: "0 auto",
      padding: "52px 24px 0",
    },

    pageHeader: { marginBottom: "36px" },
    pill: {
      display: "inline-flex", alignItems: "center", gap: "8px",
      background: tk.accent + "26",
      border: `0.5px solid ${tk.accent}66`,
      borderRadius: "999px", padding: "5px 14px", marginBottom: "18px",
    },
    pillDot: {
      display: "block", width: "7px", height: "7px",
      borderRadius: "50%", background: tk.accentLight,
    },
    pillText: { fontSize: "12px", color: tk.accentLight, fontWeight: "500" },
    pageTitle: {
      fontSize: "36px", fontWeight: "700", letterSpacing: "-1.2px",
      margin: "0 0 10px",
      background: tk.gradient,
      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
    },
    pageSubtitle: {
      fontSize: "15px", color: tk.textSecondary, lineHeight: "1.6", margin: 0,
    },

    postBox: {
      background: tk.glass,
      border: `0.5px solid ${tk.glassBorder}`,
      borderRadius: "16px", padding: "22px 22px 18px",
      marginBottom: "28px",
      display: "flex", flexDirection: "column", gap: "12px",
      backdropFilter: "blur(12px)",
      boxShadow: tk.shadow,
    },
    postBoxHeader: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" },
    postBoxIcon: {
      width: "26px", height: "26px", background: tk.accent, borderRadius: "7px",
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    },
    postBoxTitle: { fontSize: "14px", fontWeight: "700", color: tk.text, letterSpacing: "-0.2px" },
    input: {
      padding: "10px 13px",
      border: `1px solid ${tk.glassBorder}`,
      borderRadius: "9px",
      background: tk.inputBg,
      color: tk.text,
      fontSize: "14px",
      outline: "none",
      transition: "border-color 0.15s, box-shadow 0.15s",
      fontFamily: "inherit",
      width: "100%",
      boxSizing: "border-box",
    },
    textarea: {
      minHeight: "90px",
      resize: "none",
      width: "100%",
      boxSizing: "border-box",
    },
    postRow: { display: "flex", gap: "10px", alignItems: "center" },
    select: {
      flex: 1,
      cursor: "pointer",
      appearance: "none",
      WebkitAppearance: "none",
      minWidth: 0,
      colorScheme: tk === DARK ? "dark" : "light",
    },
    postBtn: {
      padding: "10px 20px",
      background: tk.accent,
      color: "white",
      border: "none",
      borderRadius: "9px",
      fontSize: "13.5px",
      fontWeight: "600",
      fontFamily: "inherit",
      whiteSpace: "nowrap",
      letterSpacing: "-0.1px",
      transition: "opacity 0.15s",
    },

    feed: { display: "flex", flexDirection: "column", gap: "12px" },
    stateText: {
      textAlign: "center", padding: "60px 20px",
      color: tk.textMuted, fontSize: "14px",
    },
    card: {
      background: tk.glass,
      border: `0.5px solid ${tk.glassBorder}`,
      borderRadius: "14px",
      padding: "18px 20px",
      backdropFilter: "blur(8px)",
      transition: "border-color 0.15s",
    },
    cardHeader: {
      display: "flex", justifyContent: "space-between",
      alignItems: "flex-start", marginBottom: "8px", gap: "12px",
    },
    cardTitle: {
      fontSize: "15px", fontWeight: "700",
      color: tk.text, margin: 0, letterSpacing: "-0.3px",
    },
    cardRight: { display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 },
    tag: {
      padding: "3px 10px", borderRadius: "999px",
      fontSize: "11px", fontWeight: "700", letterSpacing: "0.2px",
    },
    deleteBtn: {
      background: tk.errorBg,
      border: `0.5px solid ${tk.errorBorder}`,
      color: tk.error,
      width: "24px", height: "24px",
      borderRadius: "6px", fontSize: "11px",
      cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 0, flexShrink: 0,
    },
    cardMessage: {
      fontSize: "14px", color: tk.textSecondary,
      lineHeight: "1.65", margin: "0 0 10px",
    },
    cardTime: { fontSize: "11.5px", color: tk.textMuted, fontWeight: "500" },

    pagination: {
      display: "flex", alignItems: "center", justifyContent: "center",
      gap: "6px", marginTop: "28px", flexWrap: "wrap",
    },
    pageBtn: {
      padding: "7px 14px", fontSize: "13px", fontWeight: "500",
      fontFamily: "inherit", border: `0.5px solid ${tk.glassBorder}`,
      borderRadius: "8px", cursor: "pointer",
      background: tk.glass, color: tk.textSecondary,
      transition: "background 0.15s",
    },
    pageBtnActive: {
      background: tk.accent, borderColor: tk.accent,
      color: "white", fontWeight: "700",
    },
    pageBtnOff: { opacity: 0.3, cursor: "not-allowed" },
  };
}