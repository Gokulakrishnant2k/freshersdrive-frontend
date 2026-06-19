import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import axios from "../api/axiosInstance";

function AddDrive() {
  const { dark } = useTheme();
  const [form, setForm] = useState({
    companyName: "",
    jobRole: "",
    location: "",
    ctcDisplay: "",
    minCgpa: "",
    deadline: "",
    category: "IT_SOFTWARE",
    status: "ACTIVE",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/drives", form);
      alert("Drive Added Successfully");
      setForm({
        companyName: "",
        jobRole: "",
        location: "",
        ctcDisplay: "",
        minCgpa: "",
        deadline: "",
        category: "IT_SOFTWARE",
        status: "ACTIVE",
      });
    } catch (error) {
      console.error(error);
      alert("Failed to add drive");
    }
  };

  const t = dark ? dm : s;

  return (
    <div style={t.page}>
      <div style={t.card}>

        <h2 style={t.heading}>Add New Drive</h2>

        <form onSubmit={handleSubmit}>

          <div style={s.grid}>

            <div style={s.field}>
              <label style={t.label}>Company Name</label>
              <input
                style={t.input}
                name="companyName"
                placeholder="e.g. Google"
                value={form.companyName}
                onChange={handleChange}
                required
              />
            </div>

            <div style={s.field}>
              <label style={t.label}>Job Role</label>
              <input
                style={t.input}
                name="jobRole"
                placeholder="e.g. Software Engineer"
                value={form.jobRole}
                onChange={handleChange}
                required
              />
            </div>

            <div style={s.field}>
              <label style={t.label}>Location</label>
              <input
                style={t.input}
                name="location"
                placeholder="e.g. Chennai"
                value={form.location}
                onChange={handleChange}
              />
            </div>

            <div style={s.field}>
              <label style={t.label}>CTC</label>
              <input
                style={t.input}
                name="ctcDisplay"
                placeholder="e.g. 6 LPA"
                value={form.ctcDisplay}
                onChange={handleChange}
              />
            </div>

            <div style={s.field}>
              <label style={t.label}>Minimum CGPA</label>
              <input
                style={t.input}
                name="minCgpa"
                placeholder="e.g. 7.5"
                value={form.minCgpa}
                onChange={handleChange}
              />
            </div>

            <div style={s.field}>
              <label style={t.label}>Deadline</label>
              <input
                style={t.input}
                type="date"
                name="deadline"
                value={form.deadline}
                onChange={handleChange}
              />
            </div>

            <div style={s.field}>
              <label style={t.label}>Category</label>
              <select
                style={t.input}
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                <option value="IT_SOFTWARE">IT Software</option>
                <option value="CORE_HARDWARE">Core Hardware</option>
                <option value="OTHERS">Others</option>
              </select>
            </div>

            <div style={s.field}>
              <label style={t.label}>Status</label>
              <select
                style={t.input}
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

          </div>

          <button type="submit" style={s.btn}>
            Add Drive
          </button>

        </form>
      </div>
    </div>
  );
}

export default AddDrive;

// ── LIGHT ────────────────────────────────────────────────────────────────────
const s = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    fontFamily: "'Inter', system-ui, sans-serif",
    padding: "32px 20px",
  },
  card: {
    background: "white",
    borderRadius: "16px",
    border: "1px solid #f1f5f9",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    padding: "32px",
    maxWidth: "760px",
    margin: "0 auto",
  },
  heading: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: "24px",
    marginTop: 0,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginBottom: "24px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.4px",
  },
  input: {
    padding: "9px 12px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    color: "#0f172a",
    background: "#f8fafc",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  btn: {
    padding: "10px 28px",
    background: "#1d4ed8",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    width: "100%",
  },
};

// ── DARK ─────────────────────────────────────────────────────────────────────
const dm = {
  ...s,
  page:    { ...s.page,    background: "#0f172a" },
  card:    { ...s.card,    background: "#1e293b", border: "1px solid #334155", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" },
  heading: { ...s.heading, color: "#f1f5f9" },
  label:   { ...s.label,   color: "#64748b" },
  input:   { ...s.input,   background: "#0f172a", border: "1px solid #334155", color: "#f1f5f9" },
};