import { useState, useEffect, useRef, useCallback } from "react";

// ─── Design tokens (exact match to Hero) ────────────────────────────────────
const T = {
  bg:          "#0c0b2b",
  bgCard:      "rgba(255,255,255,0.04)",
  bgCardHover: "rgba(255,255,255,0.07)",
  bgInput:     "rgba(255,255,255,0.05)",
  bgPill:      "rgba(99,102,241,0.15)",
  bgWarning:   "rgba(234,179,8,0.12)",
  bgSuccess:   "rgba(52,211,153,0.12)",
  bgDanger:    "rgba(239,68,68,0.12)",
  bgInfo:      "rgba(99,102,241,0.12)",
  bgNeutral:   "rgba(255,255,255,0.06)",

  borderDefault: "rgba(255,255,255,0.08)",
  borderCard:    "rgba(255,255,255,0.10)",
  borderHover:   "rgba(255,255,255,0.18)",
  borderInput:   "rgba(255,255,255,0.14)",
  borderPill:    "rgba(99,102,241,0.40)",
  borderWarning: "rgba(234,179,8,0.35)",
  borderSuccess: "rgba(52,211,153,0.35)",
  borderDanger:  "rgba(239,68,68,0.35)",
  borderInfo:    "rgba(99,102,241,0.40)",

  primary:   "#6366f1",
  primaryHov:"#5254cc",

  text100: "rgba(255,255,255,1.00)",
  text80:  "rgba(255,255,255,0.80)",
  text55:  "rgba(255,255,255,0.55)",
  text40:  "rgba(255,255,255,0.40)",
  text28:  "rgba(255,255,255,0.28)",

  indigo:  "#818cf8",
  purple:  "#c084fc",
  pink:    "#f472b6",
  teal:    "#34d399",
  blue:    "#60a5fa",
  amber:   "#fbbf24",
  red:     "#f87171",

  radius:  "10px",
  radiusSm:"7px",
  radiusLg:"14px",
  radiusFull:"999px",
};

const STYLE = `
  @keyframes fd-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  @keyframes fd-spin   { to{transform:rotate(360deg)} }
  .fd-pulse { animation: fd-pulse 2s infinite; }
  .fd-spin  { animation: fd-spin 1s linear infinite; }

  .fd-card {
    background: ${T.bgCard};
    border: 0.5px solid ${T.borderCard};
    border-radius: ${T.radiusLg};
    transition: border-color 0.18s ease, background 0.18s ease;
  }
  .fd-card:hover { border-color: ${T.borderHover}; background: ${T.bgCardHover}; }

  .fd-input {
    background: ${T.bgInput};
    border: 0.5px solid ${T.borderInput};
    border-radius: ${T.radiusSm};
    color: ${T.text80};
    font-family: inherit;
    font-size: 12px;
    padding: 6px 9px;
    outline: none;
    transition: border-color 0.18s, background 0.18s;
    width: 100%;
  }
  .fd-input:focus {
    border-color: rgba(129,140,248,0.6);
    background: rgba(255,255,255,0.08);
  }
  .fd-input::placeholder { color: ${T.text28}; }

  .fd-filter-pill {
    font-size: 12px;
    padding: 4px 12px;
    border-radius: ${T.radiusFull};
    border: 0.5px solid ${T.borderDefault};
    background: transparent;
    color: ${T.text40};
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s ease;
  }
  .fd-filter-pill:hover { border-color: ${T.borderHover}; color: ${T.text80}; }
  .fd-filter-pill.active {
    background: ${T.bgPill};
    border-color: ${T.borderPill};
    color: ${T.indigo};
  }

  .fd-btn {
    display: inline-flex; align-items: center; gap: 6px;
    font-family: inherit; font-size: 12px; font-weight: 500;
    border-radius: ${T.radiusSm}; padding: 7px 14px;
    cursor: pointer; transition: all 0.15s ease; border: 0.5px solid;
  }
  .fd-btn-ghost {
    background: rgba(255,255,255,0.06);
    border-color: ${T.borderDefault};
    color: ${T.text55};
  }
  .fd-btn-ghost:hover { background: rgba(255,255,255,0.10); border-color: ${T.borderHover}; color: ${T.text80}; }

  .fd-btn-primary {
    background: ${T.primary};
    border-color: transparent;
    color: #fff;
  }
  .fd-btn-primary:hover { background: ${T.primaryHov}; }
  .fd-btn-primary:disabled { opacity: 0.4; cursor: default; }

  .fd-btn-success {
    background: ${T.bgSuccess};
    border-color: ${T.borderSuccess};
    color: ${T.teal};
  }
  .fd-btn-success:hover { background: rgba(52,211,153,0.2); }
  .fd-btn-success:disabled { opacity: 0.35; cursor: default; }

  .fd-btn-danger {
    background: ${T.bgDanger};
    border-color: ${T.borderDanger};
    color: ${T.red};
  }
  .fd-btn-danger:hover { background: rgba(239,68,68,0.2); }

  .fd-inline-edit {
    background: transparent;
    border: none;
    border-bottom: 0.5px solid ${T.borderInput};
    color: ${T.text80};
    font-family: inherit;
    font-size: 13px;
    outline: none;
    width: 100%;
    padding: 1px 0 3px;
    transition: border-color 0.18s;
  }
  .fd-inline-edit:focus { border-bottom-color: rgba(129,140,248,0.6); }
  .fd-inline-edit::placeholder { color: ${T.text28}; }

  .fd-checkbox {
    width: 15px; height: 15px;
    accent-color: ${T.primary};
    cursor: pointer; flex-shrink: 0;
  }

  .fd-divider {
    border: none;
    border-top: 0.5px solid ${T.borderDefault};
    margin: 0;
  }

  .fd-focus:focus-visible {
    outline: 2px solid ${T.indigo};
    outline-offset: 2px;
    border-radius: 6px;
  }
`;

