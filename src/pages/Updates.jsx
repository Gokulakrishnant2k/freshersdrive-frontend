import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import axios from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const PAGE_SIZE = 6;

export default function Updates() {
  const { auth } = useAuth();
  const { dark } = useTheme();

  const [updates, setUpdates] = useState([]);
  const [title,   setTitle]   = useState("");
  const [message, setMessage] = useState("");
  const [tag,     setTag]     = useState("NEW");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [page, setPage] = useState(1);

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

  const getTagStyle = (tag) => {
    switch ((tag || "").toUpperCase()) {
      case "URGENT":  return { background: "#fee2e2", color: "#dc2626" };
      case "HIRING":  return { background: "#dcfce7", color: "#16a34a" };
      case "NEW":     return { background: "#dbeafe", color: "#2563eb" };
      default:        return { background: "#e2e8f0", color: "#475569" };
    }
  };

  const totalPages = Math.max(1, Math.ceil(updates.length / PAGE_SIZE));
  const pageUpdates = updates.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const t = dark ? dm : s;

  return (
    <div style={t.page}>
      <h1 style={t.title}>📢 Updates</h1>

      {/* ADMIN POST PANEL */}
      {auth.role === "ROLE_ADMIN" && (
        <div style={t.postBox}>
          <h3 style={t.postTitle}>Create Announcement</h3>

          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={t.input}
          />
          <textarea
            placeholder="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={t.textarea}
          />
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            style={t.input}
          >
            <option value="NEW">NEW</option>
            <option value="HIRING">HIRING</option>
            <option value="URGENT">URGENT</option>
          </select>

          <button
            onClick={handlePost}
            style={{ ...s.button, opacity: posting ? 0.6 : 1, cursor: posting ? "not-allowed" : "pointer" }}
            disabled={posting}
          >
            {posting ? "Posting..." : "Post Update"}
          </button>
        </div>
      )}

      {/* FEED */}
      <div style={s.feed}>
        {loading ? (
          <p style={t.stateText}>Loading updates...</p>
        ) : updates.length === 0 ? (
          <p style={t.stateText}>No updates yet</p>
        ) : (
          pageUpdates.map((u) => (
            <div key={u.id} style={t.card}>
              <div style={s.header}>
                <h3 style={{ ...t.cardTitle, margin: 0 }}>{u.title}</h3>
                <div style={s.headerRight}>
                  <span style={{ ...s.tag, ...getTagStyle(u.tag) }}>
                    {u.tag || "INFO"}
                  </span>
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
              <p style={t.cardMessage}>{u.message}</p>
              <small style={s.time}>
                {u.createdAt ? new Date(u.createdAt).toLocaleString() : ""}
              </small>
            </div>
          ))
        )}
      </div>

      {/* PAGINATION */}
      {!loading && updates.length > PAGE_SIZE && (
        <div style={s.pagination}>
          <button
            style={{ ...t.pageBtn, ...(page === 1 ? s.pageBtnDisabled : {}) }}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ← Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              style={{ ...t.pageBtn, ...(n === page ? s.pageBtnActive : {}) }}
              onClick={() => setPage(n)}
            >
              {n}
            </button>
          ))}

          <button
            style={{ ...t.pageBtn, ...(page === totalPages ? s.pageBtnDisabled : {}) }}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

// ── LIGHT ────────────────────────────────────────────────────────────────────
const s = {
  page: {
    padding: "24px 20px",
    background: "#f8fafc",
    minHeight: "100vh",
    fontFamily: "Inter, Arial",
    maxWidth: "760px",
    margin: "0 auto",
  },
  title: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: "20px",
  },
  postBox: {
    background: "white",
    padding: "20px",
    borderRadius: "14px",
    marginBottom: "20px",
    border: "1px solid #f1f5f9",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  postTitle: { fontSize: "15px", fontWeight: "600", color: "#0f172a", margin: 0 },
  input: {
    width: "100%",
    padding: "9px 12px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    background: "#f8fafc",
    color: "#0f172a",
    outline: "none",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "9px 12px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    background: "#f8fafc",
    color: "#0f172a",
    outline: "none",
    minHeight: "90px",
    resize: "none",
    boxSizing: "border-box",
  },
  button: {
    background: "#2563eb",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    alignSelf: "flex-start",
  },
  feed: { display: "flex", flexDirection: "column", gap: "12px" },
  stateText: { color: "#94a3b8", fontSize: "14px" },
  card: {
    background: "white",
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid #f1f5f9",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  cardTitle:   { fontSize: "15px", fontWeight: "600", color: "#0f172a" },
  cardMessage: { marginTop: "8px", color: "#475569", fontSize: "14px", lineHeight: "1.6" },
  header:      { display: "flex", justifyContent: "space-between", alignItems: "center" },
  headerRight: { display: "flex", alignItems: "center", gap: "8px" },
  tag:    { padding: "4px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "600" },
  time:   { fontSize: "12px", color: "#94a3b8" },
  deleteBtn: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#dc2626",
    width: "24px",
    height: "24px",
    borderRadius: "6px",
    fontSize: "12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    flexShrink: 0,
  },
  pagination: {
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: "6px", marginTop: "24px", paddingBottom: "8px", flexWrap: "wrap",
  },
  pageBtn: {
    padding: "7px 13px", fontSize: "13px", fontWeight: "500",
    fontFamily: "inherit", letterSpacing: "-0.1px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px", cursor: "pointer",
    background: "white", color: "#374151",
  },
  pageBtnActive: {
    background: "#2563eb", borderColor: "#2563eb",
    color: "white", fontWeight: "600",
  },
  pageBtnDisabled: { opacity: 0.35, cursor: "not-allowed" },
};

// ── DARK ─────────────────────────────────────────────────────────────────────
const dm = {
  ...s,
  page:        { ...s.page,        background: "#0f172a" },
  title:       { ...s.title,       color: "#f1f5f9" },
  postBox:     { ...s.postBox,     background: "#1e293b", border: "1px solid #334155", boxShadow: "none" },
  postTitle:   { ...s.postTitle,   color: "#f1f5f9" },
  input:       { ...s.input,       background: "#0f172a", border: "1px solid #334155", color: "#f1f5f9" },
  textarea:    { ...s.textarea,    background: "#0f172a", border: "1px solid #334155", color: "#f1f5f9" },
  stateText:   { ...s.stateText,   color: "#475569" },
  card:        { ...s.card,        background: "#1e293b", border: "1px solid #334155", boxShadow: "none" },
  cardTitle:   { ...s.cardTitle,   color: "#f1f5f9" },
  cardMessage: { ...s.cardMessage, color: "#94a3b8" },
  pageBtn:     { ...s.pageBtn,     background: "#1e293b", borderColor: "#334155", color: "#94a3b8" },
};