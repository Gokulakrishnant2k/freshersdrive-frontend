// src/pages/Hero.jsx
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";

const TICKER_MESSAGES = [
  "412 placed this month",
  "38 new drives today",
  "TCS, Infosys, Cognizant — hiring now",
  "Deadline tomorrow, 11:59 PM",
];

const TRUST_COMPANIES = ["TCS", "Infosys", "Wipro", "Cognizant", "Capgemini", "HCLTech", "Accenture"];

const CATEGORIES = [
  { label: "IT Services", icon: "💻" },
  { label: "Core Engineering", icon: "⚙️" },
  { label: "Internships", icon: "🎓" },
  { label: "Government", icon: "🏛️" },
];

const STYLE_BLOCK = `
  .fd-focus:focus-visible {
    outline: 2px solid #818cf8;
    outline-offset: 3px;
    border-radius: 8px;
  }
  .fd-nav-link { transition: color 0.18s ease; }
  .fd-nav-link:hover { color: rgba(255,255,255,0.85) !important; }
  .fd-signin-btn { transition: background 0.18s ease, border-color 0.18s ease; }
  .fd-signin-btn:hover { background: rgba(255,255,255,0.16) !important; border-color: rgba(255,255,255,0.32) !important; }
  .fd-trust-chip { transition: color 0.18s ease, border-color 0.18s ease, transform 0.18s ease; cursor: pointer; }
  .fd-trust-chip:hover { color: rgba(255,255,255,0.85) !important; border-color: rgba(129,140,248,0.5) !important; transform: translateY(-1px); }
  .fd-cat-chip { transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease; cursor: pointer; }
  .fd-cat-chip:hover { background: rgba(129,140,248,0.18) !important; border-color: rgba(129,140,248,0.5) !important; transform: translateY(-1px); }
  .fd-notify-input:focus { outline: none; border-color: rgba(129,140,248,0.6) !important; background: rgba(255,255,255,0.08) !important; }

  .fd-panel-fade { opacity: 0; transform: translateY(10px); transition: opacity 0.5s cubic-bezier(0.34,1.56,0.64,1), transform 0.5s cubic-bezier(0.34,1.56,0.64,1); }
  .fd-panel-fade.is-visible { opacity: 1; transform: translateY(0); }

  @keyframes fd-run-track { 0% { left: 0%; } 62% { left: calc(100% - 50px); } 72% { left: calc(100% - 50px); } 100% { left: 0%; } }
  @keyframes fd-run-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
  @keyframes fd-leg-l { 0%, 100% { transform: rotate(28deg); } 50% { transform: rotate(-28deg); } }
  @keyframes fd-leg-r { 0%, 100% { transform: rotate(-28deg); } 50% { transform: rotate(28deg); } }
  @keyframes fd-arm-l { 0%, 100% { transform: rotate(-32deg); } 50% { transform: rotate(32deg); } }
  @keyframes fd-arm-r { 0%, 100% { transform: rotate(32deg); } 50% { transform: rotate(-32deg); } }
  @keyframes fd-card-pulse { 0%, 55% { transform: scale(1); } 64% { transform: scale(1.18); } 72% { transform: scale(1); } 100% { transform: scale(1); } }
  @keyframes fd-burst { 0%, 60% { opacity: 0; transform: scale(0.5); } 68% { opacity: 1; transform: scale(1.15); } 78% { opacity: 1; transform: scale(1); } 92%, 100% { opacity: 0; transform: scale(0.9); } }
  .fd-run-figure { animation: fd-run-track 4.4s ease-in-out infinite, fd-run-bob 0.32s ease-in-out infinite; }
  .fd-run-leg-l { animation: fd-leg-l 0.32s ease-in-out infinite; transform-origin: 12px 2px; }
  .fd-run-leg-r { animation: fd-leg-r 0.32s ease-in-out infinite; transform-origin: 12px 2px; }
  .fd-run-arm-l { animation: fd-arm-l 0.32s ease-in-out infinite; transform-origin: 12px 2px; }
  .fd-run-arm-r { animation: fd-arm-r 0.32s ease-in-out infinite; transform-origin: 12px 2px; }
  .fd-offer-card { animation: fd-card-pulse 4.4s ease-in-out infinite; }
  .fd-burst { animation: fd-burst 4.4s ease-in-out infinite; }

  @keyframes fd-orb-a { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(28px,18px) scale(1.08); } }
  @keyframes fd-orb-b { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-22px,-14px) scale(1.05); } }
  @keyframes fd-dot-drift { 0%, 100% { transform: translateY(0); opacity: 0.5; } 50% { transform: translateY(-12px); opacity: 1; } }
  .fd-orb-a { animation: fd-orb-a 9s ease-in-out infinite; }
  .fd-orb-b { animation: fd-orb-b 11s ease-in-out infinite; }
  .fd-dot { animation: fd-dot-drift 3s ease-in-out infinite; }

  .fd-hero-grid { display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 40px; align-items: start; }
  .fd-hero-stats { display: flex; align-items: center; width: fit-content; }
  .fd-hero-cta { display: flex; gap: 12px; }

  @media (prefers-reduced-motion: reduce) {
    .fd-run-figure, .fd-run-leg-l, .fd-run-leg-r, .fd-run-arm-l, .fd-run-arm-r,
    .fd-offer-card, .fd-burst, .fd-orb-a, .fd-orb-b, .fd-dot, .fd-panel-fade {
      animation: none !important;
      transition: none !important;
      opacity: 1 !important;
      transform: none !important;
    }
  }

  @media (max-width: 860px) {
    .fd-hero-section { padding: 36px 20px 32px !important; }
    .fd-hero-grid { grid-template-columns: 1fr; gap: 28px; }
    .fd-hero-cta { flex-direction: column; }
    .fd-hero-cta button { width: 100%; }
    .fd-hero-stats { width: 100%; overflow-x: auto; -ms-overflow-style: none; scrollbar-width: none; }
    .fd-hero-stats::-webkit-scrollbar { display: none; }
    .fd-trust-strip { flex-direction: column; align-items: flex-start; gap: 10px !important; }
  }
`;