// ─── Badge ───────────────────────────────────────────────────────────────────
function Badge({ variant = "neutral", children }) {
  const styles = {
    warning: { bg: T.bgWarning, border: T.borderWarning, color: T.amber },
    success: { bg: T.bgSuccess, border: T.borderSuccess, color: T.teal  },
    danger:  { bg: T.bgDanger,  border: T.borderDanger,  color: T.red   },
    info:    { bg: T.bgInfo,    border: T.borderInfo,    color: T.indigo },
    neutral: { bg: T.bgNeutral, border: T.borderDefault, color: T.text40 },
  }[variant];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      fontSize: 11, padding: "2px 8px", borderRadius: T.radiusFull,
      background: styles.bg, border: `0.5px solid ${styles.border}`,
      color: styles.color, whiteSpace: "nowrap", lineHeight: 1.6,
    }}>
      {children}
    </span>
  );
}

// ─── Metric card ─────────────────────────────────────────────────────────────
function Metric({ label, value, color }) {
  return (
    <div style={{
      background: T.bgCard, border: `0.5px solid ${T.borderCard}`,
      borderRadius: T.radiusLg, padding: "14px 18px",
    }}>
      <div style={{ fontSize: 11, color: T.text40, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.5px", color }}>
        {value}
      </div>
    </div>
  );
}

// ─── Inline editable field ───────────────────────────────────────────────────
function EditField({ label, value, onChange, placeholder, readOnly, warning, span }) {
  return (
    <div style={{ gridColumn: span ? "1 / -1" : undefined }}>
      <div style={{ fontSize: 11, color: T.text28, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>
        {label}
      </div>
      {readOnly ? (
        <div style={{ fontSize: 13, color: warning ? T.amber : T.text80, display: "flex", alignItems: "center", gap: 5 }}>
          {warning && <span style={{ fontSize: 12 }}>⚠</span>}
          {value}
        </div>
      ) : (
        <>
          <input
            className="fd-inline-edit fd-focus"
            value={value}
            placeholder={placeholder}
            onChange={e => onChange(e.target.value)}
          />
          {warning && (
            <div style={{ fontSize: 11, color: T.amber, marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}>
              <span>⚠</span> AI-guessed — verify before approving
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Drive card ──────────────────────────────────────────────────────────────
function DriveCard({ drive, onApprove, onReject, onUndo, onUpdate, onSelect }) {
  const isPending  = drive.status === "pending";
  const isApproved = drive.status === "approved";

  const logoColor = {
    TCS: T.blue, Infosys: T.indigo, Wipro: T.purple,
    Cognizant: T.teal, Capgemini: T.pink,
  }[drive.company] || T.text40;

  return (
    <div
      className="fd-card"
      style={{
        padding: "16px 18px",
        opacity: !isPending ? 0.55 : 1,
        transition: "opacity 0.3s, border-color 0.18s, background 0.18s",
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        {isPending && (
          <input
            type="checkbox"
            className="fd-checkbox"
            checked={drive.selected}
            onChange={e => onSelect(e.target.checked)}
            style={{ marginTop: 3 }}
            aria-label={`Select ${drive.company}`}
          />
        )}
        {/* Logo */}
        <div style={{
          width: 38, height: 38, borderRadius: T.radiusSm, flexShrink: 0,
          background: "rgba(255,255,255,0.06)", border: `0.5px solid ${T.borderDefault}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 700, color: logoColor, letterSpacing: "-0.5px",
        }}>
          {drive.company.slice(0, 2).toUpperCase()}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title row */}
          <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: T.text100 }}>{drive.company}</span>
            <Badge variant={drive.source === "AI_SEARCH" ? "info" : "neutral"}>
              {drive.source === "AI_SEARCH" ? "AI search" : "URL context"}
            </Badge>
            {drive.deadlineGuessed && isPending && (
              <Badge variant="warning">⚠ Deadline guessed</Badge>
            )}
            {isApproved && <Badge variant="success">✓ Approved</Badge>}
            {drive.status === "rejected" && <Badge variant="danger">✕ Rejected</Badge>}
          </div>
          {/* Sub row */}
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12, color: T.text40 }}>
            <span>{drive.role}</span>
            <span>·</span>
            <span>{drive.location}</span>
            <span>·</span>
            <span>Found {drive.foundAt}</span>
          </div>
        </div>
      </div>

      {/* Fields */}
      <hr className="fd-divider" style={{ margin: "14px 0" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14 }}>
        <EditField
          label="Deadline"
          value={drive.deadline}
          onChange={v => onUpdate("deadline", v)}
          readOnly={!isPending}
          warning={drive.deadlineGuessed}
        />
        <EditField
          label="Eligible batch"
          value={drive.batch}
          onChange={v => onUpdate("batch", v)}
          readOnly={!isPending}
        />
        <EditField
          label="Salary / CTC"
          value={drive.salary}
          onChange={v => onUpdate("salary", v)}
          readOnly={!isPending}
        />
        <div>
          <div style={{ fontSize: 11, color: T.text28, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>
            Source
          </div>
          <a
            href={drive.link}
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: 13, color: T.indigo, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}
          >
            {new URL(drive.link).hostname}
            <span style={{ fontSize: 11 }}>↗</span>
          </a>
        </div>
        <EditField
          label="Admin notes"
          value={drive.notes}
          placeholder="Add a note before approving…"
          onChange={v => onUpdate("notes", v)}
          readOnly={!isPending}
          span
        />
      </div>

      {/* Actions */}
      <hr className="fd-divider" style={{ margin: "14px 0" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <a
          href={drive.link}
          target="_blank"
          rel="noreferrer"
          style={{ fontSize: 12, color: T.text40, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}
        >
          View original ↗
        </a>
        <div style={{ flex: 1 }} />
        {isPending ? (
          <>
            <button className="fd-btn fd-btn-danger fd-focus" onClick={onReject}>✕ Reject</button>
            <button className="fd-btn fd-btn-success fd-focus" onClick={onApprove}>✓ Approve</button>
          </>
        ) : (
          <button className="fd-btn fd-btn-ghost fd-focus" onClick={onUndo}>↩ Undo</button>
        )}
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div style={{ textAlign: "center", padding: "48px 24px", color: T.text40 }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
      <div style={{ fontSize: 14, color: T.text55, marginBottom: 6 }}>No pending drives right now.</div>
      <div style={{ fontSize: 12 }}>New ones appear here automatically when the discovery job finds something.</div>
    </div>
  );
}

// ─── Run-now button with loading state ───────────────────────────────────────
function RunNowButton({ onRun }) {
  const [loading, setLoading] = useState(false);
  const handle = () => {
    if (loading) return;
    setLoading(true);
    onRun();
    setTimeout(() => setLoading(false), 2400);
  };
  return (
    <button className="fd-btn fd-btn-ghost fd-focus" onClick={handle} disabled={loading}>
      <span style={{ fontSize: 13, display: "inline-block" }} className={loading ? "fd-spin" : ""}>
        {loading ? "↻" : "↻"}
      </span>
      {loading ? "Running…" : "Run now"}
    </button>
  );
}

// ─── Countdown clock ─────────────────────────────────────────────────────────
function Countdown({ initialSeconds }) {
  const [secs, setSecs] = useState(initialSeconds);
  useEffect(() => {
    const id = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  return <span>{h}h {m}m</span>;
}

// ─── Ticker pill (matches Hero) ───────────────────────────────────────────────
function TickerPill({ messages }) {
  const [idx, setIdx]     = useState(0);
  const [vis, setVis]     = useState(true);
  useEffect(() => {
    const id = setInterval(() => {
      setVis(false);
      setTimeout(() => { setIdx(i => (i + 1) % messages.length); setVis(true); }, 300);
    }, 3200);
    return () => clearInterval(id);
  }, [messages]);
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      background: T.bgPill, border: `0.5px solid ${T.borderPill}`,
      borderRadius: T.radiusFull, padding: "5px 14px", marginBottom: 18,
    }}>
      <span className="fd-pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: T.indigo, flexShrink: 0, display: "block" }} />
      <span style={{ fontSize: 12, color: T.indigo, opacity: vis ? 1 : 0, transition: "opacity 0.3s" }}>
        {messages[idx]}
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
const INITIAL_DRIVES = [
  {
    id: 1, company: "TCS", role: "Software Engineer – Systems",
    source: "AI_SEARCH", location: "Chennai, Pune, Hyderabad", batch: "2024, 2025",
    deadline: "2025-07-15", deadlineGuessed: false, salary: "3.6 – 7 LPA",
    link: "https://nextstep.tcs.com", foundAt: "Today 8:01 AM",
    status: "pending", selected: false, notes: "",
  },
  {
    id: 2, company: "Infosys", role: "Systems Engineer",
    source: "AI_URL_CONTEXT", location: "Bengaluru, Mysuru", batch: "2025",
    deadline: "2025-07-04", deadlineGuessed: true, salary: "3.6 LPA",
    link: "https://career.infosys.com", foundAt: "Today 8:03 AM",
    status: "pending", selected: false, notes: "",
  },
  {
    id: 3, company: "Wipro", role: "Project Engineer",
    source: "AI_SEARCH", location: "Multiple", batch: "2024, 2025",
    deadline: "2025-07-20", deadlineGuessed: true, salary: "3.5 LPA",
    link: "https://careers.wipro.com", foundAt: "Today 8:04 AM",
    status: "pending", selected: false, notes: "",
  },
  {
    id: 4, company: "Cognizant", role: "Programmer Analyst Trainee",
    source: "AI_URL_CONTEXT", location: "Chennai, Hyderabad, Pune", batch: "2025",
    deadline: "2025-08-01", deadlineGuessed: false, salary: "4.0 LPA",
    link: "https://careers.cognizant.com", foundAt: "Today 8:06 AM",
    status: "pending", selected: false, notes: "",
  },
];

const TICKER_MSGS = [
  "4 drives awaiting review",
  "2 deadlines need verification",
  "Next discovery run in 5h 52m",
  "AI_URL_CONTEXT + AI_SEARCH active",
];

export default function PendingDrivesAdmin() {
  const [drives, setDrives]   = useState(INITIAL_DRIVES);
  const [filter, setFilter]   = useState("all");
  const [search, setSearch]   = useState("");
  const [lastRun, setLastRun] = useState("Today 8:00 AM");

  const update = useCallback((id, field, val) => {
    setDrives(ds => ds.map(d => d.id === id ? { ...d, [field]: val } : d));
  }, []);

  const approve    = id => setDrives(ds => ds.map(d => d.id === id ? { ...d, status: "approved", selected: false } : d));
  const reject     = id => setDrives(ds => ds.map(d => d.id === id ? { ...d, status: "rejected", selected: false } : d));
  const undo       = id => setDrives(ds => ds.map(d => d.id === id ? { ...d, status: "pending" } : d));
  const select     = (id, v) => setDrives(ds => ds.map(d => d.id === id ? { ...d, selected: v } : d));
  const approveAll = () => setDrives(ds => ds.map(d => d.status === "pending" ? { ...d, status: "approved", selected: false } : d));
  const bulkApprove = () => setDrives(ds => ds.map(d => d.selected && d.status === "pending" ? { ...d, status: "approved", selected: false } : d));
  const bulkReject  = () => setDrives(ds => ds.map(d => d.selected && d.status === "pending" ? { ...d, status: "rejected", selected: false } : d));

  const pending  = drives.filter(d => d.status === "pending").length;
  const approved = drives.filter(d => d.status === "approved").length;
  const rejected = drives.filter(d => d.status === "rejected").length;
  const guessed  = drives.filter(d => d.deadlineGuessed && d.status === "pending").length;
  const selected = drives.filter(d => d.selected && d.status === "pending");

  const visible = drives.filter(d => {
    if (filter === "AI_SEARCH"      && d.source !== "AI_SEARCH")      return false;
    if (filter === "AI_URL_CONTEXT" && d.source !== "AI_URL_CONTEXT") return false;
    if (filter === "guessed"        && !d.deadlineGuessed)            return false;
    if (search) {
      const q = search.toLowerCase();
      if (!d.company.toLowerCase().includes(q) && !d.role.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const FILTERS = [
    { key: "all",             label: "All" },
    { key: "AI_SEARCH",      label: "AI search" },
    { key: "AI_URL_CONTEXT", label: "URL context" },
    { key: "guessed",        label: "Guessed deadline" },
  ];

  return (
    <section style={{
      background: T.bg, borderRadius: 20, padding: "40px 40px 48px",
      fontFamily: "system-ui, -apple-system, sans-serif", minHeight: 520,
    }}>
      <style>{STYLE}</style>

      {/* Ticker */}
      <TickerPill messages={TICKER_MSGS} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, marginBottom: 28, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.8px", color: T.text100, marginBottom: 8 }}>
            Pending AI-discovered drives
          </h1>
          <p style={{ fontSize: 13, color: T.text55, lineHeight: 1.65, maxWidth: 480 }}>
            Found automatically by the discovery scheduler — not visible on the public site until approved.
            Double-check deadlines marked "guessed" before approving.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, fontSize: 12, color: T.text40 }}>
            <span className="fd-pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: T.teal, display: "inline-block", flexShrink: 0 }} />
            Next run in <Countdown initialSeconds={5 * 3600 + 52 * 60} />
            &nbsp;·&nbsp; Last run: {lastRun}
            &nbsp;·&nbsp; Cron: every 6 hours
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <RunNowButton onRun={() => setLastRun("Just now")} />
          <button className="fd-btn fd-btn-primary fd-focus" onClick={approveAll} disabled={pending === 0}>
            ✓ Approve all
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 10, marginBottom: 24 }}>
        <Metric label="Awaiting review"   value={pending}  color={T.amber}  />
        <Metric label="Approved today"    value={approved} color={T.teal}   />
        <Metric label="Rejected"          value={rejected} color={T.red}    />
        <Metric label="Guessed deadlines" value={guessed}  color={T.amber}  />
      </div>

      {/* Filters + search */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, color: T.text28, textTransform: "uppercase", letterSpacing: "0.5px" }}>Filter</span>
        {FILTERS.map(f => (
          <button
            key={f.key}
            className={`fd-filter-pill fd-focus${filter === f.key ? " active" : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
        <div style={{ marginLeft: "auto", position: "relative" }}>
          <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: T.text28 }}>🔍</span>
          <input
            className="fd-input fd-focus"
            style={{ paddingLeft: 28, width: 200, height: 30 }}
            placeholder="Search company, role…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.length > 0 && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: T.bgCard, border: `0.5px solid ${T.borderCard}`,
          borderRadius: T.radiusSm, padding: "10px 14px", marginBottom: 14,
          fontSize: 13, color: T.text55,
        }}>
          <span>{selected.length} selected</span>
          <div style={{ flex: 1 }} />
          <button className="fd-btn fd-btn-success fd-focus" onClick={bulkApprove}>✓ Approve selected</button>
          <button className="fd-btn fd-btn-danger  fd-focus" onClick={bulkReject}>✕ Reject selected</button>
        </div>
      )}

      {/* Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {visible.length === 0 ? (
          <div className="fd-card" style={{ padding: 0 }}>
            <EmptyState />
          </div>
        ) : (
          visible.map(d => (
            <DriveCard
              key={d.id}
              drive={d}
              onApprove={() => approve(d.id)}
              onReject={()  => reject(d.id)}
              onUndo={()    => undo(d.id)}
              onUpdate={(field, val) => update(d.id, field, val)}
              onSelect={v   => select(d.id, v)}
            />
          ))
        )}
      </div>

      {/* Trust strip — same as Hero */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 32, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, color: T.text28, textTransform: "uppercase", letterSpacing: "0.6px" }}>
          Tracking drives from
        </span>
        {["TCS", "Infosys", "Wipro", "Cognizant", "Capgemini", "HCLTech", "Accenture"].map(name => (
          <span key={name} style={{
            fontSize: 12, fontWeight: 600, color: T.text28, letterSpacing: "-0.2px",
            border: `0.5px solid ${T.borderDefault}`, borderRadius: 6, padding: "4px 10px",
            transition: "color 0.18s, border-color 0.18s",
          }}>
            {name}
          </span>
        ))}
      </div>
    </section>
  );
}