import { useEffect, useState, useCallback } from "react";
import { useTheme } from "../context/ThemeContext";
import axios from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const PAGE_SIZE = 10;

// ─── Responsive helper ────────────────────────────────────────────────────────
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
};

// ─── Pagination component ─────────────────────────────────────────────────────
function Pagination({ total, page, pageSize, onChange }) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 14, flexWrap: "wrap" }}>
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        style={{ ...paginBtn, opacity: page === 1 ? 0.35 : 1 }}
      >
        ← Prev
      </button>

      {pages.map(p => (
        <button
          key={p}
          onClick={() => onChange(p)}
          style={{ ...paginBtn, ...(p === page ? paginBtnActive : {}) }}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        style={{ ...paginBtn, opacity: page === totalPages ? 0.35 : 1 }}
      >
        Next →
      </button>

      <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: 6 }}>
        {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, total)} of {total}
      </span>
    </div>
  );
}

const paginBtn = {
  padding: "5px 12px", borderRadius: "6px", border: "1px solid #334155",
  background: "transparent", color: "#64748b", fontSize: "12px",
  fontWeight: "500", cursor: "pointer",
};
const paginBtnActive = {
  background: "#2563eb", borderColor: "#2563eb", color: "#fff",
};

function AdminDashboard() {
  const { auth }   = useAuth();
  const { dark }   = useTheme();
  const isMobile   = useIsMobile();

  const isAdmin    = auth.role === "ROLE_ADMIN";
  const isEmployee = auth.role === "ROLE_EMPLOYEE";
  const canAccess  = isAdmin || isEmployee;

  const [tab, setTab] = useState(isAdmin ? "drives" : "discovery");

  // ── Drives tab ──────────────────────────────────────────────────────────
  const [drives, setDrives]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [editingId, setEditingId]     = useState(null);
  const [error, setError]             = useState(null);
  const [drivePage, setDrivePage]     = useState(1);
  const [driveSearch, setDriveSearch] = useState("");   // ← NEW

  // ── Users tab ───────────────────────────────────────────────────────────
  const [users, setUsers]               = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userError, setUserError]       = useState(null);
  const [userSearch, setUserSearch]     = useState("");
  const [userPage, setUserPage]         = useState(1);

  // ── Discovery tab ───────────────────────────────────────────────────────
  const [pendingDrives, setPendingDrives]   = useState([]);
  const [rejectedDrives, setRejectedDrives] = useState([]);
  const [last5Approved, setLast5Approved]   = useState([]);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [pendingError, setPendingError]     = useState(null);
  const [pendingPage, setPendingPage]       = useState(1);
  const [rejectedPage, setRejectedPage]     = useState(1);

  const [editingDrive, setEditingDrive] = useState(null);
  const [editFields, setEditFields]     = useState({});
  const [editSaving, setEditSaving]     = useState(false);

  const [rejectionStatus, setRejectionStatus] = useState({
    used: 0, remaining: 10, onCooldown: false, cooldownMinutesLeft: 0,
  });

  const emptyForm = {
    companyName: "", jobRole: "", jobDescription: "", keySkills: "",
    location: "", ctcDisplay: "", minCgpa: "", deadline: "",
    eligibleBranches: "", eligibleBatches: "", experienceLevel: "Freshers",
    category: "IT_SOFTWARE", status: "ACTIVE", jobType: "Full-Time",
    applyLink: "", autoDeleteEnabled: false,
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchDrives();
    fetchDiscoveryData();
    if (isAdmin) fetchUsers();
    if (isEmployee) fetchRejectionStatus();
  }, []);

  const fetchDrives = async () => {
    try {
      const res = await axios.get("/drives");
      setDrives(res.data);
    } catch (err) {
      console.error("Failed to fetch drives:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await axios.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      setUserError("Failed to load users.");
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchDiscoveryData = async () => {
    setPendingLoading(true);
    setPendingError(null);
    try {
      const [pendingRes, rejectedRes, approvedRes] = await Promise.all([
        axios.get("/admin/drives/pending"),
        axios.get("/admin/drives/rejected"),
        axios.get("/admin/drives/last-approved"),
      ]);
      setPendingDrives(pendingRes.data   || []);
      setRejectedDrives(rejectedRes.data || []);
      setLast5Approved(approvedRes.data  || []);
    } catch (err) {
      setPendingError("Failed to load discovery data.");
    } finally {
      setPendingLoading(false);
    }
  };

  const fetchRejectionStatus = async () => {
    try {
      const res = await axios.get("/admin/drives/rejection-status");
      setRejectionStatus(res.data);
    } catch (err) {
      console.error("Failed to fetch rejection status", err);
    }
  };

  // ── Users actions ───────────────────────────────────────────────────────
  const deleteUser = async (user) => {
    if (!window.confirm(`Delete user "${user.name}" (${user.email})? This cannot be undone.`)) return;
    try {
      await axios.delete(`/admin/users/${user.id}`);
      setUsers(prev => prev.filter(u => u.id !== user.id));
    } catch (err) {
      setUserError(err.response?.data?.message || "Failed to delete user.");
    }
  };

  const promoteUser = async (user) => {
    const newRole = user.role === "ROLE_EMPLOYEE" ? "ROLE_USER" : "ROLE_EMPLOYEE";
    const label   = newRole === "ROLE_EMPLOYEE" ? "promote to Employee" : "demote to User";
    if (!window.confirm(`Are you sure you want to ${label} "${user.name}"?`)) return;
    try {
      const res = await axios.put(`/admin/users/${user.id}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: res.data.role } : u));
    } catch (err) {
      setUserError(err.response?.data?.message || "Failed to update role.");
    }
  };

  // ── Discovery actions ───────────────────────────────────────────────────
  const approveDrive = async (drive) => {
    if (!window.confirm(`Approve "${drive.companyName} - ${drive.jobRole}"?`)) return;
    try {
      await axios.post(`/admin/drives/${drive.id}/approve`);
      setPendingDrives(prev => prev.filter(d => d.id !== drive.id));
      setRejectedDrives(prev => prev.filter(d => d.id !== drive.id));
      fetchDiscoveryData();
      fetchDrives();
    } catch (err) {
      setPendingError(err.response?.data?.message || "Failed to approve drive.");
    }
  };

  const rejectDrive = async (drive) => {
    if (rejectionStatus.onCooldown && !isAdmin) {
      alert(`Rejection limit reached. Try again in ${rejectionStatus.cooldownMinutesLeft} minute(s).`);
      return;
    }
    if (!window.confirm(`Reject "${drive.companyName} - ${drive.jobRole}"?`)) return;
    try {
      await axios.post(`/admin/drives/${drive.id}/reject`);
      setPendingDrives(prev => prev.filter(d => d.id !== drive.id));
      setRejectedDrives(prev => [drive, ...prev]);
      if (isEmployee) fetchRejectionStatus();
    } catch (err) {
      if (err.response?.status === 429) {
        alert(err.response.data.error);
        fetchRejectionStatus();
      } else {
        setPendingError(err.response?.data?.message || "Failed to reject drive.");
      }
    }
  };

  const openEdit = (drive) => {
    setEditingDrive(drive);
    setEditFields({
      companyName:          drive.companyName          || "",
      jobRole:              drive.jobRole              || "",
      location:             drive.location             || "",
      deadline:             drive.deadline             || "",
      ctcDisplay:           drive.ctcDisplay           || "",
      eligibleBatches:      drive.eligibleBatches      || "",
      applyLink:            drive.applyLink            || "",
      autoExpireAfter30Days: drive.autoExpireAfter30Days !== undefined
                              ? drive.autoExpireAfter30Days
                              : true,
    });
  };

  const saveEdit = async () => {
    if (!editingDrive) return;
    setEditSaving(true);
    try {
      const res = await axios.patch(`/admin/drives/${editingDrive.id}/edit`, editFields);
      setPendingDrives(prev => prev.map(d => d.id === editingDrive.id ? res.data : d));
      setRejectedDrives(prev => prev.map(d => d.id === editingDrive.id ? res.data : d));
      setEditingDrive(null);
    } catch (err) {
      alert("Failed to save changes.");
    } finally {
      setEditSaving(false);
    }
  };

  // ── Drives tab actions ──────────────────────────────────────────────────
  const buildPayload = (f) => ({
    ...f,
    minCgpa:  f.minCgpa  ? parseFloat(f.minCgpa) : null,
    deadline: f.deadline || null,
  });

  const formatErrors = (data) => {
    if (!data) return "Unknown error";
    if (typeof data === "string") return data;
    if (typeof data === "object") {
      const entries = Object.entries(data).filter(([k]) => !["timestamp","path","status"].includes(k));
      if (entries.length > 0) return entries.map(([k, v]) => `${k}: ${v}`).join(" | ");
    }
    return "Unknown error";
  };

  const handleAdd = async () => {
    setError(null);
    if (!form.companyName.trim()) { setError("Company name is required."); return; }
    if (!form.jobRole.trim())     { setError("Job role is required.");     return; }
    if (!form.deadline)           { setError("Deadline is required.");     return; }
    try {
      const res = await axios.post("/drives", buildPayload(form));
      setDrives(prev => [res.data, ...prev]);
      setForm(emptyForm);
      setDrivePage(1);
    } catch (err) {
      setError(`Failed to create drive: ${formatErrors(err.response?.data)}`);
    }
  };

  const startEdit = (drive) => {
    setEditingId(drive.id);
    setError(null);
    setForm({
      companyName:       drive.companyName       || "",
      jobRole:           drive.jobRole           || "",
      jobDescription:    drive.jobDescription    || "",
      keySkills:         drive.keySkills         || "",
      location:          drive.location          || "",
      ctcDisplay:        drive.ctcDisplay        || "",
      minCgpa:           drive.minCgpa           ?? "",
      deadline:          drive.deadline          || "",
      eligibleBranches:  drive.eligibleBranches  || "",
      eligibleBatches:   drive.eligibleBatches   || "",
      experienceLevel:   drive.experienceLevel   || "Freshers",
      category:          drive.category          || "IT_SOFTWARE",
      status:            drive.status            || "ACTIVE",
      jobType:           drive.jobType           || "Full-Time",
      applyLink:         drive.applyLink         || "",
      autoDeleteEnabled: drive.autoDeleteEnabled || false,
    });
    // Scroll to form on mobile
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpdate = async () => {
    setError(null);
    if (!form.companyName.trim()) { setError("Company name is required."); return; }
    if (!form.jobRole.trim())     { setError("Job role is required.");     return; }
    if (!form.deadline)           { setError("Deadline is required.");     return; }
    try {
      const res = await axios.put(`/drives/${editingId}`, buildPayload(form));
      setDrives(prev => prev.map(d => d.id === editingId ? res.data : d));
      setForm(emptyForm);
      setEditingId(null);
    } catch (err) {
      setError(`Failed to update drive: ${formatErrors(err.response?.data)}`);
    }
  };

  const deleteDrive = async (id) => {
    if (!window.confirm("Delete this drive?")) return;
    try {
      await axios.delete(`/drives/${id}`);
      setDrives(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      alert("Failed to delete drive.");
    }
  };

  const cancelEdit = () => { setEditingId(null); setForm(emptyForm); setError(null); };
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  // ── Theme tokens ────────────────────────────────────────────────────────
  const cardBg        = dark ? "#1e293b" : "#ffffff";
  const cardBorder    = dark ? "#334155" : "#e2e8f0";
  const textPrimary   = dark ? "#f1f5f9" : "#0f172a";
  const textSecondary = dark ? "#94a3b8" : "#64748b";
  const inputBg       = dark ? "#0f172a" : "#f8fafc";
  const inputBorder   = dark ? "#475569" : "#e2e8f0";
  const inputColor    = dark ? "#f1f5f9" : "#0f172a";
  const pageBg        = dark ? "#0f172a" : "#f8fafc";

  if (!canAccess) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: pageBg }}>
        <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: "12px", padding: "48px", textAlign: "center" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔒</div>
          <h2 style={{ fontSize: "20px", fontWeight: "700", color: textPrimary, margin: "0 0 8px" }}>Access Denied</h2>
          <p style={{ fontSize: "14px", color: "#94a3b8", margin: 0 }}>
            You don't have permission to view this page.
          </p>
        </div>
      </div>
    );
  }

  const activeCount   = drives.filter(d => d.autoDeleteEnabled).length;
  const expiringCount = drives.filter(d => {
    if (!d.deadline) return false;
    const diff = (new Date(d.deadline) - new Date()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  }).length;

  const filteredUsers = users.filter(u => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      (u.name   || "").toLowerCase().includes(q) ||
      (u.email  || "").toLowerCase().includes(q) ||
      (u.college|| "").toLowerCase().includes(q)
    );
  });

  // ── Drive search filter ─────────────────────────────────────────────────
  const filteredDrives = drives.filter(d => {
    const q = driveSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      (d.companyName || "").toLowerCase().includes(q) ||
      (d.jobRole     || "").toLowerCase().includes(q) ||
      (d.location    || "").toLowerCase().includes(q) ||
      (d.category    || "").toLowerCase().includes(q) ||
      (d.status      || "").toLowerCase().includes(q) ||
      (d.ctcDisplay  || "").toLowerCase().includes(q)
    );
  });

  // ── Pagination slices ───────────────────────────────────────────────────
  const pagedDrives   = filteredDrives.slice((drivePage - 1) * PAGE_SIZE, drivePage * PAGE_SIZE);
  const pagedUsers    = filteredUsers.slice((userPage - 1) * PAGE_SIZE, userPage * PAGE_SIZE);
  const pagedPending  = pendingDrives.slice((pendingPage - 1) * PAGE_SIZE, pendingPage * PAGE_SIZE);
  const pagedRejected = rejectedDrives.slice((rejectedPage - 1) * PAGE_SIZE, rejectedPage * PAGE_SIZE);

  const handleUserSearch  = (v) => { setUserSearch(v);  setUserPage(1);  };
  const handleDriveSearch = (v) => { setDriveSearch(v); setDrivePage(1); }; // ← NEW

  // ── Deadline badge helper ───────────────────────────────────────────────
  const deadlineBadge = (deadline) => {
    if (!deadline) return { label: "—", color: "#94a3b8", bg: dark ? "#1e293b" : "transparent", border: "transparent" };
    const diff = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff < 0)  return { label: deadline, color: "#f87171", bg: dark ? "#450a0a" : "#fef2f2", border: dark ? "#7f1d1d" : "#fecaca" };
    if (diff <= 3) return { label: `${deadline} (${diff}d)`, color: "#fbbf24", bg: dark ? "#422006" : "#fffbeb", border: dark ? "#78350f" : "#fde68a" };
    if (diff <= 7) return { label: `${deadline} (${diff}d)`, color: "#38bdf8", bg: dark ? "#0c2a3e" : "#f0f9ff", border: dark ? "#0369a1" : "#bae6fd" };
    return         { label: deadline, color: "#4ade80", bg: dark ? "#052e16" : "#f0fdf4", border: dark ? "#14532d" : "#bbf7d0" };
  };

  const tabs = [
    { key: "drives",    label: "Drives" },
    ...(isAdmin ? [{ key: "users", label: `Users${users.length > 0 ? ` (${users.length})` : ""}` }] : []),
    { key: "discovery", label: `AI Discovery${pendingDrives.length > 0 ? ` (${pendingDrives.length})` : ""}` },
  ];

  // ── Shared input style ──────────────────────────────────────────────────
  const inputStyle = {
    padding: "9px 12px",
    border: `1px solid ${inputBorder}`,
    borderRadius: "7px",
    fontSize: "13px",
    background: inputBg,
    color: inputColor,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", fontFamily: "'Inter', system-ui, sans-serif", background: pageBg, minHeight: "100vh", padding: isMobile ? "16px 12px" : "24px 20px" }}>

      {/* ── Edit modal ────────────────────────────────────────────────────── */}
      {editingDrive && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}>
          <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: "12px", padding: "24px", width: isMobile ? "95vw" : "520px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "600", color: textPrimary }}>
                Edit drive
              </h3>
              <button onClick={() => setEditingDrive(null)} style={{ background: "transparent", border: "none", fontSize: "18px", cursor: "pointer", color: textSecondary }}>✕</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "12px" }}>
              {[
                { key: "companyName",     label: "Company name"          },
                { key: "jobRole",         label: "Job role"              },
                { key: "location",        label: "Location"              },
                { key: "deadline",        label: "Deadline (YYYY-MM-DD)" },
                { key: "ctcDisplay",      label: "CTC / Salary"          },
                { key: "eligibleBatches", label: "Eligible batches"      },
                { key: "applyLink",       label: "Apply link"            },
              ].map(({ key, label }) => (
                <div key={key} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", color: textSecondary, textTransform: "uppercase", letterSpacing: "0.4px" }}>
                    {label}
                  </label>
                  <input
                    style={inputStyle}
                    value={editFields[key] || ""}
                    onChange={e => setEditFields({ ...editFields, [key]: e.target.value })}
                  />
                </div>
              ))}
            </div>

            {/* Auto-expire toggle */}
            <div style={{ marginTop: "16px", padding: "12px 14px", background: dark ? "#0f172a" : "#f8fafc", borderRadius: "8px", border: `1px solid ${cardBorder}` }}>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={editFields.autoExpireAfter30Days !== false}
                  onChange={e => setEditFields({ ...editFields, autoExpireAfter30Days: e.target.checked })}
                  style={{ width: "16px", height: "16px", accentColor: "#2563eb" }}
                />
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: textPrimary }}>Auto-delete after 30 days of expiry</div>
                  <div style={{ fontSize: "11px", color: textSecondary, marginTop: "2px" }}>Drive will be removed 30 days after its deadline passes</div>
                </div>
              </label>
            </div>

            <div style={{ display: "flex", gap: "8px", marginTop: "18px", justifyContent: "flex-end" }}>
              <button onClick={() => setEditingDrive(null)} style={{ padding: "5px 12px", background: "transparent", border: `1px solid ${cardBorder}`, borderRadius: "6px", fontSize: "12px", color: textSecondary, cursor: "pointer" }}>Cancel</button>
              <button onClick={saveEdit} disabled={editSaving} style={{ padding: "9px 20px", background: "#2563eb", color: "white", border: "none", borderRadius: "7px", fontSize: "13px", fontWeight: "600", cursor: "pointer", opacity: editSaving ? 0.6 : 1 }}>
                {editSaving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOP BAR ──────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: isMobile ? "wrap" : "nowrap", gap: isMobile ? "10px" : "0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "34px", height: "34px", background: "#2563eb", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: "17px", fontWeight: "700", color: textPrimary, letterSpacing: "-0.3px" }}>{isAdmin ? "Admin dashboard" : "Employee dashboard"}</div>
            <div style={{ fontSize: "12px", color: textSecondary, marginTop: "1px" }}>Manage drives</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: "20px", padding: "6px 14px 6px 8px", fontSize: "13px", fontWeight: "500", color: textSecondary }}>
          <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#2563eb", color: "white", fontSize: "11px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {isAdmin ? "A" : "E"}
          </div>
          {auth.name || (isAdmin ? "Admin" : "Employee")}
          <span style={{ fontSize: "10px", fontWeight: "600", padding: "2px 8px", borderRadius: "20px", background: dark ? "#0f172a" : "#f1f5f9", color: dark ? "#94a3b8" : "#64748b", textTransform: "uppercase", letterSpacing: "0.4px" }}>
            {isAdmin ? "ADMIN" : "EMPLOYEE"}
          </span>
        </div>
      </div>

      {/* ── TABS ─────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "16px", overflowX: "auto", WebkitOverflowScrolling: "touch", borderBottom: `1px solid ${cardBorder}` }}>
        {tabs.map(tb => (
          <button
            key={tb.key}
            onClick={() => setTab(tb.key)}
            style={{
              padding: "8px 18px",
              background: "transparent",
              color: tab === tb.key ? textPrimary : textSecondary,
              border: "none",
              borderBottom: tab === tb.key ? "2px solid #2563eb" : "2px solid transparent",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              whiteSpace: "nowrap",
              marginBottom: "-1px",
            }}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          DRIVES TAB
      ════════════════════════════════════════════════════════════════════ */}
      {tab === "drives" && (
        <>
          {isAdmin && (
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: "10px", marginBottom: "16px" }}>
              {[
                { label: "Total drives",   value: drives.length },
                { label: "Auto-delete on", value: activeCount   },
                { label: "Expiring soon",  value: expiringCount, warn: true },
                { label: "Active drives",  value: drives.filter(d => d.status === "ACTIVE").length },
              ].map(m => (
                <div key={m.label} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: "10px", padding: "14px 16px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "600", color: textSecondary, textTransform: "uppercase", letterSpacing: "0.5px" }}>{m.label}</div>
                  <div style={{ fontSize: "24px", fontWeight: "700", marginTop: "4px", color: m.warn && m.value > 0 ? "#d97706" : textPrimary }}>
                    {m.value}
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: dark ? "#450a0a" : "#fef2f2", border: `1px solid ${dark ? "#7f1d1d" : "#fecaca"}`, borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: dark ? "#f87171" : "#b91c1c", marginBottom: "14px" }}>
              <span>⚠️ {error}</span>
              <button style={{ background: "transparent", border: "none", color: dark ? "#f87171" : "#b91c1c", cursor: "pointer", fontSize: "14px" }} onClick={() => setError(null)}>✕</button>
            </div>
          )}

          {/* Create / Edit form */}
          <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "15px", fontWeight: "600", color: textPrimary, margin: 0 }}>{editingId ? "Edit drive" : "Create drive"}</h2>
              {editingId && (
                <button onClick={cancelEdit} style={{ padding: "5px 12px", background: "transparent", border: `1px solid ${cardBorder}`, borderRadius: "6px", fontSize: "12px", color: textSecondary, cursor: "pointer" }}>Cancel</button>
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: "12px" }}>
              {[
                { key: "companyName",      placeholder: "Company name"         },
                { key: "jobRole",          placeholder: "Job role"             },
                { key: "location",         placeholder: "Location"             },
                { key: "ctcDisplay",       placeholder: "CTC (e.g. 6 LPA)"    },
                { key: "minCgpa",          placeholder: "Min CGPA (e.g. 7.5)" },
                { key: "eligibleBranches", placeholder: "Branches (CSE, ECE)" },
                { key: "eligibleBatches",  placeholder: "Batches (2024, 2025)"},
                { key: "applyLink",        placeholder: "Apply link (URL)"    },
                { key: "keySkills",        placeholder: "Key skills"          },
              ].map(({ key, placeholder }) => (
                <div key={key} style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "600", color: textSecondary, textTransform: "uppercase", letterSpacing: "0.4px" }}>{placeholder.split(" (")[0]}</label>
                  <input style={inputStyle} placeholder={placeholder} value={form[key]} onChange={set(key)} />
                </div>
              ))}
              {[
                { key: "category", label: "Category", options: [["IT_SOFTWARE","IT / Software"],["CORE_ENGINEERING","Core Engineering"],["GOVERNMENT","Government"],["BANKING","Banking"],["MANAGEMENT","Management"],["INTERNSHIP","Internship"],["OTHERS","Others"]] },
                { key: "status",   label: "Status",   options: [["ACTIVE","Active"],["UPCOMING","Upcoming"],["CLOSED","Closed"],["EXPIRED","Expired"]] },
                { key: "jobType",  label: "Job type", options: [["Full-Time","Full-Time"],["Internship","Internship"],["Contract","Contract"]] },
                { key: "experienceLevel", label: "Experience level", options: [["Freshers","Freshers"],["0-1 Years","0-1 Years"],["1-2 Years","1-2 Years"],["2-3 Years","2-3 Years"],["3+ Years","3+ Years"]] },
              ].map(({ key, label, options }) => (
                <div key={key} style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "600", color: textSecondary, textTransform: "uppercase", letterSpacing: "0.4px" }}>{label}</label>
                  <select style={inputStyle} value={form[key]} onChange={set(key)}>
                    {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              ))}
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "11px", fontWeight: "600", color: textSecondary, textTransform: "uppercase", letterSpacing: "0.4px" }}>Deadline *</label>
                <input type="date" style={inputStyle} value={form.deadline} onChange={set("deadline")} />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginTop: "12px" }}>
              <label style={{ fontSize: "11px", fontWeight: "600", color: textSecondary, textTransform: "uppercase", letterSpacing: "0.4px" }}>Job description</label>
              <textarea
                style={{ ...inputStyle, minHeight: "110px", resize: "vertical", fontFamily: "inherit" }}
                placeholder="Describe the role..."
                value={form.jobDescription}
                onChange={set("jobDescription")}
              />
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: textSecondary, marginTop: "14px", cursor: "pointer" }}>
              <input type="checkbox" checked={form.autoDeleteEnabled} onChange={e => setForm({ ...form, autoDeleteEnabled: e.target.checked })} />
              <span>Auto-delete after deadline</span>
            </label>
            <div style={{ display: "flex", gap: "8px", marginTop: "14px", flexWrap: "wrap" }}>
              <button style={{ padding: "9px 20px", background: "#2563eb", color: "white", border: "none", borderRadius: "7px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }} onClick={editingId ? handleUpdate : handleAdd}>
                {editingId ? "Update drive" : "Publish drive"}
              </button>
              {!editingId && (
                <button onClick={() => setForm(emptyForm)} style={{ padding: "9px 16px", background: "transparent", color: textSecondary, border: `1px solid ${cardBorder}`, borderRadius: "7px", fontSize: "13px", cursor: "pointer" }}>Reset</button>
              )}
            </div>
          </div>

          {/* ── Live drives table ── */}
          <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>

            {/* Header row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
              <h2 style={{ fontSize: "15px", fontWeight: "600", color: textPrimary, margin: 0 }}>Live drives</h2>
              <span style={{ background: dark ? "#0f172a" : "#f1f5f9", color: textSecondary, fontSize: "12px", fontWeight: "500", padding: "3px 10px", borderRadius: "20px", whiteSpace: "nowrap" }}>
                {filteredDrives.length} {driveSearch.trim() ? "found" : "total"}
              </span>
            </div>

            {/* ── Search bar ── */}
            <input
              style={{ ...inputStyle, marginBottom: "14px" }}
              placeholder="Search by company, role, location, category, CTC or status…"
              value={driveSearch}
              onChange={e => handleDriveSearch(e.target.value)}
            />

            {loading ? (
              <p style={{ color: textSecondary, fontSize: "14px" }}>Loading...</p>
            ) : filteredDrives.length === 0 ? (
              <p style={{ color: textSecondary, fontSize: "14px" }}>
                {driveSearch.trim() ? `No drives matching "${driveSearch}".` : "No drives yet."}
              </p>
            ) : (
              <>
                <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", minWidth: isMobile ? "700px" : "unset" }}>
                    <thead>
                      <tr>
                        {["Company","Role","Location","CTC","Category","Status","Auto-del","Actions","Deadline"].map(h => (
                          <th key={h} style={{ textAlign: "left", padding: "9px 12px", fontSize: "11px", fontWeight: "600", color: textSecondary, textTransform: "uppercase", letterSpacing: "0.4px", borderBottom: `1px solid ${cardBorder}`, whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pagedDrives.map(d => {
                        const dl = deadlineBadge(d.deadline);
                        return (
                          <tr key={d.id} style={{ borderBottom: `1px solid ${dark ? "#1e293b" : "#f1f5f9"}` }}>
                            <td style={{ padding: "11px 12px", color: textPrimary, fontWeight: "600", verticalAlign: "middle" }}>{d.companyName}</td>
                            <td style={{ padding: "11px 12px", color: textSecondary, verticalAlign: "middle" }}>{d.jobRole}</td>
                            <td style={{ padding: "11px 12px", color: textSecondary, verticalAlign: "middle" }}>{d.location || "—"}</td>
                            <td style={{ padding: "11px 12px", color: textSecondary, verticalAlign: "middle" }}>{d.ctcDisplay || "—"}</td>
                            <td style={{ padding: "11px 12px", color: textSecondary, verticalAlign: "middle" }}>{d.category || "—"}</td>
                            <td style={{ padding: "11px 12px", verticalAlign: "middle" }}>
                              <span style={{
                                display: "inline-flex", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600",
                                background: d.status==="ACTIVE"?(dark?"#052e16":"#dcfce7"):d.status==="UPCOMING"?(dark?"#0c2a3e":"#eff6ff"):d.status==="EXPIRED"?(dark?"#422006":"#fef9c3"):(dark?"#450a0a":"#fee2e2"),
                                color:      d.status==="ACTIVE"?(dark?"#4ade80":"#15803d"):d.status==="UPCOMING"?(dark?"#38bdf8":"#1d4ed8"):d.status==="EXPIRED"?(dark?"#fbbf24":"#92400e"):(dark?"#f87171":"#b91c1c"),
                              }}>{d.status}</span>
                            </td>
                            <td style={{ padding: "11px 12px", verticalAlign: "middle" }}>
                              <span style={{
                                display: "inline-flex", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600",
                                background: d.autoDeleteEnabled ? (dark ? "#052e16" : "#dcfce7") : (dark ? "#1e293b" : "#f1f5f9"),
                                color:      d.autoDeleteEnabled ? (dark ? "#4ade80" : "#15803d") : textSecondary,
                              }}>
                                {d.autoDeleteEnabled ? "ON" : "OFF"}
                              </span>
                            </td>
                            <td style={{ padding: "11px 12px", verticalAlign: "middle" }}>
                              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                                <button
                                  style={{ padding: "5px 10px", borderRadius: "6px", border: `1px solid ${cardBorder}`, background: "transparent", color: textPrimary, fontSize: "12px", fontWeight: "500", cursor: "pointer" }}
                                  onClick={() => startEdit(d)}
                                >
                                  Edit
                                </button>
                                {isAdmin && (
                                  <button
                                    style={{ padding: "5px 10px", borderRadius: "6px", border: "1px solid rgba(220,38,38,0.4)", background: "transparent", color: dark ? "#f87171" : "#dc2626", fontSize: "12px", fontWeight: "500", cursor: "pointer" }}
                                    onClick={() => deleteDrive(d.id)}
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </td>
                            <td style={{ padding: "11px 12px", verticalAlign: "middle" }}>
                              <span style={{ display: "inline-flex", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", whiteSpace: "nowrap", background: dl.bg, color: dl.color, border: `1px solid ${dl.border}` }}>
                                {dl.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <Pagination total={filteredDrives.length} page={drivePage} pageSize={PAGE_SIZE} onChange={setDrivePage} />
              </>
            )}
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          USERS TAB
      ════════════════════════════════════════════════════════════════════ */}
      {tab === "users" && isAdmin && (
        <>
          {userError && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: dark ? "#450a0a" : "#fef2f2", border: `1px solid ${dark ? "#7f1d1d" : "#fecaca"}`, borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: dark ? "#f87171" : "#b91c1c", marginBottom: "14px" }}>
              <span>⚠️ {userError}</span>
              <button style={{ background: "transparent", border: "none", color: dark ? "#f87171" : "#b91c1c", cursor: "pointer", fontSize: "14px" }} onClick={() => setUserError(null)}>✕</button>
            </div>
          )}
          <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "15px", fontWeight: "600", color: textPrimary, margin: 0 }}>Registered users</h2>
              <span style={{ background: dark ? "#0f172a" : "#f1f5f9", color: textSecondary, fontSize: "12px", fontWeight: "500", padding: "3px 10px", borderRadius: "20px" }}>{filteredUsers.length} shown</span>
            </div>
            <input
              style={inputStyle}
              placeholder="Search by name, email, or college..."
              value={userSearch}
              onChange={e => handleUserSearch(e.target.value)}
            />
            <div style={{ marginTop: "14px", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
              {usersLoading ? (
                <p style={{ color: textSecondary, fontSize: "14px" }}>Loading...</p>
              ) : filteredUsers.length === 0 ? (
                <p style={{ color: textSecondary, fontSize: "14px" }}>No users found.</p>
              ) : (
                <>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", minWidth: isMobile ? "700px" : "unset" }}>
                    <thead>
                      <tr>
                        {["Name","Email","Role","College","Branch","Batch","Verified","Actions"].map(h => (
                          <th key={h} style={{ textAlign: "left", padding: "9px 12px", fontSize: "11px", fontWeight: "600", color: textSecondary, textTransform: "uppercase", letterSpacing: "0.4px", borderBottom: `1px solid ${cardBorder}`, whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pagedUsers.map(u => (
                        <tr key={u.id} style={{ borderBottom: `1px solid ${dark ? "#1e293b" : "#f1f5f9"}` }}>
                          <td style={{ padding: "11px 12px", color: textPrimary, fontWeight: "600", verticalAlign: "middle" }}>{u.name || "—"}</td>
                          <td style={{ padding: "11px 12px", color: textSecondary, verticalAlign: "middle" }}>{u.email}</td>
                          <td style={{ padding: "11px 12px", verticalAlign: "middle" }}>
                            <span style={{
                              display: "inline-flex", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600",
                              background: u.role==="ROLE_ADMIN"?(dark?"#2e1065":"#ede9fe"):u.role==="ROLE_EMPLOYEE"?(dark?"#422006":"#fef3c7"):(dark?"#1e293b":"#f1f5f9"),
                              color:      u.role==="ROLE_ADMIN"?(dark?"#c4b5fd":"#6d28d9"):u.role==="ROLE_EMPLOYEE"?(dark?"#fbbf24":"#92400e"):(dark?"#94a3b8":"#64748b"),
                            }}>
                              {u.role==="ROLE_ADMIN"?"Admin":u.role==="ROLE_EMPLOYEE"?"Employee":"User"}
                            </span>
                          </td>
                          <td style={{ padding: "11px 12px", color: textSecondary, verticalAlign: "middle" }}>{u.college || "—"}</td>
                          <td style={{ padding: "11px 12px", color: textSecondary, verticalAlign: "middle" }}>{u.branch  || "—"}</td>
                          <td style={{ padding: "11px 12px", color: textSecondary, verticalAlign: "middle" }}>{u.batchYear|| "—"}</td>
                          <td style={{ padding: "11px 12px", verticalAlign: "middle" }}>
                            <span style={{
                              display: "inline-flex", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600",
                              background: u.emailVerified ? (dark ? "#052e16" : "#dcfce7") : (dark ? "#422006" : "#fef9c3"),
                              color:      u.emailVerified ? (dark ? "#4ade80" : "#15803d") : (dark ? "#fbbf24" : "#92400e"),
                            }}>
                              {u.emailVerified ? "Verified" : "Unverified"}
                            </span>
                          </td>
                          <td style={{ padding: "11px 12px", verticalAlign: "middle" }}>
                            {u.role !== "ROLE_ADMIN" && (
                              <button
                                style={{ padding: "5px 10px", borderRadius: "6px", border: u.role==="ROLE_EMPLOYEE" ? "1px solid rgba(217,119,6,0.4)" : "1px solid rgba(37,99,235,0.4)", background: "transparent", color: u.role==="ROLE_EMPLOYEE" ? (dark?"#fbbf24":"#d97706") : (dark?"#60a5fa":"#2563eb"), fontSize: "12px", fontWeight: "500", marginRight: "6px", cursor: "pointer" }}
                                onClick={() => promoteUser(u)}
                              >
                                {u.role==="ROLE_EMPLOYEE" ? "Demote" : "Make Employee"}
                              </button>
                            )}
                            {u.role !== "ROLE_ADMIN" && (
                              <button style={{ padding: "5px 10px", borderRadius: "6px", border: "1px solid rgba(220,38,38,0.4)", background: "transparent", color: dark ? "#f87171" : "#dc2626", fontSize: "12px", fontWeight: "500", cursor: "pointer" }} onClick={() => deleteUser(u)}>Delete</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <Pagination total={filteredUsers.length} page={userPage} pageSize={PAGE_SIZE} onChange={setUserPage} />
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          AI DISCOVERY TAB
      ════════════════════════════════════════════════════════════════════ */}
      {tab === "discovery" && (
        <>
          {pendingError && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: dark ? "#450a0a" : "#fef2f2", border: `1px solid ${dark ? "#7f1d1d" : "#fecaca"}`, borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: dark ? "#f87171" : "#b91c1c", marginBottom: "14px" }}>
              <span>⚠️ {pendingError}</span>
              <button style={{ background: "transparent", border: "none", color: dark ? "#f87171" : "#b91c1c", cursor: "pointer", fontSize: "14px" }} onClick={() => setPendingError(null)}>✕</button>
            </div>
          )}

          {isEmployee && (
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              background: rejectionStatus.onCooldown ? (dark ? "#450a0a" : "#fef2f2") : (dark ? "#052e16" : "#f0fdf4"),
              border: `1px solid ${rejectionStatus.onCooldown ? (dark ? "#7f1d1d" : "#fecaca") : (dark ? "#14532d" : "#bbf7d0")}`,
              borderRadius: "8px", padding: "10px 14px", fontSize: "13px",
              color: rejectionStatus.onCooldown ? (dark ? "#f87171" : "#b91c1c") : (dark ? "#4ade80" : "#15803d"),
              marginBottom: "14px",
            }}>
              {rejectionStatus.onCooldown
                ? `🚫 Rejection limit reached. Cooldown: ${rejectionStatus.cooldownMinutesLeft} minute(s) remaining.`
                : `✅ Rejections this hour: ${rejectionStatus.used} / 10 used — ${rejectionStatus.remaining} remaining`}
            </div>
          )}

          {last5Approved.length > 0 && (
            <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h2 style={{ fontSize: "15px", fontWeight: "600", color: textPrimary, margin: 0 }}>✓ Last 5 approved — for reference</h2>
                <span style={{ background: dark ? "#052e16" : "#f0fdf4", color: dark ? "#4ade80" : "#15803d", fontSize: "12px", fontWeight: "500", padding: "3px 10px", borderRadius: "20px" }}>
                  {last5Approved.length} recent
                </span>
              </div>
              <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", minWidth: isMobile ? "500px" : "unset" }}>
                  <thead>
                    <tr>
                      {["Company","Role","Location","Source","Deadline"].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "9px 12px", fontSize: "11px", fontWeight: "600", color: textSecondary, textTransform: "uppercase", letterSpacing: "0.4px", borderBottom: `1px solid ${cardBorder}`, whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {last5Approved.map(d => {
                      const dl = deadlineBadge(d.deadline);
                      return (
                        <tr key={d.id} style={{ opacity: 0.8, borderBottom: `1px solid ${dark ? "#1e293b" : "#f1f5f9"}` }}>
                          <td style={{ padding: "11px 12px", color: textPrimary, fontWeight: "600", verticalAlign: "middle" }}>{d.companyName}</td>
                          <td style={{ padding: "11px 12px", color: textSecondary, verticalAlign: "middle" }}>{d.jobRole}</td>
                          <td style={{ padding: "11px 12px", color: textSecondary, verticalAlign: "middle" }}>{d.location || "—"}</td>
                          <td style={{ padding: "11px 12px", verticalAlign: "middle" }}>
                            <span style={{ display: "inline-flex", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", background: dark ? "#052e16" : "#f0fdf4", color: dark ? "#4ade80" : "#15803d" }}>
                              {d.source==="RSS_FEED"?"RSS":d.source==="AI_SEARCH"?"AI":"Manual"}
                            </span>
                          </td>
                          <td style={{ padding: "11px 12px", verticalAlign: "middle" }}>
                            <span style={{ display: "inline-flex", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", whiteSpace: "nowrap", background: dl.bg, color: dl.color, border: `1px solid ${dl.border}` }}>
                              {dl.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Pending drives ── */}
          <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <h2 style={{ fontSize: "15px", fontWeight: "600", color: textPrimary, margin: 0 }}>Pending AI-discovered drives</h2>
              <span style={{ background: dark ? "#0f172a" : "#f1f5f9", color: textSecondary, fontSize: "12px", fontWeight: "500", padding: "3px 10px", borderRadius: "20px" }}>{pendingDrives.length} awaiting review</span>
            </div>
            <p style={{ color: textSecondary, fontSize: "13px", marginTop: "0", marginBottom: "16px" }}>
              Found automatically by the discovery scheduler. Not visible publicly until approved.
              Verify deadlines marked "guessed" before approving.
            </p>
            {pendingLoading ? (
              <p style={{ color: textSecondary, fontSize: "14px" }}>Loading...</p>
            ) : pendingDrives.length === 0 ? (
              <p style={{ color: textSecondary, fontSize: "14px" }}>No pending drives right now.</p>
            ) : (
              <>
                <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", minWidth: isMobile ? "700px" : "unset" }}>
                    <thead>
                      <tr>
                        {["Company","Role","Location","Source","Auto-expire 30d","Link","Actions","Deadline"].map(h => (
                          <th key={h} style={{ textAlign: "left", padding: "9px 12px", fontSize: "11px", fontWeight: "600", color: textSecondary, textTransform: "uppercase", letterSpacing: "0.4px", borderBottom: `1px solid ${cardBorder}`, whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pagedPending.map(d => {
                        const dl = deadlineBadge(d.deadline);
                        const autoExpire = d.autoExpireAfter30Days !== false;
                        return (
                          <tr key={d.id} style={{ borderBottom: `1px solid ${dark ? "#1e293b" : "#f1f5f9"}` }}>
                            <td style={{ padding: "11px 12px", color: textPrimary, fontWeight: "600", verticalAlign: "middle" }}>{d.companyName}</td>
                            <td style={{ padding: "11px 12px", color: textSecondary, verticalAlign: "middle" }}>{d.jobRole}</td>
                            <td style={{ padding: "11px 12px", color: textSecondary, verticalAlign: "middle" }}>{d.location || "—"}</td>
                            <td style={{ padding: "11px 12px", verticalAlign: "middle" }}>
                              <span style={{
                                display: "inline-flex", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600",
                                background: d.source==="RSS_FEED"?(dark?"#052e16":"#f0fdf4"):d.source==="AI_SEARCH"?(dark?"#0c2a3e":"#eff6ff"):(dark?"#1e293b":"#f1f5f9"),
                                color:      d.source==="RSS_FEED"?(dark?"#4ade80":"#15803d"):d.source==="AI_SEARCH"?(dark?"#38bdf8":"#1d4ed8"):(dark?"#94a3b8":"#64748b"),
                              }}>
                                {d.source==="RSS_FEED"?"RSS":d.source==="AI_SEARCH"?"AI Search":"Manual"}
                              </span>
                            </td>
                            <td style={{ padding: "11px 12px", verticalAlign: "middle" }}>
                              <span style={{
                                display: "inline-flex", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600",
                                background: autoExpire ? (dark?"#052e16":"#f0fdf4") : (dark?"#1e293b":"#f1f5f9"),
                                color:      autoExpire ? (dark?"#4ade80":"#15803d") : textSecondary,
                              }}>
                                {autoExpire ? "ON" : "OFF"}
                              </span>
                            </td>
                            <td style={{ padding: "11px 12px", verticalAlign: "middle" }}>
                              {d.applyLink
                                ? <a href={d.applyLink} target="_blank" rel="noopener noreferrer" style={{ color: dark ? "#60a5fa" : "#2563eb", fontSize: "12px" }}>View ↗</a>
                                : "—"}
                            </td>
                            <td style={{ padding: "11px 12px", verticalAlign: "middle" }}>
                              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                                <button style={{ padding: "5px 10px", borderRadius: "6px", border: `1px solid ${cardBorder}`, background: "transparent", color: textPrimary, fontSize: "12px", fontWeight: "500", cursor: "pointer" }} onClick={() => openEdit(d)}>Edit</button>
                                <button style={{ padding: "5px 10px", borderRadius: "6px", border: "1px solid rgba(37,99,235,0.4)", background: "transparent", color: dark?"#60a5fa":"#2563eb", fontSize: "12px", fontWeight: "500", cursor: "pointer" }} onClick={() => approveDrive(d)}>Approve</button>
                                <button
                                  style={{ padding: "5px 10px", borderRadius: "6px", border: "1px solid rgba(220,38,38,0.4)", background: "transparent", color: dark?"#f87171":"#dc2626", fontSize: "12px", fontWeight: "500", cursor: "pointer", opacity: (!isAdmin && rejectionStatus.onCooldown) ? 0.4 : 1 }}
                                  disabled={!isAdmin && rejectionStatus.onCooldown}
                                  onClick={() => rejectDrive(d)}
                                >
                                  Reject
                                </button>
                              </div>
                            </td>
                            <td style={{ padding: "11px 12px", verticalAlign: "middle" }}>
                              <span style={{ display: "inline-flex", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", whiteSpace: "nowrap", background: dl.bg, color: dl.color, border: `1px solid ${dl.border}` }}>
                                {dl.label}
                                {d.deadlineGuessed && <span style={{ marginLeft: 4, opacity: 0.7 }}>⚠</span>}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <Pagination total={pendingDrives.length} page={pendingPage} pageSize={PAGE_SIZE} onChange={setPendingPage} />
              </>
            )}
          </div>

          {/* ── Rejected drives ── */}
          <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "15px", fontWeight: "600", color: textPrimary, margin: 0 }}>✕ Rejected drives</h2>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ fontSize: "11px", color: textSecondary }}>Auto-deleted after 3 days</span>
                <span style={{ background: dark ? "#450a0a" : "#fef2f2", color: dark ? "#f87171" : "#b91c1c", fontSize: "12px", fontWeight: "500", padding: "3px 10px", borderRadius: "20px" }}>
                  {rejectedDrives.length}
                </span>
              </div>
            </div>
            {rejectedDrives.length === 0 ? (
              <p style={{ color: textSecondary, fontSize: "14px" }}>No rejected drives.</p>
            ) : (
              <>
                <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", minWidth: isMobile ? "600px" : "unset" }}>
                    <thead>
                      <tr>
                        {["Company","Role","Location","Source","Actions","Deadline"].map(h => (
                          <th key={h} style={{ textAlign: "left", padding: "9px 12px", fontSize: "11px", fontWeight: "600", color: textSecondary, textTransform: "uppercase", letterSpacing: "0.4px", borderBottom: `1px solid ${cardBorder}`, whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pagedRejected.map(d => {
                        const dl = deadlineBadge(d.deadline);
                        return (
                          <tr key={d.id} style={{ opacity: 0.75, borderBottom: `1px solid ${dark ? "#1e293b" : "#f1f5f9"}` }}>
                            <td style={{ padding: "11px 12px", color: textPrimary, fontWeight: "600", verticalAlign: "middle" }}>{d.companyName}</td>
                            <td style={{ padding: "11px 12px", color: textSecondary, verticalAlign: "middle" }}>{d.jobRole}</td>
                            <td style={{ padding: "11px 12px", color: textSecondary, verticalAlign: "middle" }}>{d.location || "—"}</td>
                            <td style={{ padding: "11px 12px", verticalAlign: "middle" }}>
                              <span style={{ display: "inline-flex", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", background: dark ? "#450a0a" : "#fee2e2", color: dark ? "#f87171" : "#b91c1c" }}>
                                {d.source==="RSS_FEED"?"RSS":d.source==="AI_SEARCH"?"AI":"Manual"}
                              </span>
                            </td>
                            <td style={{ padding: "11px 12px", verticalAlign: "middle" }}>
                              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                                <button style={{ padding: "5px 10px", borderRadius: "6px", border: `1px solid ${cardBorder}`, background: "transparent", color: textPrimary, fontSize: "12px", fontWeight: "500", cursor: "pointer" }} onClick={() => openEdit(d)}>Edit</button>
                                <button style={{ padding: "5px 10px", borderRadius: "6px", border: "1px solid rgba(37,99,235,0.4)", background: "transparent", color: dark?"#60a5fa":"#2563eb", fontSize: "12px", fontWeight: "500", cursor: "pointer" }} onClick={() => approveDrive(d)}>Approve anyway</button>
                              </div>
                            </td>
                            <td style={{ padding: "11px 12px", verticalAlign: "middle" }}>
                              <span style={{ display: "inline-flex", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", whiteSpace: "nowrap", background: dl.bg, color: dl.color, border: `1px solid ${dl.border}` }}>
                                {dl.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <Pagination total={rejectedDrives.length} page={rejectedPage} pageSize={PAGE_SIZE} onChange={setRejectedPage} />
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default AdminDashboard;