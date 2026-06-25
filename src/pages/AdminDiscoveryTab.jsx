import { useEffect, useState, useCallback } from "react";
import axios from "../api/axiosInstance";
import { Pagination, deadlineBadge } from "./AdminDashboard";

const PAGE_SIZE = 10;

// ─── tiny spinner ─────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <span style={{
      display: "inline-block", width: "12px", height: "12px",
      border: "2px solid currentColor", borderTopColor: "transparent",
      borderRadius: "50%", animation: "spin 0.7s linear infinite", verticalAlign: "middle", marginRight: "6px",
    }} />
  );
}

// inject keyframe once
if (typeof document !== "undefined" && !document.getElementById("_spin_kf")) {
  const s = document.createElement("style");
  s.id = "_spin_kf";
  s.textContent = "@keyframes spin{to{transform:rotate(360deg)}}";
  document.head.appendChild(s);
}

// ─── trigger button with inline status ───────────────────────────────────────
function TriggerBtn({ label, icon, onClick, status, accentColor, dark }) {
  const idle    = !status;
  const running = status?.state === "running";
  const done    = status?.state === "done";
  const failed  = status?.state === "error";

  const statusColor = done ? (dark ? "#4ade80" : "#15803d")
    : failed ? (dark ? "#f87171" : "#b91c1c")
    : (dark ? "#38bdf8" : "#1d4ed8");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <button
        disabled={running}
        onClick={onClick}
        style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "9px 18px", borderRadius: "8px",
          border: `1px solid ${accentColor}55`,
          background: running ? (dark ? "#1e293b" : "#f1f5f9") : "transparent",
          color: accentColor,
          fontSize: "13px", fontWeight: "600", cursor: running ? "not-allowed" : "pointer",
          opacity: running ? 0.7 : 1, transition: "opacity 0.15s",
        }}
      >
        {running ? <Spinner /> : <span>{icon}</span>}
        {running ? "Running…" : label}
      </button>
      {(done || failed) && (
        <span style={{ fontSize: "12px", color: statusColor, paddingLeft: "4px" }}>
          {done && `✓ ${status.message}`}
          {failed && `✕ ${status.message}`}
        </span>
      )}
    </div>
  );
}

