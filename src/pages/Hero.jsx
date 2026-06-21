import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";

const NAV_LINKS = [
  { label: "Drives", type: "scroll" },
  { label: "Companies", type: "route", to: "/companies" },
  { label: "Resources", type: "route", to: "/resources" },
];

const TICKER_MESSAGES = [
  "412 placed this month",
  "38 new drives today",
  "TCS, Infosys, Cognizant — hiring now",
  "Deadline tomorrow, 11:59 PM",
];

const TRUST_COMPANIES = [
  "TCS", "Infosys", "Wipro", "Cognizant", "Capgemini", "HCLTech", "Accenture",
];

const CATEGORIES = [
  { label: "IT Services", icon: "💻" },
  { label: "Core Engineering", icon: "⚙️" },
  { label: "Internships", icon: "🎓" },
  { label: "Government", icon: "🏛️" },
];

const STYLE_BLOCK = `
  .fd-trust-chip {
    transition: color 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
    cursor: pointer;
  }
  .fd-trust-chip:hover {
    color: rgba(255,255,255,0.85) !important;
    border-color: rgba(129,140,248,0.5) !important;
    transform: translateY(-1px);
  }
  .fd-focus:focus-visible {
    outline: 2px solid #818cf8;
    outline-offset: 3px;
    border-radius: 8px;
  }
  .fd-notify-input:focus {
    outline: none;
    border-color: rgba(129,140,248,0.6) !important;
    background: rgba(255,255,255,0.08) !important;
  }
  .fd-cat-chip {
    transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
    cursor: pointer;
  }
  .fd-cat-chip:hover {
    background: rgba(129,140,248,0.18) !important;
    border-color: rgba(129,140,248,0.5) !important;
    transform: translateY(-1px);
  }
  .fd-nav-link {
    transition: color 0.18s ease;
  }
  .fd-nav-link:hover {
    color: rgba(255,255,255,0.85) !important;
  }
  .fd-signin-btn {
    transition: background 0.18s ease, border-color 0.18s ease;
  }
  .fd-signin-btn:hover {
    background: rgba(255,255,255,0.16) !important;
    border-color: rgba(255,255,255,0.32) !important;
  }

  @keyframes fd-run-track {
    0%   { left: 0%; }
    62%  { left: calc(100% - 54px); }
    72%  { left: calc(100% - 54px); }
    100% { left: 0%; }
  }
  @keyframes fd-run-bob {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-4px); }
  }
  @keyframes fd-leg-l {
    0%, 100% { transform: rotate(28deg); }
    50%      { transform: rotate(-28deg); }
  }
  @keyframes fd-leg-r {
    0%, 100% { transform: rotate(-28deg); }
    50%      { transform: rotate(28deg); }
  }
  @keyframes fd-arm-l {
    0%, 100% { transform: rotate(-32deg); }
    50%      { transform: rotate(32deg); }
  }
  @keyframes fd-arm-r {
    0%, 100% { transform: rotate(32deg); }
    50%      { transform: rotate(-32deg); }
  }
  @keyframes fd-card-pulse {
    0%, 55%   { transform: scale(1); }
    64%       { transform: scale(1.18); }
    72%       { transform: scale(1); }
    100%      { transform: scale(1); }
  }
  @keyframes fd-burst {
    0%, 60%  { opacity: 0; transform: scale(0.5); }
    68%      { opacity: 1; transform: scale(1.15); }
    78%      { opacity: 1; transform: scale(1); }
    92%, 100%{ opacity: 0; transform: scale(0.9); }
  }
  .fd-run-figure {
    animation: fd-run-track 4.4s ease-in-out infinite, fd-run-bob 0.32s ease-in-out infinite;
  }
  .fd-run-leg-l { animation: fd-leg-l 0.32s ease-in-out infinite; transform-origin: 12px 2px; }
  .fd-run-leg-r { animation: fd-leg-r 0.32s ease-in-out infinite; transform-origin: 12px 2px; }
  .fd-run-arm-l { animation: fd-arm-l 0.32s ease-in-out infinite; transform-origin: 12px 2px; }
  .fd-run-arm-r { animation: fd-arm-r 0.32s ease-in-out infinite; transform-origin: 12px 2px; }
  .fd-offer-card { animation: fd-card-pulse 4.4s ease-in-out infinite; }
  .fd-burst { animation: fd-burst 4.4s ease-in-out infinite; }

  @media (prefers-reduced-motion: reduce) {
    .fd-run-figure, .fd-run-leg-l, .fd-run-leg-r, .fd-run-arm-l, .fd-run-arm-r, .fd-offer-card, .fd-burst {
      animation: none !important;
    }
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

function ParticleCanvas() {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: 9999, y: 9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const parent = canvas.parentElement;
    let animId;

    const pts = [];
    const resize = () => {
      canvas.width = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
    };
    resize();

    for (let i = 0; i < 55; i++) {
      pts.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.5 + 0.5,
        o: Math.random() * 0.6 + 0.2,
      });
    }

    const onMouseMove = (e) => {
      const rect = parent.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    parent.addEventListener("mousemove", onMouseMove);

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const o1 = ctx.createRadialGradient(W * 0.72, H * 0.18, 0, W * 0.72, H * 0.18, W * 0.38);
      o1.addColorStop(0, "rgba(99,102,241,0.22)"); o1.addColorStop(1, "transparent");
      ctx.fillStyle = o1; ctx.fillRect(0, 0, W, H);

      const o2 = ctx.createRadialGradient(W * 0.08, H * 0.75, 0, W * 0.08, H * 0.75, W * 0.3);
      o2.addColorStop(0, "rgba(16,185,129,0.14)"); o2.addColorStop(1, "transparent");
      ctx.fillStyle = o2; ctx.fillRect(0, 0, W, H);

      const o3 = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, W * 0.25);
      o3.addColorStop(0, "rgba(192,132,252,0.07)"); o3.addColorStop(1, "transparent");
      ctx.fillStyle = o3; ctx.fillRect(0, 0, W, H);

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(129,140,248,${0.12 * (1 - d / 110)})`;
            ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
        const mx = p.x - mouse.current.x, my = p.y - mouse.current.y;
        const md = Math.sqrt(mx * mx + my * my);
        const glow = md < 80 ? 0.9 : p.o;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + (md < 80 ? 1 : 0), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(165,180,252,${glow})`; ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    return () => {
      cancelAnimationFrame(animId);
      parent.removeEventListener("mousemove", onMouseMove);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
}

function FloatCard({ className, style, children, visible }) {
  return (
    <div
      style={{
        position: "absolute",
        borderRadius: 14,
        padding: "12px 16px",
        background: "rgba(255,255,255,0.06)",
        border: "0.5px solid rgba(255,255,255,0.14)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(12px) scale(0.97)",
        transition: "opacity 0.5s cubic-bezier(0.34,1.56,0.64,1), transform 0.5s cubic-bezier(0.34,1.56,0.64,1)",
        ...style,
      }}
      className={className}
    >
      {children}
    </div>
  );
}

function CategoryCard({ visible, onCategoryClick }) {
  const [active, setActive] = useState(null);

  return (
    <FloatCard visible={visible} style={{ top: 96, right: 40, minWidth: 190 }}>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
        Pick your path
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.label}
            type="button"
            className="fd-cat-chip fd-focus"
            onClick={() => {
              setActive(cat.label);
              onCategoryClick?.(cat.label);
            }}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: active === cat.label ? "rgba(129,140,248,0.18)" : "rgba(255,255,255,0.04)",
              border: `0.5px solid ${active === cat.label ? "rgba(129,140,248,0.5)" : "rgba(255,255,255,0.1)"}`,
              borderRadius: 7, padding: "6px 9px", fontFamily: "inherit",
              fontSize: 12, color: "#fff", textAlign: "left",
            }}
          >
            <span style={{ fontSize: 13 }}>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>
    </FloatCard>
  );
}

function NotifyCard({ visible, onNotifyMe }) {
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
    <FloatCard visible={visible} style={{ bottom: 100, right: 60, minWidth: 230 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ color: "#a5b4fc", fontSize: 14 }}>🔔</span>
        <span style={{ color: "#fff", fontSize: 13, fontWeight: 500 }}>Don&apos;t miss your shot</span>
      </div>

      {status === "done" ? (
        <div style={{ fontSize: 11.5, color: "#34d399" }}>
          Done. We&apos;ll ping you the moment a new drive lands.
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 6 }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@college.edu"
            className="fd-notify-input"
            style={{
              flex: 1, minWidth: 0, fontSize: 11.5, color: "#fff",
              background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.18)",
              borderRadius: 7, padding: "7px 9px", fontFamily: "inherit",
            }}
          />
          <button
            type="submit"
            className="fd-focus"
            disabled={!isValidEmail || status === "submitting"}
            style={{
              fontSize: 11.5, fontWeight: 600, color: "#fff",
              background: isValidEmail ? "#6366f1" : "rgba(99,102,241,0.35)",
              border: "none", borderRadius: 7, padding: "7px 11px",
              cursor: isValidEmail ? "pointer" : "default", whiteSpace: "nowrap",
            }}
          >
            {status === "submitting" ? "…" : "Notify me"}
          </button>
        </form>
      )}
    </FloatCard>
  );
}

// Central illustration: a running figure crosses the track left-to-right,
// reaches the offer card at the finish, taps it, and it bursts into a
// checkmark. Loops continuously via CSS animation — no JS timers needed.
function RunningToOffer() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "relative",
        height: 86,
        margin: "0 0 32px",
        maxWidth: 520,
      }}
    >
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 14,
        borderBottom: "1px dashed rgba(255,255,255,0.12)",
      }} />

      <div style={{
        position: "absolute", right: 0, top: 6,
        display: "flex", flexDirection: "column", alignItems: "center",
      }}>
        <div className="fd-offer-card" style={{
          width: 52, height: 52, borderRadius: 12,
          background: "rgba(99,102,241,0.16)",
          border: "0.5px solid rgba(129,140,248,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative",
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <div className="fd-burst" style={{
            position: "absolute", inset: 0, borderRadius: 12,
            background: "rgba(52,211,153,0.22)", border: "0.5px solid rgba(52,211,153,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 5, letterSpacing: "0.3px" }}>
          your offer
        </span>
      </div>

      <div className="fd-run-figure" style={{ position: "absolute", bottom: 14, width: 26, height: 50 }}>
        <svg width="26" height="50" viewBox="0 0 26 50" fill="none">
          <circle cx="13" cy="7" r="6" fill="#f0997b" />
          <rect x="6" y="14" width="14" height="18" rx="6" fill="#7f77dd" />
          <g className="fd-run-arm-l">
            <rect x="6" y="14" width="5" height="16" rx="2.5" fill="#534ab7" />
          </g>
          <g className="fd-run-arm-r">
            <rect x="15" y="14" width="5" height="16" rx="2.5" fill="#534ab7" />
          </g>
          <g className="fd-run-leg-l">
            <rect x="8" y="30" width="5" height="18" rx="2.5" fill="#26215c" />
          </g>
          <g className="fd-run-leg-r">
            <rect x="13" y="30" width="5" height="18" rx="2.5" fill="#26215c" />
          </g>
        </svg>
      </div>
    </div>
  );
}

export default function Hero({ onBrowseClick, onHowItWorksClick, onNotifyMe, onCategoryClick }) {
  const [tickerIndex, setTickerIndex] = useState(0);
  const [tickerVisible, setTickerVisible] = useState(true);
  const [showCard1, setShowCard1] = useState(false);
  const [showCard2, setShowCard2] = useState(false);
  const [showCard3, setShowCard3] = useState(false);
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
    const t1 = setTimeout(() => setShowCard1(true), 1200);
    const t2 = setTimeout(() => setShowCard2(true), 1800);
    const t3 = setTimeout(() => setShowCard3(true), 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setLiveApps((n) => n + Math.floor(Math.random() * 4) + 1);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <section style={{
      background: "#0c0b2b",
      borderRadius: 20,
      overflow: "hidden",
      fontFamily: "system-ui, -apple-system, sans-serif",
      position: "relative",
      minHeight: 520,
      padding: 0,
    }}>
      <style>{STYLE_BLOCK}</style>
      <ParticleCanvas />

      <div style={{ position: "relative", zIndex: 2, padding: "52px 48px 60px" }}>

        {/* Nav */}
        <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 44 }}>
          <Logo size={28} textSize={14} />

          <div style={{ display: "flex", gap: 20 }}>
            {NAV_LINKS.map((item) =>
              item.type === "scroll" ? (
                <a
                  key={item.label}
                  className="fd-focus fd-nav-link"
                  role="link"
                  tabIndex={0}
                  onClick={onBrowseClick}
                  onKeyDown={(e) => { if (e.key === "Enter") onBrowseClick?.(); }}
                  style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", textDecoration: "none", cursor: "pointer" }}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.label}
                  to={item.to}
                  className="fd-focus fd-nav-link"
                  style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", textDecoration: "none", cursor: "pointer" }}
                >
                  {item.label}
                </Link>
              )
            )}
          </div>
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
        </nav>

        {/* Pill */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(99,102,241,0.15)", border: "0.5px solid rgba(99,102,241,0.4)",
          borderRadius: 999, padding: "5px 14px", marginBottom: 22,
        }}>
          <span style={{ position: "relative", width: 7, height: 7 }}>
            <span style={{
              display: "block", width: 7, height: 7, borderRadius: "50%", background: "#818cf8",
            }} />
          </span>
          <span style={{
            fontSize: 12, color: "#a5b4fc",
            opacity: tickerVisible ? 1 : 0,
            transition: "opacity 0.3s",
          }}>
            {TICKER_MESSAGES[tickerIndex]}
          </span>
        </div>

        {/* Headline */}
        <h1 style={{ fontSize: 46, fontWeight: 700, lineHeight: 1.1, letterSpacing: "-1.5px", margin: "0 0 16px" }}>
          <span style={{
            background: "linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #f472b6 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            Bet on yourself.
          </span>
          <br />
          <span style={{ color: "#fff" }}>We&apos;ll handle the rest.</span>
        </h1>

        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", lineHeight: 1.65, margin: "0 0 28px", maxWidth: 400 }}>
          Every open drive, every company, in one place. Pick your shot — we&apos;ll help you land it.
        </p>

        {/* Running-to-offer illustration */}
        <RunningToOffer />

        {/* Stats */}
        <div style={{
          display: "flex", alignItems: "center",
          background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)",
          borderRadius: 14, padding: "16px 0", width: "fit-content", marginBottom: 36,
        }}>
          {[
            { value: drivesTracked, label: "open drives", color: "#60a5fa" },
            { value: offersLanded,  label: "offers won",  color: "#c084fc" },
            { value: colleges,      label: "campuses",    color: "#34d399" },
          ].map((s, i) => (
            <div key={s.label} style={{ display: "flex", alignItems: "center" }}>
              {i > 0 && <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.1)" }} />}
              <div style={{ textAlign: "center", padding: "0 28px" }}>
                <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.5px", color: s.color }}>
                  {s.value.toLocaleString()}
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {s.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          <button
            className="fd-focus"
            onClick={onBrowseClick}
            style={{
              background: "#6366f1", color: "#fff", border: "none", borderRadius: 10,
              padding: "13px 26px", fontSize: 14, fontWeight: 600, cursor: "pointer", letterSpacing: "-0.2px",
            }}
          >
            See open drives
          </button>
          <button
            className="fd-focus"
            onClick={onHowItWorksClick}
            style={{
              background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.8)",
              border: "0.5px solid rgba(255,255,255,0.18)", borderRadius: 10,
              padding: "13px 26px", fontSize: 14, cursor: "pointer",
            }}
          >
            How it works
          </button>
        </div>

        {/* Trust strip — interactive on hover */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.6px" }}>
            Hiring this week
          </span>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {TRUST_COMPANIES.map((name) => (
              <span key={name} className="fd-trust-chip" style={{
                fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.28)",
                letterSpacing: "-0.2px", border: "0.5px solid rgba(255,255,255,0.1)",
                borderRadius: 6, padding: "4px 10px",
              }}>
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Float card 1 — interactive category browser */}
      <CategoryCard visible={showCard1} onCategoryClick={onCategoryClick} />

      {/* Float card 2 — live counter */}
      <FloatCard visible={showCard2} style={{ top: 200, right: 44, background: "rgba(99,102,241,0.12)", border: "0.5px solid rgba(99,102,241,0.3)" }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#a5b4fc" }}>{liveApps.toLocaleString()}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>applications today</div>
      </FloatCard>

      {/* Float card 3 — real, working email-notify signup */}
      <NotifyCard visible={showCard3} onNotifyMe={onNotifyMe} />
    </section>
  );
}