function useCountUp(target, durationMs = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return value;
}

// Lightweight CSS-only ambient backdrop. Replaces the old mouse-tracking
// canvas particle field, which had no equivalent on touch devices and
// cost real CPU on phones for an effect most mobile users never saw move.
function AmbientBackground() {
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      <div className="fd-orb-a" style={{ position: "absolute", top: "-12%", right: "-8%", width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.22), transparent 70%)" }} />
      <div className="fd-orb-b" style={{ position: "absolute", bottom: "-10%", left: "-8%", width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, rgba(192,132,252,0.14), transparent 70%)" }} />
      <span className="fd-dot" style={{ position: "absolute", top: "20%", left: "42%", width: 4, height: 4, borderRadius: "50%", background: "#a5b4fc", animationDelay: "0.2s" }} />
      <span className="fd-dot" style={{ position: "absolute", top: "65%", left: "60%", width: 3, height: 3, borderRadius: "50%", background: "#c4b5fd", animationDelay: "1s" }} />
      <span className="fd-dot" style={{ position: "absolute", top: "32%", left: "75%", width: 3, height: 3, borderRadius: "50%", background: "#7dabf8", animationDelay: "1.7s" }} />
    </div>
  );
}

// Signature element: a running figure crosses to the offer card and it
// bursts into a checkmark. Pure CSS loop, no JS timers.
function RunningToOffer() {
  return (
    <div aria-hidden="true" style={{ position: "relative", height: 70, margin: "0 0 16px" }}>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 12, borderBottom: "1px dashed rgba(255,255,255,0.12)" }} />
      <div style={{ position: "absolute", right: 0, top: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div className="fd-offer-card" style={{ width: 44, height: 44, borderRadius: 11, background: "rgba(99,102,241,0.16)", border: "0.5px solid rgba(129,140,248,0.45)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <div className="fd-burst" style={{ position: "absolute", inset: 0, borderRadius: 11, background: "rgba(52,211,153,0.22)", border: "0.5px solid rgba(52,211,153,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>your offer</span>
      </div>
      <div className="fd-run-figure" style={{ position: "absolute", bottom: 12, width: 22, height: 42 }}>
        <svg width="22" height="42" viewBox="0 0 26 50" fill="none">
          <circle cx="13" cy="7" r="6" fill="#f0997b" />
          <rect x="6" y="14" width="14" height="18" rx="6" fill="#7f77dd" />
          <g className="fd-run-arm-l"><rect x="6" y="14" width="5" height="16" rx="2.5" fill="#534ab7" /></g>
          <g className="fd-run-arm-r"><rect x="15" y="14" width="5" height="16" rx="2.5" fill="#534ab7" /></g>
          <g className="fd-run-leg-l"><rect x="8" y="30" width="5" height="18" rx="2.5" fill="#26215c" /></g>
          <g className="fd-run-leg-r"><rect x="13" y="30" width="5" height="18" rx="2.5" fill="#26215c" /></g>
        </svg>
      </div>
    </div>
  );
}

function CategoryPicker({ onCategoryClick }) {
  const [active, setActive] = useState(null);
  return (
    <div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
        Pick your path
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.label}
            type="button"
            className="fd-cat-chip fd-focus"
            onClick={() => { setActive(cat.label); onCategoryClick?.(cat.label); }}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              background: active === cat.label ? "rgba(129,140,248,0.18)" : "rgba(255,255,255,0.04)",
              border: `0.5px solid ${active === cat.label ? "rgba(129,140,248,0.5)" : "rgba(255,255,255,0.1)"}`,
              borderRadius: 8, padding: "8px 9px", fontFamily: "inherit",
              fontSize: 12, color: "#fff", textAlign: "left",
            }}
          >
            <span style={{ fontSize: 13 }}>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function NotifyForm({ onNotifyMe }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail || status === "submitting") return;
    setStatus("submitting");
    try {
      if (onNotifyMe) await onNotifyMe(email);
      setStatus("done");
    } catch {
      setStatus("idle");
    }
  };

  return (
    <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.14)", borderRadius: 10, padding: 10, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
        <span style={{ color: "#a5b4fc", fontSize: 13 }}>🔔</span>
        <span style={{ color: "#fff", fontSize: 11, fontWeight: 500 }}>Notify me</span>
      </div>
      {status === "done" ? (
        <div style={{ fontSize: 10.5, color: "#34d399", lineHeight: 1.4 }}>
          Done — we&apos;ll ping you when a new drive lands.
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 5 }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@college.edu"
            className="fd-notify-input"
            style={{
              flex: 1, minWidth: 0, fontSize: 11, color: "#fff",
              background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.18)",
              borderRadius: 6, padding: "6px 8px", fontFamily: "inherit",
            }}
          />
          <button
            type="submit"
            className="fd-focus"
            disabled={!isValidEmail || status === "submitting"}
            style={{
              fontSize: 11, fontWeight: 600, color: "#fff",
              background: isValidEmail ? "#6366f1" : "rgba(99,102,241,0.35)",
              border: "none", borderRadius: 6, padding: "6px 10px",
              cursor: isValidEmail ? "pointer" : "default", whiteSpace: "nowrap",
            }}
          >
            {status === "submitting" ? "…" : "Go"}
          </button>
        </form>
      )}
    </div>
  );
}