// ─── edit modal for a pending / rejected drive ────────────────────────────────
function EditModal({ drive, dark, onClose, onSave, onSaveAndApprove }) {
  const cardBorder  = dark ? "#334155" : "#e2e8f0";
  const textPrimary = dark ? "#f1f5f9" : "#0f172a";
  const textSec     = dark ? "#94a3b8" : "#64748b";
  const inputBg     = dark ? "#0f172a" : "#f8fafc";
  const inputBorder = dark ? "#475569" : "#e2e8f0";
  const inputColor  = dark ? "#f1f5f9" : "#0f172a";
  const overlayBg   = dark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.4)";

  const inputStyle = {
    padding: "9px 12px", border: `1px solid ${inputBorder}`, borderRadius: "7px",
    fontSize: "13px", background: inputBg, color: inputColor,
    outline: "none", width: "100%", boxSizing: "border-box",
  };

  const [form, setForm] = useState({
    companyName:      drive.companyName      || "",
    jobRole:          drive.jobRole          || "",
    jobDescription:   drive.jobDescription   || "",
    keySkills:        drive.keySkills        || "",
    location:         drive.location         || "",
    ctcDisplay:       drive.ctcDisplay       || "",
    minCgpa:          drive.minCgpa          ?? "",
    deadline:         drive.deadline         || "",
    eligibleBranches: drive.eligibleBranches || "",
    eligibleBatches:  drive.eligibleBatches  || "",
    experienceLevel:  drive.experienceLevel  || "Freshers",
    category:         drive.category         || "IT_SOFTWARE",
    status:           drive.status           || "ACTIVE",
    jobType:          drive.jobType          || "Full-Time",
    applyLink:        drive.applyLink        || "",
    autoDeleteEnabled: drive.autoDeleteEnabled ?? true,
  });

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
      background: overlayBg, padding: "16px",
    }} onClick={onClose}>
      <div
        style={{
          background: dark ? "#1e293b" : "#ffffff", border: `1px solid ${cardBorder}`,
          borderRadius: "14px", padding: "24px", width: "100%", maxWidth: "720px",
          maxHeight: "90vh", overflowY: "auto",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: "700", color: textPrimary, margin: 0 }}>Edit discovered drive</h3>
          <button onClick={onClose} style={{ background: "transparent", border: "none", fontSize: "18px", color: textSec, cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "12px" }}>
          {[
            { key: "companyName",      label: "Company name"        },
            { key: "jobRole",          label: "Job role"            },
            { key: "location",         label: "Location"            },
            { key: "ctcDisplay",       label: "CTC"                 },
            { key: "minCgpa",          label: "Min CGPA"            },
            { key: "eligibleBranches", label: "Eligible branches"   },
            { key: "eligibleBatches",  label: "Eligible batches"    },
            { key: "applyLink",        label: "Apply link"          },
            { key: "keySkills",        label: "Key skills"          },
          ].map(({ key, label }) => (
            <div key={key} style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "11px", fontWeight: "600", color: textSec, textTransform: "uppercase", letterSpacing: "0.4px" }}>{label}</label>
              <input style={inputStyle} value={form[key]} onChange={set(key)} />
            </div>
          ))}

          {/* Status — always shown in edit, default ACTIVE */}
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ fontSize: "11px", fontWeight: "600", color: textSec, textTransform: "uppercase", letterSpacing: "0.4px" }}>Status</label>
            <select style={inputStyle} value={form.status} onChange={set("status")}>
              {[["ACTIVE","Active"],["UPCOMING","Upcoming"],["CLOSED","Closed"],["EXPIRED","Expired"]].map(([v,l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ fontSize: "11px", fontWeight: "600", color: textSec, textTransform: "uppercase", letterSpacing: "0.4px" }}>Category</label>
            <select style={inputStyle} value={form.category} onChange={set("category")}>
              {[["IT_SOFTWARE","IT / Software"],["CORE_ENGINEERING","Core Engineering"],["GOVERNMENT","Government"],["BANKING","Banking"],["MANAGEMENT","Management"],["INTERNSHIP","Internship"],["OTHERS","Others"]].map(([v,l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ fontSize: "11px", fontWeight: "600", color: textSec, textTransform: "uppercase", letterSpacing: "0.4px" }}>Job type</label>
            <select style={inputStyle} value={form.jobType} onChange={set("jobType")}>
              {[["Full-Time","Full-Time"],["Internship","Internship"],["Contract","Contract"]].map(([v,l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ fontSize: "11px", fontWeight: "600", color: textSec, textTransform: "uppercase", letterSpacing: "0.4px" }}>Experience level</label>
            <select style={inputStyle} value={form.experienceLevel} onChange={set("experienceLevel")}>
              {[["Freshers","Freshers"],["0-1 Years","0-1 Years"],["1-2 Years","1-2 Years"],["2-3 Years","2-3 Years"],["3+ Years","3+ Years"]].map(([v,l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ fontSize: "11px", fontWeight: "600", color: textSec, textTransform: "uppercase", letterSpacing: "0.4px" }}>Deadline</label>
            <input type="date" style={inputStyle} value={form.deadline} onChange={set("deadline")} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginTop: "12px" }}>
          <label style={{ fontSize: "11px", fontWeight: "600", color: textSec, textTransform: "uppercase", letterSpacing: "0.4px" }}>Job description</label>
          <textarea
            style={{ ...inputStyle, minHeight: "100px", resize: "vertical", fontFamily: "inherit" }}
            value={form.jobDescription}
            onChange={set("jobDescription")}
          />
        </div>

        {/* Auto-delete toggle */}
        <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: textSec, cursor: "pointer", marginTop: "14px" }}>
          <input
            type="checkbox"
            checked={form.autoDeleteEnabled}
            onChange={e => setForm(f => ({ ...f, autoDeleteEnabled: e.target.checked }))}
          />
          Auto-delete after deadline
        </label>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "8px", marginTop: "20px", flexWrap: "wrap" }}>
          <button
            onClick={() => onSave(form)}
            style={{ padding: "9px 18px", borderRadius: "7px", border: `1px solid ${cardBorder}`, background: "transparent", color: textPrimary, fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
          >
            Save only
          </button>
          <button
            onClick={() => onSaveAndApprove(form)}
            style={{ padding: "9px 18px", borderRadius: "7px", border: "none", background: "#2563eb", color: "#fff", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
          >
            Save &amp; Approve
          </button>
          <button
            onClick={onClose}
            style={{ padding: "9px 18px", borderRadius: "7px", border: `1px solid ${cardBorder}`, background: "transparent", color: textSec, fontSize: "13px", cursor: "pointer" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────
export default function AdminDiscoveryTab({ dark, isMobile, isAdmin, isEmployee, onDrivesChanged }) {
  const cardBg      = dark ? "#1e293b" : "#ffffff";
  const cardBorder  = dark ? "#334155" : "#e2e8f0";
  const textPrimary = dark ? "#f1f5f9" : "#0f172a";
  const textSec     = dark ? "#94a3b8" : "#64748b";
  const inputBg     = dark ? "#0f172a" : "#f8fafc";
  const inputBorder = dark ? "#475569" : "#e2e8f0";
  const inputColor  = dark ? "#f1f5f9" : "#0f172a";

  const inputStyle = {
    padding: "9px 12px", border: `1px solid ${inputBorder}`, borderRadius: "7px",
    fontSize: "13px", background: inputBg, color: inputColor,
    outline: "none", width: "100%", boxSizing: "border-box",
  };

  // ── discovered drives lists ─────────────────────────────────────────────────
  const [pending,  setPending]  = useState([]);
  const [rejected, setRejected] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError,   setListError]   = useState(null);

  // ── pagination ──────────────────────────────────────────────────────────────
  const [pendPage,  setPendPage]  = useState(1);
  const [rejPage,   setRejPage]   = useState(1);
  const [pendSearch, setPendSearch] = useState("");
  const [rejSearch,  setRejSearch]  = useState("");

  // ── edit modal ──────────────────────────────────────────────────────────────
  const [editingDrive, setEditingDrive] = useState(null);

  // ── trigger statuses: { rss, ai, url } each null | { state, message } ──────
  const [triggerStatus, setTriggerStatus] = useState({ rss: null, ai: null, url: null });
  const [customUrls, setCustomUrls] = useState("");

  // ── action feedback (approve/reject) ────────────────────────────────────────
  const [actionMsg, setActionMsg] = useState(null); // { type: "ok"|"err", text }

  const flashAction = (type, text) => {
    setActionMsg({ type, text });
    setTimeout(() => setActionMsg(null), 4000);
  };

  // ── fetch pending + rejected ────────────────────────────────────────────────
  const fetchDiscovered = useCallback(async () => {
    setLoadingList(true);
    setListError(null);
    try {
      const [pRes, rRes] = await Promise.all([
        axios.get("/admin/discovery/pending"),
        axios.get("/admin/discovery/rejected"),
      ]);
      setPending(pRes.data);
      setRejected(rRes.data);
    } catch (err) {
      setListError("Failed to load discovered drives.");
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => { fetchDiscovered(); }, [fetchDiscovered]);

  // ── trigger helpers ─────────────────────────────────────────────────────────
  const runTrigger = async (type) => {
    setTriggerStatus(s => ({ ...s, [type]: { state: "running" } }));
    try {
      let url = `/admin/discovery/${type}`;
      if (type === "url" && customUrls.trim()) {
        const encoded = encodeURIComponent(customUrls.trim());
        url += `?extraUrls=${encoded}`;
      }
      const res = await axios.post(url);
      const count = Array.isArray(res.data) ? res.data.length : (res.data?.count ?? "?");
      setTriggerStatus(s => ({ ...s, [type]: { state: "done", message: `${count} drive(s) discovered` } }));
      fetchDiscovered();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Unknown error";
      setTriggerStatus(s => ({ ...s, [type]: { state: "error", message: msg } }));
    }
    setTimeout(() => setTriggerStatus(s => ({ ...s, [type]: null })), 6000);
  };

  // ── approve / reject ────────────────────────────────────────────────────────
  const approve = async (id) => {
    try {
      await axios.post(`/admin/discovery/${id}/approve`);
      setPending(p => p.filter(d => d.id !== id));
      flashAction("ok", "Drive approved and published.");
      onDrivesChanged?.();
    } catch (err) {
      flashAction("err", err.response?.data?.message || "Failed to approve.");
    }
  };

  const reject = async (id) => {
    if (!window.confirm("Reject this discovered drive?")) return;
    try {
      await axios.post(`/admin/discovery/${id}/reject`);
      const drive = pending.find(d => d.id === id);
      setPending(p => p.filter(d => d.id !== id));
      if (drive) setRejected(r => [{ ...drive, status: "REJECTED" }, ...r]);
      flashAction("ok", "Drive rejected.");
    } catch (err) {
      flashAction("err", err.response?.data?.message || "Failed to reject.");
    }
  };

  const restore = async (id) => {
    try {
      await axios.post(`/admin/discovery/${id}/restore`);
      const drive = rejected.find(d => d.id === id);
      setRejected(r => r.filter(d => d.id !== id));
      if (drive) setPending(p => [{ ...drive, status: "PENDING" }, ...p]);
      flashAction("ok", "Drive moved back to pending.");
    } catch (err) {
      flashAction("err", err.response?.data?.message || "Failed to restore.");
    }
  };

  // ── edit save / save+approve ─────────────────────────────────────────────────
  const handleSave = async (form) => {
    const id = editingDrive.id;
    try {
      const res = await axios.put(`/admin/discovery/${id}`, form);
      setPending(p => p.map(d => d.id === id ? res.data : d));
      setRejected(r => r.map(d => d.id === id ? res.data : d));
      setEditingDrive(null);
      flashAction("ok", "Drive saved.");
    } catch (err) {
      flashAction("err", err.response?.data?.message || "Failed to save.");
      setEditingDrive(null);
    }
  };

  const handleSaveAndApprove = async (form) => {
    const id = editingDrive.id;
    try {
      await axios.put(`/admin/discovery/${id}`, form);
      await axios.post(`/admin/discovery/${id}/approve`);
      setPending(p => p.filter(d => d.id !== id));
      setRejected(r => r.filter(d => d.id !== id));
      setEditingDrive(null);
      flashAction("ok", "Drive saved and approved.");
      onDrivesChanged?.();
    } catch (err) {
      flashAction("err", err.response?.data?.message || "Failed to save & approve.");
      setEditingDrive(null);
    }
  };

  // ── filtered + paged ────────────────────────────────────────────────────────
  const filterDrives = (list, q) => {
    if (!q.trim()) return list;
    const lq = q.toLowerCase();
    return list.filter(d =>
      (d.companyName||"").toLowerCase().includes(lq) ||
      (d.jobRole    ||"").toLowerCase().includes(lq) ||
      (d.location   ||"").toLowerCase().includes(lq) ||
      (d.category   ||"").toLowerCase().includes(lq)
    );
  };

  const filteredPend = filterDrives(pending,  pendSearch);
  const filteredRej  = filterDrives(rejected, rejSearch);
  const pagedPend    = filteredPend.slice((pendPage - 1) * PAGE_SIZE, pendPage * PAGE_SIZE);
  const pagedRej     = filteredRej.slice((rejPage  - 1) * PAGE_SIZE, rejPage  * PAGE_SIZE);

  // ── shared table cell style ─────────────────────────────────────────────────
  const td = { padding: "11px 12px", verticalAlign: "middle" };
  const th = {
    textAlign: "left", padding: "9px 12px", fontSize: "11px", fontWeight: "600",
    color: textSec, textTransform: "uppercase", letterSpacing: "0.4px",
    borderBottom: `1px solid ${cardBorder}`, whiteSpace: "nowrap",
  };

  const DriveRow = ({ d, isRejected }) => {
    const dl = deadlineBadge(d.deadline, dark);
    return (
      <tr style={{ borderBottom: `1px solid ${dark ? "#1e293b" : "#f1f5f9"}` }}>
        <td style={{ ...td, color: textPrimary, fontWeight: "600" }}>{d.companyName}</td>
        <td style={{ ...td, color: textSec }}>{d.jobRole}</td>
        <td style={{ ...td, color: textSec }}>{d.location || "—"}</td>
        <td style={{ ...td, color: textSec }}>{d.category || "—"}</td>
        <td style={{ ...td }}>
          <span style={{
            display: "inline-flex", padding: "3px 10px", borderRadius: "20px",
            fontSize: "11px", fontWeight: "600", whiteSpace: "nowrap",
            background: dl.bg, color: dl.color, border: `1px solid ${dl.border}`,
          }}>{dl.label}</span>
        </td>
        <td style={{ ...td }}>
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            <button
              style={{ padding: "5px 10px", borderRadius: "6px", border: `1px solid ${cardBorder}`, background: "transparent", color: textPrimary, fontSize: "12px", fontWeight: "500", cursor: "pointer" }}
              onClick={() => setEditingDrive(d)}
            >Edit</button>
            {isRejected ? (
              <button
                style={{ padding: "5px 10px", borderRadius: "6px", border: "1px solid rgba(37,99,235,0.4)", background: "transparent", color: dark?"#60a5fa":"#2563eb", fontSize: "12px", fontWeight: "500", cursor: "pointer" }}
                onClick={() => restore(d.id)}
              >Restore</button>
            ) : (
              <>
                {isAdmin && (
                  <button
                    style={{ padding: "5px 10px", borderRadius: "6px", border: "none", background: "#2563eb", color: "#fff", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}
                    onClick={() => approve(d.id)}
                  >Approve</button>
                )}
                <button
                  style={{ padding: "5px 10px", borderRadius: "6px", border: "1px solid rgba(220,38,38,0.4)", background: "transparent", color: dark?"#f87171":"#dc2626", fontSize: "12px", fontWeight: "500", cursor: "pointer" }}
                  onClick={() => reject(d.id)}
                >Reject</button>
              </>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div>
      {/* ── edit modal ──────────────────────────────────────────────────────── */}
      {editingDrive && (
        <EditModal
          drive={editingDrive}
          dark={dark}
          onClose={() => setEditingDrive(null)}
          onSave={handleSave}
          onSaveAndApprove={handleSaveAndApprove}
        />
      )}

      {/* ── action feedback toast ────────────────────────────────────────────── */}
      {actionMsg && (
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          background: actionMsg.type === "ok" ? (dark?"#052e16":"#f0fdf4") : (dark?"#450a0a":"#fef2f2"),
          border: `1px solid ${actionMsg.type==="ok"?(dark?"#14532d":"#bbf7d0"):(dark?"#7f1d1d":"#fecaca")}`,
          borderRadius: "8px", padding: "10px 14px", fontSize: "13px",
          color: actionMsg.type === "ok" ? (dark?"#4ade80":"#15803d") : (dark?"#f87171":"#b91c1c"),
          marginBottom: "14px",
        }}>
          <span>{actionMsg.type === "ok" ? "✓" : "⚠️"} {actionMsg.text}</span>
          <button style={{ background: "transparent", border: "none", fontSize: "14px", cursor: "pointer", color: "inherit" }} onClick={() => setActionMsg(null)}>✕</button>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          ADMIN-ONLY: trigger panel
      ════════════════════════════════════════════════════════════════════════ */}
      {isAdmin && (
        <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
          <div style={{ marginBottom: "14px" }}>
            <h2 style={{ fontSize: "15px", fontWeight: "600", color: textPrimary, margin: "0 0 4px" }}>Run discovery</h2>
            <p style={{ fontSize: "12px", color: textSec, margin: 0 }}>Manually trigger each source. Results appear in the Pending review table below.</p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "flex-start" }}>
            {/* RSS */}
            <TriggerBtn
              label="Run RSS feeds"
              icon="📡"
              dark={dark}
              accentColor={dark ? "#34d399" : "#059669"}
              status={triggerStatus.rss}
              onClick={() => runTrigger("rss")}
            />

            {/* AI search */}
            <TriggerBtn
              label="Run AI search"
              icon="🤖"
              dark={dark}
              accentColor={dark ? "#a78bfa" : "#7c3aed"}
              status={triggerStatus.ai}
              onClick={() => runTrigger("ai")}
            />

            {/* URL scraping — with custom URL input */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: "260px", flex: 1 }}>
              <TriggerBtn
                label="Run URL scraping"
                icon="🔗"
                dark={dark}
                accentColor={dark ? "#38bdf8" : "#0369a1"}
                status={triggerStatus.url}
                onClick={() => runTrigger("url")}
              />
              <input
                style={{ ...inputStyle, fontSize: "12px" }}
                placeholder="Custom URLs (comma-separated, optional)"
                value={customUrls}
                onChange={e => setCustomUrls(e.target.value)}
              />
              <span style={{ fontSize: "11px", color: textSec }}>Added to default URL list before scraping.</span>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          PENDING REVIEW
      ════════════════════════════════════════════════════════════════════════ */}
      <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
          <h2 style={{ fontSize: "15px", fontWeight: "600", color: textPrimary, margin: 0 }}>Pending review</h2>
          <span style={{ background: dark?"#0f172a":"#f1f5f9", color: textSec, fontSize: "12px", fontWeight: "500", padding: "3px 10px", borderRadius: "20px" }}>
            {filteredPend.length} {pendSearch.trim() ? "found" : "total"}
          </span>
        </div>

        <input
          style={{ ...inputStyle, marginBottom: "14px" }}
          placeholder="Search pending…"
          value={pendSearch}
          onChange={e => { setPendSearch(e.target.value); setPendPage(1); }}
        />

        {loadingList ? (
          <p style={{ color: textSec, fontSize: "14px" }}>Loading…</p>
        ) : listError ? (
          <p style={{ color: dark?"#f87171":"#b91c1c", fontSize: "13px" }}>{listError}</p>
        ) : filteredPend.length === 0 ? (
          <p style={{ color: textSec, fontSize: "14px" }}>
            {pendSearch.trim() ? `No pending drives matching "${pendSearch}".` : "No drives awaiting review."}
          </p>
        ) : (
          <>
            <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", minWidth: isMobile ? "700px" : "unset" }}>
                <thead>
                  <tr>
                    {["Company","Role","Location","Category","Deadline","Actions"].map(h => (
                      <th key={h} style={th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagedPend.map(d => <DriveRow key={d.id} d={d} isRejected={false} />)}
                </tbody>
              </table>
            </div>
            <Pagination total={filteredPend.length} page={pendPage} pageSize={PAGE_SIZE} onChange={setPendPage} />
          </>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          REJECTED
      ════════════════════════════════════════════════════════════════════════ */}
      <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
          <h2 style={{ fontSize: "15px", fontWeight: "600", color: textPrimary, margin: 0 }}>Rejected</h2>
          <span style={{ background: dark?"#0f172a":"#f1f5f9", color: textSec, fontSize: "12px", fontWeight: "500", padding: "3px 10px", borderRadius: "20px" }}>
            {filteredRej.length} {rejSearch.trim() ? "found" : "total"}
          </span>
        </div>

        <input
          style={{ ...inputStyle, marginBottom: "14px" }}
          placeholder="Search rejected…"
          value={rejSearch}
          onChange={e => { setRejSearch(e.target.value); setRejPage(1); }}
        />

        {filteredRej.length === 0 ? (
          <p style={{ color: textSec, fontSize: "14px" }}>
            {rejSearch.trim() ? `No rejected drives matching "${rejSearch}".` : "No rejected drives."}
          </p>
        ) : (
          <>
            <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", minWidth: isMobile ? "700px" : "unset" }}>
                <thead>
                  <tr>
                    {["Company","Role","Location","Category","Deadline","Actions"].map(h => (
                      <th key={h} style={th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagedRej.map(d => <DriveRow key={d.id} d={d} isRejected={true} />)}
                </tbody>
              </table>
            </div>
            <Pagination total={filteredRej.length} page={rejPage} pageSize={PAGE_SIZE} onChange={setRejPage} />
          </>
        )}
      </div>
    </div>
  );
}