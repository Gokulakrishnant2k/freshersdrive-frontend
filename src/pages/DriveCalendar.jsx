import { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext"; // ← pulls dark from context
import axios from "../api/axiosInstance";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const PAGE_SIZE = 4;

// ── Mock data (only fields that real API returns) ────────────────────────────
function getMockDrives(year, month) {
  const y = year, m = String(month).padStart(2,"0");
  return [
    { id:1, companyName:"TCS",       jobRole:"Software Engineer",  driveDate:`${y}-${m}-05`, deadline:`${y}-${m}-03`, location:"Chennai",   ctcDisplay:"3.5 LPA", minCgpa:6.0, eligibleBranches:"CSE,IT,ECE",  status:"UPCOMING" },
    { id:2, companyName:"Infosys",   jobRole:"Systems Engineer",   driveDate:`${y}-${m}-10`, deadline:`${y}-${m}-08`, location:"Bangalore", ctcDisplay:"3.6 LPA", minCgpa:6.5, eligibleBranches:"CSE,IT",      status:"UPCOMING" },
    { id:3, companyName:"Wipro",     jobRole:"Project Engineer",   driveDate:`${y}-${m}-14`, deadline:`${y}-${m}-12`, location:"Hyderabad", ctcDisplay:"3.5 LPA", minCgpa:6.0, eligibleBranches:"All Branches", status:"UPCOMING" },
    { id:4, companyName:"Cognizant", jobRole:"Programmer Analyst", driveDate:`${y}-${m}-18`, deadline:`${y}-${m}-16`, location:"Chennai",   ctcDisplay:"4.0 LPA", minCgpa:7.0, eligibleBranches:"CSE,IT",      status:"UPCOMING" },
    { id:5, companyName:"HCL",       jobRole:"Graduate Trainee",   driveDate:`${y}-${m}-22`, deadline:`${y}-${m}-20`, location:"Noida",     ctcDisplay:"3.8 LPA", minCgpa:6.0, eligibleBranches:"CSE,ECE,EEE", status:"UPCOMING" },
    { id:6, companyName:"Capgemini", jobRole:"Analyst",            driveDate:`${y}-${m}-25`, deadline:`${y}-${m}-23`, location:"Pune",      ctcDisplay:"4.2 LPA", minCgpa:7.0, eligibleBranches:"CSE,IT",      status:"ONGOING"  },
  ];
}

// ── Date helpers ─────────────────────────────────────────────────────────────
function parseDate(raw) {
  if (!raw) return null;
  if (Array.isArray(raw)) {
    const [y, m, d] = raw;
    return new Date(y, m - 1, d);
  }
  if (typeof raw === "string") {
    const clean = raw.split("T")[0];
    const [y, m, d] = clean.split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  }
  return null;
}

function toDateKey(raw) {
  const dt = parseDate(raw);
  if (!dt || isNaN(dt)) return null;
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`;
}

function formatDate(raw) {
  const dt = parseDate(raw);
  if (!dt || isNaN(dt)) return "Date TBD";
  return dt.toLocaleDateString("en-IN", { weekday:"short", year:"numeric", month:"short", day:"numeric" });
}

function getCalendarDate(drive) {
  return drive.driveDate || drive.deadline || null;
}

// ── Status colours ────────────────────────────────────────────────────────────
const STATUS_COLOR = {
  UPCOMING:  { bg:"#eff6ff", color:"#1d4ed8", border:"#bfdbfe" },
  ONGOING:   { bg:"#f0fdf4", color:"#15803d", border:"#bbf7d0" },
  COMPLETED: { bg:"#f8fafc", color:"#64748b", border:"#e2e8f0" },
  CANCELLED: { bg:"#fef2f2", color:"#b91c1c", border:"#fecaca" },
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function DriveCalendar() {
  // ✅ Pull dark from ThemeContext — no prop needed
  const { dark } = useTheme();

  const today = new Date();
  const [currentYear,   setCurrentYear]   = useState(today.getFullYear());
  const [currentMonth,  setCurrentMonth]  = useState(today.getMonth() + 1);
  const [drives,        setDrives]        = useState([]);
  const [upcoming,      setUpcoming]      = useState([]);
  const [loadingCal,    setLoadingCal]    = useState(true);
  const [loadingUp,     setLoadingUp]     = useState(true);
  const [search,        setSearch]        = useState("");
  const [selected,      setSelected]      = useState(null);
  const [notifyOn,      setNotifyOn]      = useState(true);
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [notifyMsg,     setNotifyMsg]     = useState(null);
  const [listPage,      setListPage]      = useState(1);   // ← paginated list
  const searchRef = useRef(null);
  const listRef   = useRef(null);

  useEffect(() => { loadCalendar(); }, [currentYear, currentMonth]);
  useEffect(() => { loadUpcoming(); fetchNotifyPref(); }, []);
  // Reset list page when month changes
  useEffect(() => { setListPage(1); }, [currentYear, currentMonth, search]);

  async function loadCalendar() {
    setLoadingCal(true);
    try {
      const res = await axios.get("/drives/calendar", { params: { year: currentYear, month: currentMonth } });
      setDrives(res.data);
    } catch {
      setDrives(getMockDrives(currentYear, currentMonth));
    } finally {
      setLoadingCal(false);
    }
  }

  async function loadUpcoming() {
    setLoadingUp(true);
    try {
      const res = await axios.get("/drives/upcoming");
      setUpcoming(res.data.slice(0, 8));
    } catch {
      setUpcoming(
        getMockDrives(today.getFullYear(), today.getMonth()+1)
          .sort((a,b) => (toDateKey(getCalendarDate(a))||"").localeCompare(toDateKey(getCalendarDate(b))||""))
          .slice(0, 8)
      );
    } finally {
      setLoadingUp(false);
    }
  }

  async function fetchNotifyPref() {
    try {
      const res = await axios.get("/drives/notify-preference");
      setNotifyOn(res.data.enabled ?? true);
    } catch { /* default stays true */ }
  }

  async function toggleNotify() {
    const next = !notifyOn;
    setNotifyOn(next);
    setNotifyLoading(true);
    setNotifyMsg(null);
    try {
      await axios.post("/drives/notify-preference", { enabled: next });
      setNotifyMsg({ type:"success", text: next ? "🔔 Drive alerts enabled." : "🔕 Drive alerts turned off." });
    } catch {
      setNotifyOn(!next);
      setNotifyMsg({ type:"error", text:"Could not update preference. Try again." });
    } finally {
      setNotifyLoading(false);
      setTimeout(() => setNotifyMsg(null), 3000);
    }
  }

  function changeMonth(delta) {
    let m = currentMonth + delta, y = currentYear;
    if (m > 12) { m = 1;  y++; }
    if (m < 1)  { m = 12; y--; }
    setCurrentMonth(m); setCurrentYear(y);
  }

  function handleSearch(val) {
    setSearch(val);
    clearTimeout(searchRef.current);
    if (!val.trim()) { loadCalendar(); return; }
    searchRef.current = setTimeout(async () => {
      try {
        const res = await axios.get("/drives/search", { params: { q: val } });
        setDrives(res.data);
      } catch {
        setDrives(getMockDrives(currentYear, currentMonth).filter(d =>
          d.companyName.toLowerCase().includes(val.toLowerCase()) ||
          d.jobRole.toLowerCase().includes(val.toLowerCase())
        ));
      }
    }, 300);
  }

  // ── Calendar grid calculations ────────────────────────────────────────────
  const firstDay    = new Date(currentYear, currentMonth - 1, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

  const driveMap = {};
  drives.forEach(d => {
    const key = toDateKey(getCalendarDate(d));
    if (!key) return;
    if (!driveMap[key]) driveMap[key] = [];
    driveMap[key].push(d);
  });

  // ── Paginated list (bottom section) ───────────────────────────────────────
  // Sort drives by driveDate ascending so earliest appears first
  const sortedDrives = [...drives].sort((a, b) => {
    const ka = toDateKey(getCalendarDate(a)) || "";
    const kb = toDateKey(getCalendarDate(b)) || "";
    return ka.localeCompare(kb);
  });
  const totalListPages = Math.max(1, Math.ceil(sortedDrives.length / PAGE_SIZE));
  const pagedDrives    = sortedDrives.slice((listPage - 1) * PAGE_SIZE, listPage * PAGE_SIZE);

  function goListPage(n) {
    setListPage(n);
    // Smooth scroll to list section
    setTimeout(() => listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  const t = dark ? dm : ltt;

  return (
    <div style={t.page}>

      {/* ── TOP BAR ── */}
      <div style={t.topbar}>
        <div style={sh.monthNav}>
          <button style={t.navBtn} onClick={() => changeMonth(-1)}>‹</button>
          <span style={t.monthLabel}>{MONTHS[currentMonth-1]} {currentYear}</span>
          <button style={t.navBtn} onClick={() => changeMonth(1)}>›</button>
        </div>

        <div style={sh.searchWrap}>
          <svg style={sh.searchIcon} width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            style={t.searchInput}
            placeholder="Search company or role…"
            value={search}
            onChange={e => handleSearch(e.target.value)}
          />
        </div>

        <div style={t.toggleWrap} title={notifyOn ? "Turn off alerts" : "Turn on alerts"}>
          <span style={t.toggleLabel}>{notifyOn ? "🔔" : "🔕"} Alerts</span>
          <button
            style={{ ...sh.toggleBtn, background: notifyOn ? "#1d4ed8" : (dark ? "#334155" : "#e2e8f0") }}
            onClick={toggleNotify}
            disabled={notifyLoading}
            aria-label="Toggle drive email notifications"
          >
            <span style={{ ...sh.toggleThumb, left: notifyOn ? "20px" : "3px" }} />
          </button>
        </div>
      </div>

      {/* Toast */}
      {notifyMsg && (
        <div style={{
          ...sh.toast,
          background: notifyMsg.type === "success" ? (dark ? "#14532d" : "#f0fdf4") : (dark ? "#450a0a" : "#fef2f2"),
          color:      notifyMsg.type === "success" ? (dark ? "#86efac" : "#15803d") : (dark ? "#fca5a5" : "#b91c1c"),
          border: `1px solid ${notifyMsg.type === "success" ? (dark ? "#166534" : "#bbf7d0") : (dark ? "#7f1d1d" : "#fecaca")}`,
        }}>
          {notifyMsg.text}
        </div>
      )}

      {/* ── MAIN LAYOUT ── */}
      <div style={sh.layout}>

        {/* ── CALENDAR ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={t.calCard}>
            {/* Day-name header row */}
            <div style={sh.calHeader}>
              {DAYS.map(d => <div key={d} style={sh.dayHeader}>{d}</div>)}
            </div>

            {/* Grid */}
            <div style={sh.calGrid}>
              {loadingCal ? (
                <div style={{ ...sh.state, gridColumn:"1/-1" }}>Loading calendar…</div>
              ) : (
                <>
                  {Array.from({ length: firstDay }, (_,i) => (
                    <div key={`e${i}`} style={t.emptyCell} />
                  ))}

                  {Array.from({ length: daysInMonth }, (_,i) => {
                    const day = i + 1;
                    const key = `${currentYear}-${String(currentMonth).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                    const isToday =
                      today.getFullYear() === currentYear &&
                      today.getMonth()+1  === currentMonth &&
                      today.getDate()     === day;
                    const dayDrives = driveMap[key] || [];
                    const MAX_CHIPS = 2;
                    const visible   = dayDrives.slice(0, MAX_CHIPS);
                    const overflow  = dayDrives.length - MAX_CHIPS;

                    return (
                      <div key={day} style={{ ...t.cell, ...(isToday ? t.todayCell : {}) }}>
                        <div style={isToday ? t.todayNum : t.dayNum}>{day}</div>

                        {visible.map(d => {
                          const sc = STATUS_COLOR[d.status] || STATUS_COLOR.UPCOMING;
                          return (
                            <div
                              key={d.id}
                              onClick={() => setSelected(d)}
                              style={{
                                ...sh.chip,
                                background:     sc.bg,
                                color:          sc.color,
                                borderLeft:     `3px solid ${sc.border}`,
                                textDecoration: d.status === "CANCELLED" ? "line-through" : "none",
                              }}
                              title={`${d.companyName} – ${d.jobRole}`}
                            >
                              {d.companyName}
                            </div>
                          );
                        })}

                        {overflow > 0 && (
                          <div
                            style={t.overflowChip}
                            onClick={() => {
                              // Jump to the list page that contains the first overflow drive
                              const idx = sortedDrives.findIndex(x => x.id === dayDrives[MAX_CHIPS].id);
                              if (idx >= 0) goListPage(Math.floor(idx / PAGE_SIZE) + 1);
                            }}
                          >
                            +{overflow} more
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>

          {/* ── DRIVE LIST (bottom of calendar) ── */}
          <div ref={listRef} style={{ marginTop: "24px" }}>
            {/* Section header */}
            <div style={sh.listHeader}>
              <div>
                <div style={t.listTitle}>
                  Drives in {MONTHS[currentMonth-1]} {currentYear}
                </div>
                <div style={t.listSub}>
                  {sortedDrives.length} drive{sortedDrives.length !== 1 ? "s" : ""} this month
                </div>
              </div>
              {totalListPages > 1 && (
                <span style={t.pageBadge}>
                  Page {listPage} of {totalListPages}
                </span>
              )}
            </div>

            {loadingCal ? (
              <div style={sh.state}>Loading drives…</div>
            ) : sortedDrives.length === 0 ? (
              <div style={sh.emptyList}>
                <div style={sh.emptyIcon}>📭</div>
                <div>No drives found for this month.</div>
              </div>
            ) : (
              <>
                <div style={sh.driveList}>
                  {pagedDrives.map(d => {
                    const sc = STATUS_COLOR[d.status] || STATUS_COLOR.UPCOMING;
                    return (
                      <div
                        key={d.id}
                        style={t.driveRow}
                        onClick={() => setSelected(d)}
                      >
                        {/* Left: avatar + info */}
                        <div style={sh.rowLeft}>
                          <div style={{ ...sh.rowDot, background: sc.bg, color: sc.color }}>
                            {d.companyName?.charAt(0)?.toUpperCase()}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={t.rowCompany}>{d.companyName}</div>
                            <div style={t.rowRole}>{d.jobRole}</div>
                            <div style={sh.rowMeta}>
                              {d.location && <span>📍 {d.location}</span>}
                              {d.ctcDisplay && <span>💰 {d.ctcDisplay}</span>}
                              {d.minCgpa    && <span>🎓 CGPA {d.minCgpa}+</span>}
                            </div>
                          </div>
                        </div>

                        {/* Right: dates + status */}
                        <div style={sh.rowRight}>
                          <div style={t.rowDate}>
                            🏢 {d.driveDate ? formatDate(d.driveDate) : formatDate(d.deadline)}
                          </div>
                          {d.deadline && d.driveDate &&
                           toDateKey(d.driveDate) !== toDateKey(d.deadline) && (
                            <div style={sh.rowDeadline}>
                              ⏰ Apply by {formatDate(d.deadline)}
                            </div>
                          )}
                          <span style={{
                            ...sh.statusBadge,
                            background: sc.bg,
                            color:      sc.color,
                            border:     `1px solid ${sc.border}`,
                          }}>
                            {d.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalListPages > 1 && (
                  <div style={sh.pagination}>
                    <button
                      style={{ ...t.pageBtn, ...(listPage === 1 ? sh.pageBtnOff : {}) }}
                      onClick={() => goListPage(Math.max(1, listPage - 1))}
                      disabled={listPage === 1}
                    >
                      ← Prev
                    </button>

                    {Array.from({ length: totalListPages }, (_, i) => i + 1).map(n => (
                      <button
                        key={n}
                        style={{ ...t.pageBtn, ...(n === listPage ? sh.pageBtnActive : {}) }}
                        onClick={() => goListPage(n)}
                      >
                        {n}
                      </button>
                    ))}

                    <button
                      style={{ ...t.pageBtn, ...(listPage === totalListPages ? sh.pageBtnOff : {}) }}
                      onClick={() => goListPage(Math.min(totalListPages, listPage + 1))}
                      disabled={listPage === totalListPages}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── SIDEBAR ── */}
        <aside style={sh.sidebar}>
          {/* Upcoming drives */}
          <div style={t.sideCard}>
            <div style={sh.sideHeader}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="#1d4ed8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span style={t.sideTitle}>Upcoming Drives</span>
            </div>

            {loadingUp ? (
              <div style={sh.state}>Loading…</div>
            ) : upcoming.length === 0 ? (
              <p style={sh.empty}>No upcoming drives.</p>
            ) : (
              upcoming.map(d => (
                <div key={d.id} style={t.upCard} onClick={() => setSelected(d)}>
                  <div style={sh.upDot}>{d.companyName?.charAt(0)?.toUpperCase()}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={t.upCompany}>{d.companyName}</div>
                    <div style={sh.upRole}>{d.jobRole}</div>
                    <div style={sh.upDate}>
                      🏢 {d.driveDate ? formatDate(d.driveDate) : formatDate(d.deadline)}
                    </div>
                    {d.deadline && d.driveDate && toDateKey(d.driveDate) !== toDateKey(d.deadline) && (
                      <div style={sh.upMeta}>⏰ Apply by {formatDate(d.deadline)}</div>
                    )}
                    {d.ctcDisplay && (
                      <div style={sh.upMeta}>💰 {d.ctcDisplay}</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Legend */}
          <div style={t.sideCard}>
            <span style={t.sideTitle}>Legend</span>
            <div style={{ marginTop:"10px", display:"flex", flexDirection:"column", gap:"6px" }}>
              {Object.entries(STATUS_COLOR).map(([k,v]) => (
                <div key={k} style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                  <div style={{ width:"10px", height:"10px", borderRadius:"3px", background:v.bg, border:`2px solid ${v.border}` }} />
                  <span style={{ fontSize:"12px", color: dark ? "#94a3b8" : "#64748b", textTransform:"capitalize" }}>
                    {k.charAt(0) + k.slice(1).toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* ── MODAL ── */}
      {selected && (
        <div style={sh.overlay} onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div style={t.modal}>
            <button style={sh.closeBtn} onClick={() => setSelected(null)}>✕</button>

            <div style={sh.modalHeader}>
              <div style={sh.modalDot}>{selected.companyName?.charAt(0)?.toUpperCase()}</div>
              <div>
                <h3 style={t.modalCompany}>{selected.companyName}</h3>
                <div style={sh.modalRole}>
                  {selected.jobRole}
                  <span style={{
                    ...sh.badge,
                    background: STATUS_COLOR[selected.status]?.bg   || "#f1f5f9",
                    color:      STATUS_COLOR[selected.status]?.color || "#64748b",
                    border:     `1px solid ${STATUS_COLOR[selected.status]?.border || "#e2e8f0"}`,
                  }}>
                    {selected.status}
                  </span>
                </div>
              </div>
            </div>

            <div style={sh.infoGrid}>
              {[
                ["🏢 Drive Date",
                  selected.driveDate ? formatDate(selected.driveDate) : formatDate(selected.deadline)
                ],
                ...(selected.driveDate && toDateKey(selected.driveDate) !== toDateKey(selected.deadline)
                  ? [["⏰ Apply Deadline", formatDate(selected.deadline)]]
                  : []
                ),
                ["📍 Location",         selected.location        || "TBD"],
                ["💰 Package",          selected.ctcDisplay      || null],
                ["🎓 Min CGPA",         selected.minCgpa         || null],
                ["🔖 Eligible Branches",selected.eligibleBranches|| "All Branches"],
              ].filter(([,v]) => v != null).map(([label, value]) => (
                <div key={label} style={t.infoItem}>
                  <div style={sh.infoLabel}>{label}</div>
                  <div style={t.infoValue}>{value}</div>
                </div>
              ))}
            </div>

            {selected.description && (
              <div style={t.descBox}>{selected.description}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── SHARED (theme-independent) styles ────────────────────────────────────────
const font = "'Inter','SF Pro Display',system-ui,-apple-system,sans-serif";

const sh = {
  monthNav:   { display:"flex", alignItems:"center", gap:"10px" },
  searchWrap: { flex:1, position:"relative" },
  searchIcon: { position:"absolute", left:"11px", top:"50%", transform:"translateY(-50%)", color:"#94a3b8", pointerEvents:"none" },
  toggleBtn:  { position:"relative", width:"38px", height:"20px", borderRadius:"10px", border:"none", cursor:"pointer", padding:0, transition:"background .2s", flexShrink:0 },
  toggleThumb:{ position:"absolute", top:"3px", width:"14px", height:"14px", background:"white", borderRadius:"50%", transition:"left .2s", boxShadow:"0 1px 3px rgba(0,0,0,.2)" },
  toast:      { margin:"12px 24px 0", padding:"8px 16px", borderRadius:"8px", fontSize:"13px", fontWeight:"600", display:"inline-block" },
  layout:     { display:"flex", gap:"18px", padding:"20px 24px", maxWidth:"1400px", margin:"0 auto", alignItems:"flex-start" },
  sidebar:    { width:"280px", flexShrink:0, display:"flex", flexDirection:"column", gap:"14px", position:"sticky", top:"62px" },
  sideHeader: { display:"flex", alignItems:"center", gap:"8px", marginBottom:"14px" },
  calHeader:  { display:"grid", gridTemplateColumns:"repeat(7,1fr)", background:"#1d4ed8" },
  dayHeader:  { textAlign:"center", padding:"12px 0", fontSize:"12px", fontWeight:"600", color:"white", letterSpacing:"0.5px" },
  calGrid:    { display:"grid", gridTemplateColumns:"repeat(7,1fr)" },
  chip:       { fontSize:"11px", borderRadius:"4px", padding:"2px 6px", marginBottom:"3px", cursor:"pointer", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", fontWeight:"500" },
  upDot:      { width:"32px", height:"32px", borderRadius:"8px", background:"#eff6ff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px", fontWeight:"700", color:"#1d4ed8", flexShrink:0 },
  upRole:     { fontSize:"11.5px", color:"#64748b", marginTop:"2px" },
  upDate:     { fontSize:"11px",   color:"#94a3b8", marginTop:"3px" },
  upMeta:     { fontSize:"11px",   color:"#64748b", marginTop:"2px" },
  overlay:    { position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100 },
  closeBtn:   { position:"absolute", top:"16px", right:"18px", background:"none", border:"none", fontSize:"20px", cursor:"pointer", color:"#94a3b8", lineHeight:1 },
  modalHeader:{ display:"flex", gap:"14px", alignItems:"flex-start", marginBottom:"20px" },
  modalDot:   { width:"44px", height:"44px", borderRadius:"12px", background:"#eff6ff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px", fontWeight:"700", color:"#1d4ed8", flexShrink:0 },
  modalRole:  { display:"flex", alignItems:"center", gap:"8px", fontSize:"13.5px", color:"#64748b", marginTop:"4px", flexWrap:"wrap" },
  badge:      { display:"inline-block", padding:"2px 10px", borderRadius:"99px", fontSize:"11px", fontWeight:"600" },
  infoGrid:   { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"16px" },
  infoLabel:  { fontSize:"11px", fontWeight:"700", color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:"3px" },
  state:      { padding:"40px", textAlign:"center", color:"#94a3b8", fontSize:"13.5px" },
  empty:      { fontSize:"12px", color:"#94a3b8", marginTop:"4px", lineHeight:"1.5" },

  // ── List section ──
  listHeader: { display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"14px" },
  driveList:  { display:"flex", flexDirection:"column", gap:"10px" },
  rowLeft:    { display:"flex", gap:"12px", alignItems:"flex-start", flex:1, minWidth:0 },
  rowDot:     { width:"38px", height:"38px", borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"15px", fontWeight:"700", flexShrink:0 },
  rowMeta:    { display:"flex", flexWrap:"wrap", gap:"10px", fontSize:"11.5px", color:"#94a3b8", marginTop:"4px" },
  rowRight:   { display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"4px", flexShrink:0, paddingLeft:"12px" },
  rowDeadline:{ fontSize:"11px", color:"#f59e0b" },
  statusBadge:{ fontSize:"10.5px", fontWeight:"600", padding:"2px 9px", borderRadius:"99px" },
  emptyList:  { textAlign:"center", padding:"40px 20px", color:"#94a3b8", fontSize:"14px" },
  emptyIcon:  { fontSize:"32px", marginBottom:"10px" },
  pagination: { display:"flex", alignItems:"center", justifyContent:"center", gap:"6px", marginTop:"20px", paddingBottom:"8px", flexWrap:"wrap" },
  pageBtnActive:{ background:"#1d4ed8", borderColor:"#1d4ed8", color:"white", fontWeight:"600" },
  pageBtnOff:   { opacity:0.35, cursor:"not-allowed" },
};

// ── LIGHT THEME ───────────────────────────────────────────────────────────────
const ltt = {
  page:       { minHeight:"100vh", background:"#f8fafc", fontFamily:font },
  topbar:     { position:"sticky", top:0, zIndex:50, background:"white", borderBottom:"1px solid #f1f5f9", padding:"11px 24px", display:"flex", alignItems:"center", gap:"14px", boxShadow:"0 1px 3px rgba(0,0,0,0.05)" },
  monthLabel: { fontSize:"15px", fontWeight:"700", letterSpacing:"-0.4px", color:"#0f172a", minWidth:"160px", textAlign:"center" },
  navBtn:     { background:"white", border:"1px solid #e2e8f0", borderRadius:"8px", padding:"5px 12px", fontSize:"18px", cursor:"pointer", color:"#374151", lineHeight:1, display:"flex", alignItems:"center", justifyContent:"center" },
  searchInput:{ width:"100%", padding:"8px 12px 8px 32px", border:"1px solid #e2e8f0", borderRadius:"10px", fontSize:"13.5px", fontFamily:font, background:"#f8fafc", color:"#0f172a", outline:"none", boxSizing:"border-box" },
  toggleWrap: { display:"flex", alignItems:"center", gap:"8px", background:"white", border:"1px solid #e2e8f0", borderRadius:"10px", padding:"6px 12px", cursor:"pointer", userSelect:"none", flexShrink:0 },
  toggleLabel:{ fontSize:"13px", fontWeight:"600", color:"#64748b", whiteSpace:"nowrap" },
  calCard:    { background:"white", borderRadius:"14px", border:"1px solid #f1f5f9", boxShadow:"0 1px 4px rgba(0,0,0,0.04)", overflow:"hidden" },
  cell:       { minHeight:"90px", borderRight:"1px solid #f1f5f9", borderBottom:"1px solid #f1f5f9", padding:"8px" },
  emptyCell:  { minHeight:"90px", borderRight:"1px solid #f1f5f9", borderBottom:"1px solid #f1f5f9", background:"#fafafa" },
  todayCell:  { background:"#eff6ff" },
  dayNum:     { fontSize:"12.5px", fontWeight:"600", color:"#64748b", width:"22px", height:"22px", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"4px" },
  todayNum:   { fontSize:"12.5px", fontWeight:"700", color:"white", background:"#1d4ed8", borderRadius:"50%", width:"22px", height:"22px", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"4px" },
  overflowChip:{ fontSize:"10.5px", color:"#1d4ed8", fontWeight:"600", padding:"1px 4px", cursor:"pointer" },
  sideCard:   { background:"white", border:"1px solid #f1f5f9", borderRadius:"14px", padding:"16px", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" },
  sideTitle:  { fontSize:"13px", fontWeight:"700", color:"#0f172a", letterSpacing:"-0.2px" },
  upCard:     { display:"flex", gap:"10px", padding:"10px 0", borderBottom:"1px solid #f1f5f9", cursor:"pointer" },
  upCompany:  { fontSize:"13px", fontWeight:"600", color:"#0f172a", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" },
  modal:      { background:"white", borderRadius:"16px", padding:"28px 28px 24px", maxWidth:"520px", width:"90%", boxShadow:"0 8px 40px rgba(0,0,0,0.18)", position:"relative" },
  modalCompany:{ fontSize:"18px", fontWeight:"700", color:"#0f172a", margin:0 },
  infoItem:   { background:"#f8fafc", borderRadius:"8px", padding:"10px 12px", border:"1px solid #f1f5f9" },
  infoValue:  { fontSize:"13.5px", fontWeight:"500", color:"#0f172a" },
  descBox:    { background:"#f8fafc", borderRadius:"8px", padding:"12px", fontSize:"13.5px", color:"#475569", lineHeight:"1.6", border:"1px solid #f1f5f9" },
  // list section
  listTitle:  { fontSize:"17px", fontWeight:"700", letterSpacing:"-0.4px", color:"#0f172a" },
  listSub:    { fontSize:"12.5px", color:"#94a3b8", marginTop:"3px" },
  pageBadge:  { fontSize:"12px", color:"#64748b", background:"#f1f5f9", padding:"4px 12px", borderRadius:"99px", border:"1px solid #e2e8f0", fontWeight:"500", alignSelf:"center" },
  driveRow:   { display:"flex", alignItems:"flex-start", justifyContent:"space-between", background:"white", border:"1px solid #f1f5f9", borderRadius:"12px", padding:"14px 16px", cursor:"pointer", transition:"box-shadow .15s", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" },
  rowCompany: { fontSize:"14px", fontWeight:"700", color:"#0f172a" },
  rowRole:    { fontSize:"12.5px", color:"#64748b", marginTop:"2px" },
  rowDate:    { fontSize:"12px", color:"#94a3b8", whiteSpace:"nowrap" },
  pageBtn:    { padding:"7px 13px", fontSize:"13px", fontWeight:"500", fontFamily:font, border:"1px solid #e2e8f0", borderRadius:"8px", cursor:"pointer", background:"white", color:"#374151", transition:"background .15s" },
};

// ── DARK THEME ────────────────────────────────────────────────────────────────
const dm = {
  ...ltt,
  page:        { ...ltt.page,        background:"#0f172a" },
  topbar:      { ...ltt.topbar,      background:"#1e293b", borderBottom:"1px solid #334155", boxShadow:"0 1px 3px rgba(0,0,0,0.3)" },
  monthLabel:  { ...ltt.monthLabel,  color:"#f1f5f9" },
  navBtn:      { ...ltt.navBtn,      background:"#1e293b", borderColor:"#334155", color:"#94a3b8" },
  searchInput: { ...ltt.searchInput, background:"#0f172a", borderColor:"#334155", color:"#f1f5f9" },
  toggleWrap:  { ...ltt.toggleWrap,  background:"#1e293b", borderColor:"#334155" },
  toggleLabel: { ...ltt.toggleLabel, color:"#94a3b8" },
  calCard:     { ...ltt.calCard,     background:"#1e293b", border:"1px solid #334155" },
  cell:        { ...ltt.cell,        borderRight:"1px solid #334155", borderBottom:"1px solid #334155", background:"#1e293b" },
  emptyCell:   { ...ltt.emptyCell,   borderRight:"1px solid #334155", borderBottom:"1px solid #334155", background:"#0f172a" },
  todayCell:   { background:"#1e3a5f" },
  dayNum:      { ...ltt.dayNum,      color:"#64748b" },
  todayNum:    { ...ltt.todayNum },
  overflowChip:{ ...ltt.overflowChip, color:"#93c5fd" },
  sideCard:    { ...ltt.sideCard,    background:"#1e293b", border:"1px solid #334155" },
  sideTitle:   { ...ltt.sideTitle,   color:"#f1f5f9" },
  upCard:      { ...ltt.upCard,      borderBottom:"1px solid #334155" },
  upCompany:   { ...ltt.upCompany,   color:"#f1f5f9" },
  modal:       { ...ltt.modal,       background:"#1e293b", boxShadow:"0 8px 40px rgba(0,0,0,.5)" },
  modalCompany:{ ...ltt.modalCompany,color:"#f1f5f9" },
  infoItem:    { ...ltt.infoItem,    background:"#0f172a", border:"1px solid #334155" },
  infoValue:   { ...ltt.infoValue,   color:"#f1f5f9" },
  descBox:     { ...ltt.descBox,     background:"#0f172a", border:"1px solid #334155", color:"#94a3b8" },
  // list section dark
  listTitle:   { ...ltt.listTitle,   color:"#f1f5f9" },
  listSub:     { ...ltt.listSub,     color:"#64748b" },
  pageBadge:   { ...ltt.pageBadge,   background:"#1e293b", borderColor:"#334155", color:"#94a3b8" },
  driveRow:    { ...ltt.driveRow,    background:"#1e293b", border:"1px solid #334155", boxShadow:"none" },
  rowCompany:  { ...ltt.rowCompany,  color:"#f1f5f9" },
  rowRole:     { ...ltt.rowRole,     color:"#94a3b8" },
  rowDate:     { ...ltt.rowDate,     color:"#64748b" },
  pageBtn:     { ...ltt.pageBtn,     background:"#1e293b", borderColor:"#334155", color:"#94a3b8" },
};