// Consolidated visual panel. On desktop this sits beside the headline; the
// grid collapses to one column on mobile so it simply flows underneath —
// no absolute positioning to break at small widths.
function SidePanel({ show1, show2, show3, onCategoryClick, onNotifyMe, liveApps }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 18 }}>
      <div className={`fd-panel-fade ${show1 ? "is-visible" : ""}`}>
        <RunningToOffer />
      </div>
      <div className={`fd-panel-fade ${show2 ? "is-visible" : ""}`} style={{ marginBottom: 14 }}>
        <CategoryPicker onCategoryClick={onCategoryClick} />
      </div>
      <div className={`fd-panel-fade ${show3 ? "is-visible" : ""}`} style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1, background: "rgba(99,102,241,0.14)", border: "0.5px solid rgba(99,102,241,0.3)", borderRadius: 10, padding: 10 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#a5b4fc" }}>{liveApps.toLocaleString()}</div>
          <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.45)" }}>applications today</div>
        </div>
        <NotifyForm onNotifyMe={onNotifyMe} />
      </div>
    </div>
  );
}

export default function Hero({ onBrowseClick, onHowItWorksClick, onNotifyMe, onCategoryClick }) {
  const [tickerIndex, setTickerIndex] = useState(0);
  const [tickerVisible, setTickerVisible] = useState(true);
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [show3, setShow3] = useState(false);
  const [liveApps, setLiveApps] = useState(847);

  const drivesTracked = useCountUp(1240);
  const offersLanded  = useCountUp(312);
  const colleges      = useCountUp(60);

  useEffect(() => {
    const id = setInterval(() => {
      setTickerVisible(false);
      setTimeout(() => {
        setTickerIndex((i) => (i + 1) % TICKER_MESSAGES.length);
        setTickerVisible(true);
      }, 300);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const t1 = setTimeout(() => setShow1(true), 500);
    const t2 = setTimeout(() => setShow2(true), 900);
    const t3 = setTimeout(() => setShow3(true), 1300);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setLiveApps((n) => n + Math.floor(Math.random() * 4) + 1);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      className="fd-hero-section"
      style={{
        background: "#0c0b2b",
        borderRadius: 20,
        overflow: "hidden",
        fontFamily: "system-ui, -apple-system, sans-serif",
        position: "relative",
        padding: 0,
      }}
    >
      <style>{STYLE_BLOCK}</style>
      <AmbientBackground />

      <div style={{ position: "relative", zIndex: 2, padding: "52px 48px 48px" }}>

        {/* Nav — just Drives + Sign in, nothing else to maintain */}
        <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 40, flexWrap: "wrap", gap: 12 }}>
          <Logo size={28} textSize={14} />
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <a
              className="fd-focus fd-nav-link"
              role="link"
              tabIndex={0}
              onClick={onBrowseClick}
              onKeyDown={(e) => { if (e.key === "Enter") onBrowseClick?.(); }}
              style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", textDecoration: "none", cursor: "pointer" }}
            >
              Drives
            </a>
            <Link
              to="/login"
              className="fd-focus fd-signin-btn"
              style={{
                fontSize: 12, fontWeight: 500, color: "#fff",
                background: "rgba(255,255,255,0.1)", border: "0.5px solid rgba(255,255,255,0.2)",
                borderRadius: 8, padding: "6px 14px", cursor: "pointer",
                textDecoration: "none", display: "inline-block",
              }}
            >
              Sign in
            </Link>
          </div>
        </nav>

        <div className="fd-hero-grid">

          {/* LEFT: message, proof, action */}
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(99,102,241,0.15)", border: "0.5px solid rgba(99,102,241,0.4)", borderRadius: 999, padding: "5px 14px", marginBottom: 22 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#818cf8", display: "inline-block" }} />
              <span style={{ fontSize: 12, color: "#a5b4fc", opacity: tickerVisible ? 1 : 0, transition: "opacity 0.3s" }}>
                {TICKER_MESSAGES[tickerIndex]}
              </span>
            </div>

            <h1 style={{ fontSize: "clamp(28px, 4.6vw, 44px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-1px", margin: "0 0 16px" }}>
              <span style={{ color: "#fff" }}>Your first step towards a </span>
              <span style={{
                background: "linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #f472b6 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
                successful career journey
              </span>
            </h1>

            <p style={{ fontSize: "clamp(14px, 1.6vw, 16px)", color: "rgba(255,255,255,0.55)", lineHeight: 1.65, margin: "0 0 28px", maxWidth: 420 }}>
              Your gateway to every open drive. Find the right opportunity. Take your shot — we&apos;ll help you land it.
            </p>

            <div className="fd-hero-cta" style={{ marginBottom: 28 }}>
              <button
                className="fd-focus"
                onClick={onBrowseClick}
                style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 10, padding: "13px 26px", fontSize: 14, fontWeight: 600, cursor: "pointer", letterSpacing: "-0.2px" }}
              >
                See open drives
              </button>
              <button
                className="fd-focus"
                onClick={onHowItWorksClick}
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.8)", border: "0.5px solid rgba(255,255,255,0.18)", borderRadius: 10, padding: "13px 26px", fontSize: 14, cursor: "pointer" }}
              >
                How it works
              </button>
            </div>

            <div className="fd-hero-stats" style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "16px 0" }}>
              {[
                { value: drivesTracked, label: "open drives", color: "#60a5fa" },
                { value: offersLanded,  label: "offers won",  color: "#c084fc" },
                { value: colleges,      label: "campuses",    color: "#34d399" },
              ].map((s, i) => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                  {i > 0 && <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.1)" }} />}
                  <div style={{ textAlign: "center", padding: "0 24px" }}>
                    <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px", color: s.color }}>
                      {s.value.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>
                      {s.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: consolidated, in-flow visual panel */}
          <SidePanel
            show1={show1}
            show2={show2}
            show3={show3}
            onCategoryClick={onCategoryClick}
            onNotifyMe={onNotifyMe}
            liveApps={liveApps}
          />
        </div>

        {/* Trust strip */}
        <div className="fd-trust-strip" style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 36 }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.6px" }}>
            Hiring this week
          </span>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {TRUST_COMPANIES.map((name) => (
              <span key={name} className="fd-trust-chip" style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.28)", letterSpacing: "-0.2px", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "4px 10px" }}>
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}