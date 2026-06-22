import { useEffect, useState, useCallback } from "react";
import { useTheme } from "../context/ThemeContext";
import axios from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const PAGE_SIZE = 15;

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
  padding: "5px 12px", borderRadius: "6px", border: "1px solid #e2e8f0",
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
  const [drives, setDrives]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [error, setError]         = useState(null);
  const [drivePage, setDrivePage] = useState(1);

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
    used: 0, remaining: 5, onCooldown: false, cooldownMinutesLeft: 0,
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
      companyName:     drive.companyName     || "",
      jobRole:         drive.jobRole         || "",
      location:        drive.location        || "",
      deadline:        drive.deadline        || "",
      ctcDisplay:      drive.ctcDisplay      || "",
      eligibleBatches: drive.eligibleBatches || "",
      applyLink:       drive.applyLink       || "",
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

  const t = dark ? dm : s;

  if (!canAccess) {
    return (
      <div style={t.deniedPage}>
        <div style={t.deniedCard}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔒</div>
          <h2 style={t.deniedTitle}>Access Denied</h2>
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

  // ── Pagination slices ───────────────────────────────────────────────────
  const pagedDrives   = drives.slice((drivePage - 1) * PAGE_SIZE, drivePage * PAGE_SIZE);
  const pagedUsers    = filteredUsers.slice((userPage - 1) * PAGE_SIZE, userPage * PAGE_SIZE);
  const pagedPending  = pendingDrives.slice((pendingPage - 1) * PAGE_SIZE, pendingPage * PAGE_SIZE);
  const pagedRejected = rejectedDrives.slice((rejectedPage - 1) * PAGE_SIZE, rejectedPage * PAGE_SIZE);

  // reset user page when search changes
  const handleUserSearch = (v) => { setUserSearch(v); setUserPage(1); };

  // ── Deadline badge helper ───────────────────────────────────────────────
  const deadlineBadge = (deadline) => {
    if (!deadline) return { label: "—", color: "#94a3b8", bg: "transparent", border: "transparent" };
    const diff = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff < 0)  return { label: deadline, color: "#b91c1c", bg: "#fef2f2",  border: "#fecaca" };
    if (diff <= 3) return { label: `${deadline} (${diff}d)`, color: "#b45309", bg: "#fffbeb", border: "#fde68a" };
    if (diff <= 7) return { label: `${deadline} (${diff}d)`, color: "#0369a1", bg: "#f0f9ff", border: "#bae6fd" };
    return         { label: deadline, color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" };
  };

  const tabs = [
    ...(isAdmin ? [{ key: "drives",    label: "Drives" }] : []),
    ...(isAdmin ? [{ key: "users",     label: `Users${users.length > 0 ? ` (${users.length})` : ""}` }] : []),
    { key: "discovery", label: `AI Discovery${pendingDrives.length > 0 ? ` (${pendingDrives.length})` : ""}` },
  ];

  return (
    <div style={{ ...t.page, padding: isMobile ? "16px 12px" : "24px 20px" }}>

      {/* ── Edit modal ────────────────────────────────────────────────────── */}
      {editingDrive && (
        <div style={modalOverlay}>
          <div style={{ ...modalBox, width: isMobile ? "95vw" : "520px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "600", color: dark ? "#f1f5f9" : "#0f172a" }}>
                Edit drive
              </h3>
              <button onClick={() => setEditingDrive(null)} style={closeBtnStyle}>✕</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "12px" }}>
              {[
                { key: "companyName",     label: "Company name"         },
                { key: "jobRole",         label: "Job role"             },
                { key: "location",        label: "Location"             },
                { key: "deadline",        label: "Deadline (YYYY-MM-DD)"},
                { key: "ctcDisplay",      label: "CTC / Salary"         },
                { key: "eligibleBatches", label: "Eligible batches"     },
                { key: "applyLink",       label: "Apply link"           },
              ].map(({ key, label }) => (
                <div key={key} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                    {label}
                  </label>
                  <input
                    style={{ ...t.input, fontSize: "13px" }}
                    value={editFields[key] || ""}
                    onChange={e => setEditFields({ ...editFields, [key]: e.target.value })}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "18px", justifyContent: "flex-end" }}>
              <button onClick={() => setEditingDrive(null)} style={t.cancelBtn}>Cancel</button>
              <button onClick={saveEdit} disabled={editSaving} style={{ ...s.primaryBtn, opacity: editSaving ? 0.6 : 1 }}>
                {editSaving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOP BAR ──────────────────────────────────────────────────────── */}
      <div style={{ ...s.topBar, flexWrap: isMobile ? "wrap" : "nowrap", gap: isMobile ? "10px" : "0" }}>
        <div style={s.topLeft}>
          <div style={s.brandIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div>
            <div style={t.pageTitle}>{isAdmin ? "Admin dashboard" : "Employee dashboard"}</div>
            <div style={s.pageSub}>Manage drives</div>
          </div>
        </div>
        <div style={t.adminPill}>
          <div style={s.avatar}>{isAdmin ? "A" : "E"}</div>
          {auth.name || (isAdmin ? "Admin" : "Employee")}
          <span style={t.roleBadge}>{isAdmin ? "ADMIN" : "EMPLOYEE"}</span>
        </div>
      </div>

      {/* ── TABS ─────────────────────────────────────────────────────────── */}
      <div style={{ ...s.tabRow, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        {tabs.map(tb => (
          <button key={tb.key} style={tab === tb.key ? t.tabBtnActive : t.tabBtn} onClick={() => setTab(tb.key)}>
            {tb.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          DRIVES TAB
      ════════════════════════════════════════════════════════════════════ */}
      {tab === "drives" && isAdmin && (
        <>
          <div style={{ ...s.metricsGrid, gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)" }}>
            {[
              { label: "Total drives",   value: drives.length },
              { label: "Auto-delete on", value: activeCount   },
              { label: "Expiring soon",  value: expiringCount, warn: true },
              { label: "Active drives",  value: drives.filter(d => d.status === "ACTIVE").length },
            ].map(m => (
              <div key={m.label} style={t.metricCard}>
                <div style={s.metricLabel}>{m.label}</div>
                <div style={{ ...t.metricVal, color: m.warn && m.value > 0 ? "#d97706" : (dark ? "#f1f5f9" : "#0f172a") }}>
                  {m.value}
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div style={s.errorBanner}>
              <span>⚠️ {error}</span>
              <button style={s.errorClose} onClick={() => setError(null)}>✕</button>
            </div>
          )}

          <div style={t.card}>
            <div style={s.cardHeader}>
              <h2 style={t.cardTitle}>{editingId ? "Edit drive" : "Create drive"}</h2>
              {editingId && <button onClick={cancelEdit} style={t.cancelBtn}>Cancel</button>}
            </div>
            <div style={{ ...s.formGrid, gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)" }}>
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
                <div key={key} style={s.formField}>
                  <label style={s.fieldLabel}>{placeholder.split(" (")[0]}</label>
                  <input style={t.input} placeholder={placeholder} value={form[key]} onChange={set(key)} />
                </div>
              ))}
              <div style={s.formField}>
                <label style={s.fieldLabel}>Category</label>
                <select style={t.input} value={form.category} onChange={set("category")}>
                  <option value="IT_SOFTWARE">IT / Software</option>
                  <option value="CORE_ENGINEERING">Core Engineering</option>
                  <option value="GOVERNMENT">Government</option>
                  <option value="BANKING">Banking</option>
                  <option value="MANAGEMENT">Management</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="OTHERS">Others</option>
                </select>
              </div>
              <div style={s.formField}>
                <label style={s.fieldLabel}>Status</label>
                <select style={t.input} value={form.status} onChange={set("status")}>
                  <option value="ACTIVE">Active</option>
                  <option value="UPCOMING">Upcoming</option>
                  <option value="CLOSED">Closed</option>
                  <option value="EXPIRED">Expired</option>
                </select>
              </div>
              <div style={s.formField}>
                <label style={s.fieldLabel}>Job type</label>
                <select style={t.input} value={form.jobType} onChange={set("jobType")}>
                  <option value="Full-Time">Full-Time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>
              <div style={s.formField}>
                <label style={s.fieldLabel}>Experience level</label>
                <select style={t.input} value={form.experienceLevel} onChange={set("experienceLevel")}>
                  <option>Freshers</option>
                  <option>0-1 Years</option>
                  <option>1-2 Years</option>
                  <option>2-3 Years</option>
                  <option>3+ Years</option>
                </select>
              </div>
              <div style={s.formField}>
                <label style={s.fieldLabel}>Deadline *</label>
                <input type="date" style={t.input} value={form.deadline} onChange={set("deadline")} />
              </div>
            </div>
            <div style={{ ...s.formField, marginTop: "12px" }}>
              <label style={s.fieldLabel}>Job description</label>
              <textarea
                style={{ ...t.input, minHeight: "110px", resize: "vertical", fontFamily: "inherit" }}
                placeholder="Describe the role..."
                value={form.jobDescription}
                onChange={set("jobDescription")}
              />
            </div>
            <label style={t.toggleRow}>
              <input type="checkbox" checked={form.autoDeleteEnabled}
                onChange={e => setForm({ ...form, autoDeleteEnabled: e.target.checked })} />
              <span>Auto-delete after deadline</span>
            </label>
            <div style={s.submitRow}>
              <button style={s.primaryBtn} onClick={editingId ? handleUpdate : handleAdd}>
                {editingId ? "Update drive" : "Publish drive"}
              </button>
              {!editingId && (
                <button onClick={() => setForm(emptyForm)} style={t.resetBtn}>Reset</button>
              )}
            </div>
          </div>

          {/* ── Live drives table with pagination ── */}
          <div style={t.card}>
            <div style={s.cardHeader}>
              <h2 style={t.cardTitle}>Live drives</h2>
              <span style={t.countBadge}>{drives.length} total</span>
            </div>
            {loading ? (
              <p style={{ color: "#94a3b8", fontSize: "14px" }}>Loading...</p>
            ) : drives.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: "14px" }}>No drives yet.</p>
            ) : (
              <>
                <div style={{ overflowX: "auto" }}>
                  <table style={s.table}>
                    <thead>
                      <tr>
                        {["Company","Role","Location","CTC","Category","Status","Auto-del","Actions","Deadline"].map(h => (
                          <th key={h} style={t.th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pagedDrives.map(d => {
                        const dl = deadlineBadge(d.deadline);
                        return (
                          <tr key={d.id}>
                            <td style={{ ...t.td, fontWeight: "600", color: dark ? "#f1f5f9" : "#0f172a" }}>{d.companyName}</td>
                            <td style={t.td}>{d.jobRole}</td>
                            <td style={t.td}>{d.location || "—"}</td>
                            <td style={t.td}>{d.ctcDisplay || "—"}</td>
                            <td style={t.td}>{d.category || "—"}</td>
                            <td style={t.td}>
                              <span style={{ ...s.badge,
                                background: d.status==="ACTIVE"?"#dcfce7":d.status==="UPCOMING"?"#eff6ff":d.status==="EXPIRED"?"#fef9c3":"#fee2e2",
                                color:      d.status==="ACTIVE"?"#15803d":d.status==="UPCOMING"?"#1d4ed8":d.status==="EXPIRED"?"#92400e":"#b91c1c",
                              }}>{d.status}</span>
                            </td>
                            <td style={t.td}>
                              <span style={{ ...s.badge,
                                background: d.autoDeleteEnabled ? "#dcfce7" : "#f1f5f9",
                                color:      d.autoDeleteEnabled ? "#15803d" : "#94a3b8",
                              }}>
                                {d.autoDeleteEnabled ? "ON" : "OFF"}
                              </span>
                            </td>
                            <td style={t.td}>
                              <button style={t.editBtn} onClick={() => startEdit(d)}>Edit</button>
                              {isAdmin && (
                                <button style={{ ...s.deleteBtn, marginLeft: 4 }} onClick={() => deleteDrive(d.id)}>Delete</button>
                              )}
                            </td>
                            {/* Deadline — far right, colored badge */}
                            <td style={t.td}>
                              <span style={{
                                ...s.badge,
                                background: dl.bg,
                                color:      dl.color,
                                border:     `1px solid ${dl.border}`,
                                fontSize:   11,
                                whiteSpace: "nowrap",
                              }}>
                                {dl.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  total={drives.length}
                  page={drivePage}
                  pageSize={PAGE_SIZE}
                  onChange={setDrivePage}
                />
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
            <div style={s.errorBanner}>
              <span>⚠️ {userError}</span>
              <button style={s.errorClose} onClick={() => setUserError(null)}>✕</button>
            </div>
          )}
          <div style={t.card}>
            <div style={s.cardHeader}>
              <h2 style={t.cardTitle}>Registered users</h2>
              <span style={t.countBadge}>{filteredUsers.length} shown</span>
            </div>
            <div style={s.formField}>
              <input
                style={t.input}
                placeholder="Search by name, email, or college..."
                value={userSearch}
                onChange={e => handleUserSearch(e.target.value)}
              />
            </div>
            <div style={{ marginTop: "14px", overflowX: "auto" }}>
              {usersLoading ? (
                <p style={{ color: "#94a3b8", fontSize: "14px" }}>Loading...</p>
              ) : filteredUsers.length === 0 ? (
                <p style={{ color: "#94a3b8", fontSize: "14px" }}>No users found.</p>
              ) : (
                <>
                  <table style={s.table}>
                    <thead>
                      <tr>
                        {["Name","Email","Role","College","Branch","Batch","Verified","Actions"].map(h => (
                          <th key={h} style={t.th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pagedUsers.map(u => (
                        <tr key={u.id}>
                          <td style={{ ...t.td, fontWeight: "600", color: dark ? "#f1f5f9" : "#0f172a" }}>{u.name || "—"}</td>
                          <td style={t.td}>{u.email}</td>
                          <td style={t.td}>
                            <span style={{ ...s.badge,
                              background: u.role==="ROLE_ADMIN"?"#ede9fe":u.role==="ROLE_EMPLOYEE"?"#fef3c7":"#f1f5f9",
                              color:      u.role==="ROLE_ADMIN"?"#6d28d9":u.role==="ROLE_EMPLOYEE"?"#92400e":"#64748b",
                            }}>
                              {u.role==="ROLE_ADMIN"?"Admin":u.role==="ROLE_EMPLOYEE"?"Employee":"User"}
                            </span>
                          </td>
                          <td style={t.td}>{u.college || "—"}</td>
                          <td style={t.td}>{u.branch  || "—"}</td>
                          <td style={t.td}>{u.batchYear|| "—"}</td>
                          <td style={t.td}>
                            <span style={{ ...s.badge,
                              background: u.emailVerified ? "#dcfce7" : "#fef9c3",
                              color:      u.emailVerified ? "#15803d" : "#92400e",
                            }}>
                              {u.emailVerified ? "Verified" : "Unverified"}
                            </span>
                          </td>
                          <td style={t.td}>
                            {u.role !== "ROLE_ADMIN" && (
                              <button style={u.role==="ROLE_EMPLOYEE" ? s.demoteBtn : t.promoteBtn} onClick={() => promoteUser(u)}>
                                {u.role==="ROLE_EMPLOYEE" ? "Demote" : "Make Employee"}
                              </button>
                            )}
                            {u.role !== "ROLE_ADMIN" && (
                              <button style={s.deleteBtn} onClick={() => deleteUser(u)}>Delete</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <Pagination
                    total={filteredUsers.length}
                    page={userPage}
                    pageSize={PAGE_SIZE}
                    onChange={setUserPage}
                  />
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
            <div style={s.errorBanner}>
              <span>⚠️ {pendingError}</span>
              <button style={s.errorClose} onClick={() => setPendingError(null)}>✕</button>
            </div>
          )}

          {isEmployee && (
            <div style={{
              ...s.errorBanner,
              background:   rejectionStatus.onCooldown ? "#fef2f2" : "#f0fdf4",
              borderColor:  rejectionStatus.onCooldown ? "#fecaca" : "#bbf7d0",
              color:        rejectionStatus.onCooldown ? "#b91c1c" : "#15803d",
              marginBottom: "14px",
            }}>
              {rejectionStatus.onCooldown
                ? `🚫 Rejection limit reached. Cooldown: ${rejectionStatus.cooldownMinutesLeft} minute(s) remaining.`
                : `✅ Rejections this hour: ${rejectionStatus.used} / 5 used — ${rejectionStatus.remaining} remaining`}
            </div>
          )}

          {last5Approved.length > 0 && (
            <div style={{ ...t.card, marginBottom: "16px" }}>
              <div style={s.cardHeader}>
                <h2 style={t.cardTitle}>✓ Last 5 approved — for reference</h2>
                <span style={{ ...t.countBadge, background: "#f0fdf4", color: "#15803d" }}>
                  {last5Approved.length} recent
                </span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      {["Company","Role","Location","Source","Deadline"].map(h => (
                        <th key={h} style={t.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {last5Approved.map(d => {
                      const dl = deadlineBadge(d.deadline);
                      return (
                        <tr key={d.id} style={{ opacity: 0.75 }}>
                          <td style={{ ...t.td, fontWeight: "600", color: dark ? "#f1f5f9" : "#0f172a" }}>{d.companyName}</td>
                          <td style={t.td}>{d.jobRole}</td>
                          <td style={t.td}>{d.location || "—"}</td>
                          <td style={t.td}>
                            <span style={{ ...s.badge, background: "#f0fdf4", color: "#15803d" }}>
                              {d.source==="RSS_FEED"?"RSS":d.source==="AI_SEARCH"?"AI":"Manual"}
                            </span>
                          </td>
                          <td style={t.td}>
                            <span style={{ ...s.badge, background: dl.bg, color: dl.color, border: `1px solid ${dl.border}`, fontSize: 11 }}>
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

          {/* ── Pending drives with pagination ── */}
          <div style={t.card}>
            <div style={s.cardHeader}>
              <h2 style={t.cardTitle}>Pending AI-discovered drives</h2>
              <span style={t.countBadge}>{pendingDrives.length} awaiting review</span>
            </div>
            <p style={{ color: "#94a3b8", fontSize: "13px", marginTop: "-8px", marginBottom: "16px" }}>
              Found automatically by the discovery scheduler. Not visible publicly until approved.
              Verify deadlines marked "guessed" before approving.
            </p>
            {pendingLoading ? (
              <p style={{ color: "#94a3b8", fontSize: "14px" }}>Loading...</p>
            ) : pendingDrives.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: "14px" }}>No pending drives right now.</p>
            ) : (
              <>
                <div style={{ overflowX: "auto" }}>
                  <table style={s.table}>
                    <thead>
                      <tr>
                        {["Company","Role","Location","Source","Link","Actions","Deadline"].map(h => (
                          <th key={h} style={t.th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pagedPending.map(d => {
                        const dl = deadlineBadge(d.deadline);
                        return (
                          <tr key={d.id}>
                            <td style={{ ...t.td, fontWeight: "600", color: dark ? "#f1f5f9" : "#0f172a" }}>{d.companyName}</td>
                            <td style={t.td}>{d.jobRole}</td>
                            <td style={t.td}>{d.location || "—"}</td>
                            <td style={t.td}>
                              <span style={{ ...s.badge,
                                background: d.source==="RSS_FEED"?"#f0fdf4":d.source==="AI_SEARCH"?"#eff6ff":"#f1f5f9",
                                color:      d.source==="RSS_FEED"?"#15803d":d.source==="AI_SEARCH"?"#1d4ed8":"#64748b",
                              }}>
                                {d.source==="RSS_FEED"?"RSS":d.source==="AI_SEARCH"?"AI Search":"Manual"}
                              </span>
                            </td>
                            <td style={t.td}>
                              {d.applyLink
                                ? <a href={d.applyLink} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", fontSize: "12px" }}>View ↗</a>
                                : "—"}
                            </td>
                            <td style={t.td}>
                              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                                <button style={t.editBtn} onClick={() => openEdit(d)}>Edit</button>
                                <button style={t.promoteBtn} onClick={() => approveDrive(d)}>Approve</button>
                                <button
                                  style={{ ...s.deleteBtn, opacity: (!isAdmin && rejectionStatus.onCooldown) ? 0.4 : 1 }}
                                  disabled={!isAdmin && rejectionStatus.onCooldown}
                                  onClick={() => rejectDrive(d)}
                                >
                                  Reject
                                </button>
                              </div>
                            </td>
                            {/* Deadline — far right */}
                            <td style={t.td}>
                              <span style={{ ...s.badge, background: dl.bg, color: dl.color, border: `1px solid ${dl.border}`, fontSize: 11, whiteSpace: "nowrap" }}>
                                {dl.label}
                                {d.deadlineGuessed && (
                                  <span style={{ marginLeft: 4, opacity: 0.7 }}>⚠</span>
                                )}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  total={pendingDrives.length}
                  page={pendingPage}
                  pageSize={PAGE_SIZE}
                  onChange={setPendingPage}
                />
              </>
            )}
          </div>

          {/* ── Rejected drives with pagination ── */}
          <div style={t.card}>
            <div style={s.cardHeader}>
              <h2 style={t.cardTitle}>✕ Rejected drives</h2>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>Auto-deleted after 3 days</span>
                <span style={{ ...t.countBadge, background: "#fef2f2", color: "#b91c1c" }}>
                  {rejectedDrives.length}
                </span>
              </div>
            </div>
            {rejectedDrives.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: "14px" }}>No rejected drives.</p>
            ) : (
              <>
                <div style={{ overflowX: "auto" }}>
                  <table style={s.table}>
                    <thead>
                      <tr>
                        {["Company","Role","Location","Source","Actions","Deadline"].map(h => (
                          <th key={h} style={t.th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pagedRejected.map(d => {
                        const dl = deadlineBadge(d.deadline);
                        return (
                          <tr key={d.id} style={{ opacity: 0.7 }}>
                            <td style={{ ...t.td, fontWeight: "600", color: dark ? "#f1f5f9" : "#0f172a" }}>{d.companyName}</td>
                            <td style={t.td}>{d.jobRole}</td>
                            <td style={t.td}>{d.location || "—"}</td>
                            <td style={t.td}>
                              <span style={{ ...s.badge, background: "#fee2e2", color: "#b91c1c" }}>
                                {d.source==="RSS_FEED"?"RSS":d.source==="AI_SEARCH"?"AI":"Manual"}
                              </span>
                            </td>
                            <td style={t.td}>
                              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                                <button style={t.editBtn} onClick={() => openEdit(d)}>Edit</button>
                                <button style={t.promoteBtn} onClick={() => approveDrive(d)}>Approve anyway</button>
                              </div>
                            </td>
                            {/* Deadline — far right */}
                            <td style={t.td}>
                              <span style={{ ...s.badge, background: dl.bg, color: dl.color, border: `1px solid ${dl.border}`, fontSize: 11, whiteSpace: "nowrap" }}>
                                {dl.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  total={rejectedDrives.length}
                  page={rejectedPage}
                  pageSize={PAGE_SIZE}
                  onChange={setRejectedPage}
                />
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default AdminDashboard;

// ── Modal styles ──────────────────────────────────────────────────────────────
const modalOverlay = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 1000, padding: "16px",
};
const modalBox = {
  background: "#fff", borderRadius: "12px", padding: "24px",
  maxHeight: "90vh", overflowY: "auto",
};
const closeBtnStyle = {
  background: "transparent", border: "none", fontSize: "18px",
  cursor: "pointer", color: "#94a3b8", lineHeight: 1,
};

// ── LIGHT ─────────────────────────────────────────────────────────────────────
const s = {
  page:       { maxWidth: "1200px", margin: "0 auto", fontFamily: "'Inter', system-ui, sans-serif", background: "#f8fafc", minHeight: "100vh" },
  topBar:     { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  topLeft:    { display: "flex", alignItems: "center", gap: "12px" },
  brandIcon:  { width: "34px", height: "34px", background: "#2563eb", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  pageTitle:  { fontSize: "17px", fontWeight: "700", color: "#0f172a", letterSpacing: "-0.3px" },
  pageSub:    { fontSize: "12px", color: "#94a3b8", marginTop: "1px" },
  adminPill:  { display: "flex", alignItems: "center", gap: "8px", background: "white", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "6px 14px 6px 8px", fontSize: "13px", fontWeight: "500", color: "#475569" },
  roleBadge:  { fontSize: "10px", fontWeight: "600", padding: "2px 8px", borderRadius: "20px", background: "#f1f5f9", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.4px" },
  avatar:     { width: "24px", height: "24px", borderRadius: "50%", background: "#2563eb", color: "white", fontSize: "11px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center" },
  tabRow:     { display: "flex", gap: "6px", marginBottom: "16px" },
  tabBtn:     { padding: "8px 18px", background: "transparent", color: "#94a3b8", border: "none", borderBottom: "2px solid transparent", fontSize: "13px", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap" },
  tabBtnActive:{ padding: "8px 18px", background: "transparent", color: "#0f172a", border: "none", borderBottom: "2px solid #2563eb", fontSize: "13px", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap" },
  metricsGrid:{ display: "grid", gap: "10px", marginBottom: "16px" },
  metricCard: { background: "white", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px 16px" },
  metricLabel:{ fontSize: "11px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" },
  metricVal:  { fontSize: "24px", fontWeight: "700", marginTop: "4px", color: "#0f172a" },
  card:       { background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", marginBottom: "16px" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
  cardTitle:  { fontSize: "15px", fontWeight: "600", color: "#0f172a", margin: 0 },
  cancelBtn:  { padding: "5px 12px", background: "transparent", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "12px", color: "#64748b", cursor: "pointer" },
  countBadge: { background: "#f1f5f9", color: "#64748b", fontSize: "12px", fontWeight: "500", padding: "3px 10px", borderRadius: "20px" },
  errorBanner:{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#b91c1c", marginBottom: "14px" },
  errorClose: { background: "transparent", border: "none", color: "#b91c1c", cursor: "pointer", fontSize: "14px" },
  formGrid:   { display: "grid", gap: "12px" },
  formField:  { display: "flex", flexDirection: "column", gap: "5px" },
  fieldLabel: { fontSize: "11px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.4px" },
  input:      { padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: "7px", fontSize: "13px", background: "#f8fafc", color: "#0f172a", outline: "none", width: "100%", boxSizing: "border-box" },
  toggleRow:  { display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#475569", marginTop: "14px", cursor: "pointer" },
  submitRow:  { display: "flex", gap: "8px", marginTop: "14px" },
  primaryBtn: { padding: "9px 20px", background: "#2563eb", color: "white", border: "none", borderRadius: "7px", fontSize: "13px", fontWeight: "600", cursor: "pointer" },
  resetBtn:   { padding: "9px 16px", background: "transparent", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: "7px", fontSize: "13px", cursor: "pointer" },
  table:      { width: "100%", borderCollapse: "collapse", fontSize: "13px" },
  th:         { textAlign: "left", padding: "9px 12px", fontSize: "11px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.4px", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" },
  td:         { padding: "11px 12px", borderBottom: "1px solid #f1f5f9", color: "#475569", verticalAlign: "middle" },
  badge:      { display: "inline-flex", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600" },
  editBtn:    { padding: "5px 10px", borderRadius: "6px", border: "1px solid #e2e8f0", background: "transparent", color: "#0f172a", fontSize: "12px", fontWeight: "500", cursor: "pointer" },
  deleteBtn:  { padding: "5px 10px", borderRadius: "6px", border: "1px solid rgba(220,38,38,0.3)", background: "transparent", color: "#dc2626", fontSize: "12px", fontWeight: "500", cursor: "pointer" },
  demoteBtn:  { padding: "5px 10px", borderRadius: "6px", border: "1px solid rgba(217,119,6,0.3)", background: "transparent", color: "#d97706", fontSize: "12px", fontWeight: "500", marginRight: "6px", cursor: "pointer" },
  promoteBtn: { padding: "5px 10px", borderRadius: "6px", border: "1px solid rgba(37,99,235,0.3)", background: "transparent", color: "#2563eb", fontSize: "12px", fontWeight: "500", cursor: "pointer" },
  deniedPage: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f8fafc" },
  deniedCard: { background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "48px", textAlign: "center" },
  deniedTitle:{ fontSize: "20px", fontWeight: "700", color: "#0f172a", margin: "0 0 8px" },
};

// ── DARK ──────────────────────────────────────────────────────────────────────
const dm = {
  ...s,
  page:        { ...s.page,        background: "#0f172a" },
  pageTitle:   { ...s.pageTitle,   color: "#f1f5f9" },
  adminPill:   { ...s.adminPill,   background: "#1e293b", borderColor: "#334155", color: "#94a3b8" },
  roleBadge:   { ...s.roleBadge,   background: "#0f172a", color: "#64748b" },
  metricCard:  { ...s.metricCard,  background: "#1e293b", borderColor: "#334155" },
  metricVal:   { ...s.metricVal,   color: "#f1f5f9" },
  card:        { ...s.card,        background: "#1e293b", borderColor: "#334155" },
  cardTitle:   { ...s.cardTitle,   color: "#f1f5f9" },
  cancelBtn:   { ...s.cancelBtn,   borderColor: "#334155", color: "#94a3b8" },
  countBadge:  { ...s.countBadge,  background: "#0f172a", color: "#64748b" },
  input:       { ...s.input,       background: "#0f172a", borderColor: "#334155", color: "#f1f5f9" },
  toggleRow:   { ...s.toggleRow,   color: "#94a3b8" },
  resetBtn:    { ...s.resetBtn,    borderColor: "#334155", color: "#94a3b8" },
  th:          { ...s.th,          borderBottomColor: "#334155" },
  td:          { ...s.td,          borderBottomColor: "#1e293b", color: "#94a3b8" },
  editBtn:     { ...s.editBtn,     borderColor: "#334155", color: "#f1f5f9" },
  promoteBtn:  { ...s.promoteBtn,  borderColor: "rgba(37,99,235,0.4)", color: "#60a5fa" },
  tabBtn:      { ...s.tabBtn,      color: "#64748b" },
  tabBtnActive:{ ...s.tabBtnActive,color: "#f1f5f9" },
  deniedPage:  { ...s.deniedPage,  background: "#0f172a" },
  deniedCard:  { ...s.deniedCard,  background: "#1e293b", borderColor: "#334155" },
  deniedTitle: { ...s.deniedTitle, color: "#f1f5f9" },
};