import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import axios from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

function AdminDashboard() {
  const { auth } = useAuth();
  const { dark } = useTheme();

  const isAdmin    = auth.role === "ROLE_ADMIN";
  const isEmployee = auth.role === "ROLE_EMPLOYEE";
  const canAccess  = isAdmin || isEmployee;

  const [tab, setTab] = useState("drives"); // "drives" | "users"

  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

  // ── Users tab state ─────────────────────────────────────────────────────
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userError, setUserError] = useState(null);
  const [userSearch, setUserSearch] = useState("");

  const emptyForm = {
    companyName: "",
    jobRole: "",
    jobDescription: "",
    keySkills: "",
    location: "",
    ctcDisplay: "",
    minCgpa: "",
    deadline: "",
    eligibleBranches: "",
    eligibleBatches: "",
    experienceLevel: "Freshers",
    category: "IT_SOFTWARE",
    status: "ACTIVE",
    jobType: "Full-Time",
    applyLink: "",
    autoDeleteEnabled: false,
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchDrives();
    if (isAdmin) fetchUsers();
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
      console.error("Failed to fetch users:", err);
      setUserError("Failed to load users.");
    } finally {
      setUsersLoading(false);
    }
  };

  const deleteUser = async (user) => {
    if (!window.confirm(`Delete user "${user.name}" (${user.email})? This cannot be undone.`)) return;
    setUserError(null);
    try {
      await axios.delete(`/admin/users/${user.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err) {
      console.error("DELETE /admin/users →", err.response ?? err);
      setUserError(err.response?.data?.message || "Failed to delete user.");
    }
  };

  const promoteUser = async (user) => {
    const newRole = user.role === "ROLE_EMPLOYEE" ? "ROLE_USER" : "ROLE_EMPLOYEE";
    const label   = newRole === "ROLE_EMPLOYEE" ? "promote to Employee" : "demote to User";
    if (!window.confirm(`Are you sure you want to ${label} "${user.name}"?`)) return;
    setUserError(null);
    try {
      const res = await axios.put(`/admin/users/${user.id}/role`, { role: newRole });
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role: res.data.role } : u)));
    } catch (err) {
      console.error("PUT /admin/users/role →", err.response ?? err);
      setUserError(err.response?.data?.message || "Failed to update role.");
    }
  };

  const buildPayload = (f) => ({
    ...f,
    minCgpa:  f.minCgpa  ? parseFloat(f.minCgpa) : null,
    deadline: f.deadline || null,
  });

  const formatErrors = (data) => {
    if (!data) return "Unknown error";
    if (typeof data === "string") return data;
    if (typeof data === "object") {
      const entries = Object.entries(data).filter(([k]) => k !== "timestamp" && k !== "path" && k !== "status");
      if (entries.length > 0) return entries.map(([k, v]) => `${k}: ${v}`).join(" | ");
    }
    return "Unknown error";
  };

  const handleAdd = async () => {
    setError(null);
    if (!form.companyName.trim()) { setError("Company name is required."); return; }
    if (!form.jobRole.trim())     { setError("Job role is required."); return; }
    if (!form.deadline)           { setError("Deadline is required."); return; }

    try {
      const res = await axios.post("/drives", buildPayload(form));
      setDrives((prev) => [res.data, ...prev]);
      setForm(emptyForm);
    } catch (err) {
      console.log("ERROR BODY:", JSON.stringify(err.response?.data, null, 2));
      setError(`Failed to create drive: ${formatErrors(err.response?.data)}`);
      console.error("POST /drives →", err.response ?? err);
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
    if (!form.jobRole.trim())     { setError("Job role is required."); return; }
    if (!form.deadline)           { setError("Deadline is required."); return; }

    try {
      const res = await axios.put(`/drives/${editingId}`, buildPayload(form));
      setDrives((prev) => prev.map((d) => (d.id === editingId ? res.data : d)));
      setForm(emptyForm);
      setEditingId(null);
    } catch (err) {
      console.log("ERROR BODY:", JSON.stringify(err.response?.data, null, 2));
      setError(`Failed to update drive: ${formatErrors(err.response?.data)}`);
      console.error("PUT /drives →", err.response ?? err);
    }
  };

  const deleteDrive = async (id) => {
    if (!window.confirm("Delete this drive?")) return;
    try {
      await axios.delete(`/drives/${id}`);
      setDrives((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error("DELETE /drives →", err.response ?? err);
      alert("Failed to delete drive.");
    }
  };

  const cancelEdit = () => { setEditingId(null); setForm(emptyForm); setError(null); };
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const t = dark ? dm : s;

  // Block anyone who isn't admin or employee
  if (!canAccess) {
    return (
      <div style={t.deniedPage}>
        <div style={t.deniedCard}>
          <div style={s.deniedIcon}>🔒</div>
          <h2 style={t.deniedTitle}>Access Denied</h2>
          <p style={s.deniedSub}>You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  const activeCount   = drives.filter((d) => d.autoDeleteEnabled).length;
  const expiringCount = drives.filter((d) => {
    if (!d.deadline) return false;
    const diff = (new Date(d.deadline) - new Date()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  }).length;

  const filteredUsers = users.filter((u) => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      (u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.college || "").toLowerCase().includes(q)
    );
  });

  return (
    <div style={t.page}>

      {/* TOP BAR */}
      <div style={s.topBar}>
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
          <span style={t.roleBadge}>{isAdmin ? "Admin" : "Employee"}</span>
        </div>
      </div>

      {/* TABS — Users tab only visible to admin */}
      <div style={s.tabRow}>
        <button
          style={tab === "drives" ? t.tabBtnActive : t.tabBtn}
          onClick={() => setTab("drives")}
        >
          Drives
        </button>
        {isAdmin && (
          <button
            style={tab === "users" ? t.tabBtnActive : t.tabBtn}
            onClick={() => setTab("users")}
          >
            Users {users.length > 0 ? `(${users.length})` : ""}
          </button>
        )}
      </div>

      {tab === "drives" && (
        <>
          {/* METRICS */}
          <div style={s.metricsGrid}>
            {[
              { label: "Total drives",   value: drives.length },
              { label: "Auto-delete on", value: activeCount   },
              { label: "Expiring soon",  value: expiringCount, warn: true },
              { label: "Active drives",  value: drives.filter((d) => d.status === "ACTIVE").length },
            ].map((m) => (
              <div key={m.label} style={t.metricCard}>
                <div style={s.metricLabel}>{m.label}</div>
                <div style={{
                  ...t.metricVal,
                  color: m.warn && m.value > 0 ? "#d97706" : (dark ? "#f1f5f9" : "#0f172a"),
                }}>
                  {m.value}
                </div>
              </div>
            ))}
          </div>

          {/* ERROR BANNER */}
          {error && (
            <div style={s.errorBanner}>
              <span>⚠️ {error}</span>
              <button style={s.errorClose} onClick={() => setError(null)}>✕</button>
            </div>
          )}

          {/* FORM CARD */}
          <div style={t.card}>
            <div style={s.cardHeader}>
              <h2 style={t.cardTitle}>{editingId ? "Edit drive" : "Create drive"}</h2>
              {editingId && <button onClick={cancelEdit} style={t.cancelBtn}>Cancel</button>}
            </div>

            <div style={s.formGrid}>
              {[
                { key: "companyName",      placeholder: "Company name"          },
                { key: "jobRole",          placeholder: "Job role"              },
                { key: "location",         placeholder: "Location"              },
                { key: "ctcDisplay",       placeholder: "CTC (e.g. 6 LPA)"     },
                { key: "minCgpa",          placeholder: "Min CGPA (e.g. 7.5)"  },
                { key: "eligibleBranches", placeholder: "Branches (CSE, ECE)"  },
                { key: "eligibleBatches",  placeholder: "Batches (2024, 2025)" },
                { key: "applyLink",        placeholder: "Apply link (URL)"     },
                { key: "keySkills",        placeholder: "Key skills (e.g. Java, React, SQL)" },
              ].map(({ key, placeholder }) => (
                <div key={key} style={s.formField}>
                  <label style={s.fieldLabel}>{placeholder.split(" (")[0]}</label>
                  <input
                    style={t.input}
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={set(key)}
                    onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                    onBlur={(e)  => (e.target.style.borderColor = dark ? "#334155" : "#e2e8f0")}
                  />
                </div>
              ))}

              {/* Category */}
              <div style={s.formField}>
                <label style={s.fieldLabel}>Category</label>
                <select style={t.input} value={form.category} onChange={set("category")}>
                  <option value="IT_SOFTWARE">IT / Software</option>
                  <option value="CORE_ENGINEERING">Core Engineering</option>
                  <option value="GOVERNMENT">Government</option>
                  <option value="BANKING">Banking</option>
                  <option value="MANAGEMENT">Management</option>
                  <option value="INTERNSHIP">Internship</option>
                </select>
              </div>

              {/* Status */}
              <div style={s.formField}>
                <label style={s.fieldLabel}>Status</label>
                <select style={t.input} value={form.status} onChange={set("status")}>
                  <option value="ACTIVE">Active</option>
                  <option value="UPCOMING">Upcoming</option>
                  <option value="CLOSED">Closed</option>
                  <option value="EXPIRED">Expired</option>
                </select>
              </div>

              {/* Job type */}
              <div style={s.formField}>
                <label style={s.fieldLabel}>Job type</label>
                <select style={t.input} value={form.jobType} onChange={set("jobType")}>
                  <option value="Full-Time">Full-Time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>

              {/* Experience level */}
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

              {/* Deadline */}
              <div style={s.formField}>
                <label style={s.fieldLabel}>Deadline *</label>
                <input
                  type="date"
                  style={t.input}
                  value={form.deadline}
                  onChange={set("deadline")}
                  onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                  onBlur={(e)  => (e.target.style.borderColor = dark ? "#334155" : "#e2e8f0")}
                />
              </div>
            </div>

            {/* JOB DESCRIPTION */}
            <div style={{ ...s.formField, marginTop: "12px" }}>
              <label style={s.fieldLabel}>Job description</label>
              <textarea
                style={{ ...t.input, minHeight: "110px", resize: "vertical", fontFamily: "inherit" }}
                placeholder="Describe the role, responsibilities, and what the company is looking for..."
                value={form.jobDescription}
                onChange={set("jobDescription")}
                onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                onBlur={(e)  => (e.target.style.borderColor = dark ? "#334155" : "#e2e8f0")}
              />
            </div>

            <label style={t.toggleRow}>
              <input
                type="checkbox"
                checked={form.autoDeleteEnabled}
                onChange={(e) => setForm({ ...form, autoDeleteEnabled: e.target.checked })}
              />
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

          {/* TABLE CARD */}
          <div style={t.card}>
            <div style={s.cardHeader}>
              <h2 style={t.cardTitle}>Live drives</h2>
              <span style={t.countBadge}>{drives.length} total</span>
            </div>

            {loading ? (
              <p style={{ color: "#94a3b8", fontSize: "14px" }}>Loading...</p>
            ) : drives.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: "14px" }}>No drives yet. Create one above.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      {["Company", "Role", "Location", "CTC", "Category", "Status", "Deadline", "Auto-del", "Actions"].map((h) => (
                        <th key={h} style={t.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {drives.map((d) => (
                      <tr key={d.id}>
                        <td style={{ ...t.td, fontWeight: "600", color: dark ? "#f1f5f9" : "#0f172a" }}>{d.companyName}</td>
                        <td style={t.td}>{d.jobRole}</td>
                        <td style={t.td}>{d.location || "—"}</td>
                        <td style={t.td}>{d.ctcDisplay || "—"}</td>
                        <td style={t.td}>{d.category || "—"}</td>
                        <td style={t.td}>
                          <span style={{
                            ...s.badge,
                            background: d.status === "ACTIVE"   ? "#dcfce7"
                                      : d.status === "UPCOMING" ? "#eff6ff"
                                      : d.status === "EXPIRED"  ? "#fef9c3"
                                      :                           "#fee2e2",
                            color:      d.status === "ACTIVE"   ? "#15803d"
                                      : d.status === "UPCOMING" ? "#1d4ed8"
                                      : d.status === "EXPIRED"  ? "#92400e"
                                      :                           "#b91c1c",
                          }}>
                            {d.status}
                          </span>
                        </td>
                        <td style={t.td}>{d.deadline || "—"}</td>
                        <td style={t.td}>
                          <span style={{
                            ...s.badge,
                            background: d.autoDeleteEnabled ? "#dcfce7" : "#f1f5f9",
                            color:      d.autoDeleteEnabled ? "#15803d" : "#94a3b8",
                          }}>
                            {d.autoDeleteEnabled ? "ON" : "OFF"}
                          </span>
                        </td>
                        <td style={t.td}>
                          <button style={t.editBtn} onClick={() => startEdit(d)}>Edit</button>
                          {/* Delete only visible to admin */}
                          {isAdmin && (
                            <button style={s.deleteBtn} onClick={() => deleteDrive(d.id)}>Delete</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Users tab — admin only */}
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
                onChange={(e) => setUserSearch(e.target.value)}
                onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                onBlur={(e)  => (e.target.style.borderColor = dark ? "#334155" : "#e2e8f0")}
              />
            </div>

            <div style={{ marginTop: "14px" }}>
              {usersLoading ? (
                <p style={{ color: "#94a3b8", fontSize: "14px" }}>Loading...</p>
              ) : filteredUsers.length === 0 ? (
                <p style={{ color: "#94a3b8", fontSize: "14px" }}>No users found.</p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={s.table}>
                    <thead>
                      <tr>
                        {["Name", "Email", "Role", "College", "Branch", "Batch", "Verified", "Actions"].map((h) => (
                          <th key={h} style={t.th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr key={u.id}>
                          <td style={{ ...t.td, fontWeight: "600", color: dark ? "#f1f5f9" : "#0f172a" }}>{u.name || "—"}</td>
                          <td style={t.td}>{u.email}</td>
                          <td style={t.td}>
                            <span style={{
                              ...s.badge,
                              background: u.role === "ROLE_ADMIN"     ? "#ede9fe"
                                        : u.role === "ROLE_EMPLOYEE"  ? "#fef3c7"
                                        :                               "#f1f5f9",
                              color:      u.role === "ROLE_ADMIN"     ? "#6d28d9"
                                        : u.role === "ROLE_EMPLOYEE"  ? "#92400e"
                                        :                               "#64748b",
                            }}>
                              {u.role === "ROLE_ADMIN"    ? "Admin"
                             : u.role === "ROLE_EMPLOYEE" ? "Employee"
                             :                              "User"}
                            </span>
                          </td>
                          <td style={t.td}>{u.college || "—"}</td>
                          <td style={t.td}>{u.branch || "—"}</td>
                          <td style={t.td}>{u.batchYear || "—"}</td>
                          <td style={t.td}>
                            <span style={{
                              ...s.badge,
                              background: u.emailVerified ? "#dcfce7" : "#fef9c3",
                              color:      u.emailVerified ? "#15803d" : "#92400e",
                            }}>
                              {u.emailVerified ? "Verified" : "Unverified"}
                            </span>
                          </td>
                          <td style={t.td}>
                            {/* Don't allow promoting/demoting other admins */}
                            {u.role !== "ROLE_ADMIN" && (
                              <button
                                style={u.role === "ROLE_EMPLOYEE" ? s.demoteBtn : t.promoteBtn}
                                onClick={() => promoteUser(u)}
                              >
                                {u.role === "ROLE_EMPLOYEE" ? "Demote" : "Make Employee"}
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
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminDashboard;

// ── LIGHT ────────────────────────────────────────────────────────────────────
const s = {
  page: {
    maxWidth: "1200px", margin: "0 auto",
    padding: "24px 20px",
    fontFamily: "'Inter', system-ui, sans-serif",
    background: "#f8fafc", minHeight: "100vh",
  },
  topBar: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginBottom: "20px",
  },
  topLeft: { display: "flex", alignItems: "center", gap: "12px" },
  brandIcon: {
    width: "34px", height: "34px", background: "#2563eb", borderRadius: "8px",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  pageTitle: { fontSize: "17px", fontWeight: "700", color: "#0f172a", letterSpacing: "-0.3px" },
  pageSub:   { fontSize: "12px", color: "#94a3b8", marginTop: "1px" },
  adminPill: {
    display: "flex", alignItems: "center", gap: "8px",
    background: "white",
    borderWidth: "1px", borderStyle: "solid", borderColor: "#e2e8f0",
    borderRadius: "20px", padding: "6px 14px 6px 8px",
    fontSize: "13px", fontWeight: "500", color: "#475569",
  },
  roleBadge: {
    fontSize: "10px", fontWeight: "600", padding: "2px 8px",
    borderRadius: "20px", background: "#f1f5f9", color: "#64748b",
    textTransform: "uppercase", letterSpacing: "0.4px",
  },
  avatar: {
    width: "24px", height: "24px", borderRadius: "50%",
    background: "#2563eb", color: "white",
    fontSize: "11px", fontWeight: "700",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  tabRow: { display: "flex", gap: "6px", marginBottom: "16px" },
  metricsGrid: {
    display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
    gap: "10px", marginBottom: "16px",
  },
  metricCard: {
    background: "white",
    borderWidth: "1px", borderStyle: "solid", borderColor: "#e2e8f0",
    borderRadius: "10px", padding: "14px 16px",
  },
  metricLabel: {
    fontSize: "11px", fontWeight: "600", color: "#94a3b8",
    textTransform: "uppercase", letterSpacing: "0.5px",
  },
  metricVal: { fontSize: "24px", fontWeight: "700", marginTop: "4px", color: "#0f172a" },
  card: {
    background: "white",
    borderWidth: "1px", borderStyle: "solid", borderColor: "#e2e8f0",
    borderRadius: "12px", padding: "20px", marginBottom: "16px",
  },
  cardHeader: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginBottom: "16px",
  },
  cardTitle: { fontSize: "15px", fontWeight: "600", color: "#0f172a", margin: 0 },
  cancelBtn: {
    padding: "5px 12px", background: "transparent",
    borderWidth: "1px", borderStyle: "solid", borderColor: "#e2e8f0",
    borderRadius: "6px", fontSize: "12px", color: "#64748b", cursor: "pointer",
  },
  countBadge: {
    background: "#f1f5f9", color: "#64748b",
    fontSize: "12px", fontWeight: "500",
    padding: "3px 10px", borderRadius: "20px",
  },
  errorBanner: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    background: "#fef2f2",
    borderWidth: "1px", borderStyle: "solid", borderColor: "#fecaca",
    borderRadius: "8px", padding: "10px 14px",
    fontSize: "13px", color: "#b91c1c", marginBottom: "14px",
  },
  errorClose: {
    background: "transparent", border: "none",
    color: "#b91c1c", cursor: "pointer", fontSize: "14px", padding: "0 4px",
  },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" },
  formField: { display: "flex", flexDirection: "column", gap: "5px" },
  fieldLabel: {
    fontSize: "11px", fontWeight: "600", color: "#94a3b8",
    textTransform: "uppercase", letterSpacing: "0.4px",
  },
  input: {
    padding: "9px 12px",
    borderWidth: "1px", borderStyle: "solid", borderColor: "#e2e8f0",
    borderRadius: "7px", fontSize: "13px",
    background: "#f8fafc", color: "#0f172a",
    outline: "none", width: "100%", boxSizing: "border-box",
  },
  toggleRow: {
    display: "flex", alignItems: "center", gap: "8px",
    fontSize: "13px", color: "#475569", marginTop: "14px", cursor: "pointer",
  },
  submitRow: { display: "flex", gap: "8px", marginTop: "14px" },
  primaryBtn: {
    padding: "9px 20px", background: "#2563eb", color: "white",
    borderWidth: 0, borderRadius: "7px",
    fontSize: "13px", fontWeight: "600", cursor: "pointer",
  },
  resetBtn: {
    padding: "9px 16px", background: "transparent", color: "#64748b",
    borderWidth: "1px", borderStyle: "solid", borderColor: "#e2e8f0",
    borderRadius: "7px", fontSize: "13px", cursor: "pointer",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "13px" },
  th: {
    textAlign: "left", padding: "9px 12px",
    fontSize: "11px", fontWeight: "600", color: "#94a3b8",
    textTransform: "uppercase", letterSpacing: "0.4px",
    borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#e2e8f0",
  },
  td: {
    padding: "11px 12px",
    borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#f1f5f9",
    color: "#475569", verticalAlign: "middle",
  },
  badge: {
    display: "inline-flex", padding: "3px 10px",
    borderRadius: "20px", fontSize: "11px", fontWeight: "600",
  },
  editBtn: {
    padding: "5px 12px", borderRadius: "6px",
    borderWidth: "1px", borderStyle: "solid", borderColor: "#e2e8f0",
    background: "transparent", color: "#0f172a",
    fontSize: "12px", fontWeight: "500", marginRight: "6px", cursor: "pointer",
  },
  deleteBtn: {
    padding: "5px 12px", borderRadius: "6px",
    borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(220,38,38,0.3)",
    background: "transparent", color: "#dc2626",
    fontSize: "12px", fontWeight: "500", cursor: "pointer", marginLeft: "6px",
  },
  demoteBtn: {
    padding: "5px 12px", borderRadius: "6px",
    borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(217,119,6,0.3)",
    background: "transparent", color: "#d97706",
    fontSize: "12px", fontWeight: "500", marginRight: "6px", cursor: "pointer",
  },
  promoteBtn: {
    padding: "5px 12px", borderRadius: "6px",
    borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(37,99,235,0.3)",
    background: "transparent", color: "#2563eb",
    fontSize: "12px", fontWeight: "500", marginRight: "6px", cursor: "pointer",
  },
  deniedPage: {
    display: "flex", alignItems: "center", justifyContent: "center",
    minHeight: "100vh", background: "#f8fafc",
  },
  deniedCard: {
    background: "white",
    borderWidth: "1px", borderStyle: "solid", borderColor: "#e2e8f0",
    borderRadius: "12px", padding: "48px", textAlign: "center",
  },
  deniedIcon:  { fontSize: "40px", marginBottom: "12px" },
  deniedTitle: { fontSize: "20px", fontWeight: "700", color: "#0f172a", margin: "0 0 8px" },
  deniedSub:   { fontSize: "14px", color: "#94a3b8", margin: 0 },
};

// ── DARK ─────────────────────────────────────────────────────────────────────
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
  countBadge:  { ...s.countBadge,  background: "#0f172a", borderWidth: "1px", borderStyle: "solid", borderColor: "#334155", color: "#64748b" },
  input:       { ...s.input,       background: "#0f172a", borderColor: "#334155", color: "#f1f5f9" },
  toggleRow:   { ...s.toggleRow,   color: "#94a3b8" },
  resetBtn:    { ...s.resetBtn,    borderColor: "#334155", color: "#94a3b8" },
  th:          { ...s.th,          borderBottomColor: "#334155" },
  td:          { ...s.td,          borderBottomColor: "#1e293b", color: "#94a3b8" },
  editBtn:     { ...s.editBtn,     borderColor: "#334155", color: "#f1f5f9" },
  promoteBtn:  { ...s.promoteBtn,  borderColor: "rgba(37,99,235,0.4)", color: "#60a5fa" },
  tabBtn: {
    padding: "8px 18px", background: "transparent", color: "#94a3b8",
    border: "none", borderBottom: "2px solid transparent",
    fontSize: "13px", fontWeight: "600", cursor: "pointer",
  },
  tabBtnActive: {
    padding: "8px 18px", background: "transparent", color: "#f1f5f9",
    border: "none", borderBottom: "2px solid #2563eb",
    fontSize: "13px", fontWeight: "600", cursor: "pointer",
  },
  deniedPage:  { ...s.deniedPage,  background: "#0f172a" },
  deniedCard:  { ...s.deniedCard,  background: "#1e293b", borderColor: "#334155" },
  deniedTitle: { ...s.deniedTitle, color: "#f1f5f9" },
};

s.tabBtn = {
  padding: "8px 18px", background: "transparent", color: "#94a3b8",
  border: "none", borderBottom: "2px solid transparent",
  fontSize: "13px", fontWeight: "600", cursor: "pointer",
};
s.tabBtnActive = {
  padding: "8px 18px", background: "transparent", color: "#0f172a",
  border: "none", borderBottom: "2px solid #2563eb",
  fontSize: "13px", fontWeight: "600", cursor: "pointer",
};