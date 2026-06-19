import { useEffect, useRef, useState } from "react";

const TICKER_MESSAGES = [
  "412 students placed this month",
  "38 new drives added today",
  "TCS, Infosys, Cognizant hiring now",
  "Next deadline: tomorrow 11:59 PM",
];

const TRUST_COMPANIES = [
  "TCS", "Infosys", "Wipro", "Cognizant", "Capgemini", "HCLTech", "Accenture",
];

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

export default function Hero({ onBrowseClick, onHowItWorksClick }) {
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
      <ParticleCanvas />

      <div style={{ position: "relative", zIndex: 2, padding: "52px 48px 60px" }}>

        {/* Nav */}
        <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 44 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 28, height: 28, background: "#6366f1", borderRadius: 7,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8l3 3 7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#fff", letterSpacing: "-0.2px" }}>
              FreshersDrive
            </span>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {["Drives", "Companies", "Resources"].map((l) => (
              <a key={l} style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", textDecoration: "none", cursor: "pointer" }}>{l}</a>
            ))}
          </div>
          <button style={{
            fontSize: 12, fontWeight: 500, color: "#fff",
            background: "rgba(255,255,255,0.1)", border: "0.5px solid rgba(255,255,255,0.2)",
            borderRadius: 8, padding: "6px 14px", cursor: "pointer",
          }}>Sign in</button>
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
            Land your first job,
          </span>
          <br />
          <span style={{ color: "#fff" }}>faster than ever.</span>
        </h1>

        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", lineHeight: 1.65, margin: "0 0 32px", maxWidth: 400 }}>
          FreshersDrive tracks every campus drive so you don&apos;t have to. One feed, zero FOMO.
        </p>

        {/* Stats */}
        <div style={{
          display: "flex", alignItems: "center",
          background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)",
          borderRadius: 14, padding: "16px 0", width: "fit-content", marginBottom: 36,
        }}>
          {[
            { value: drivesTracked, label: "drives tracked", color: "#60a5fa" },
            { value: offersLanded,  label: "offers landed",  color: "#c084fc" },
            { value: colleges,      label: "colleges",       color: "#34d399" },
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
            onClick={onBrowseClick}
            style={{
              background: "#6366f1", color: "#fff", border: "none", borderRadius: 10,
              padding: "13px 26px", fontSize: 14, fontWeight: 600, cursor: "pointer", letterSpacing: "-0.2px",
            }}
          >
            Browse drives
          </button>
          <button
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

        {/* Trust strip */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.6px" }}>
            Hiring now
          </span>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {TRUST_COMPANIES.map((name) => (
              <span key={name} style={{
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

      {/* Float card 1 — TCS NQT */}
      <FloatCard visible={showCard1} style={{ top: 96, right: 40, minWidth: 170 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
          <div style={{
            background: "#1d4ed8", color: "#bfdbfe", fontSize: 11, fontWeight: 700,
            width: 24, height: 24, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
          }}>T</div>
          <span style={{ color: "#fff", fontSize: 13, fontWeight: 500 }}>TCS NQT</span>
        </div>
        <div style={{ fontSize: 11, color: "#fbbf24" }}>Closes in 2 days</div>
      </FloatCard>

      {/* Float card 2 — live counter */}
      <FloatCard visible={showCard2} style={{ top: 200, right: 44, background: "rgba(99,102,241,0.12)", border: "0.5px solid rgba(99,102,241,0.3)" }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#a5b4fc" }}>{liveApps.toLocaleString()}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>applications today</div>
      </FloatCard>

      {/* Float card 3 — offer accepted */}
      <FloatCard visible={showCard3} style={{ bottom: 100, right: 60, minWidth: 200 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
          <span style={{ color: "#34d399", fontSize: 15 }}>✓</span>
          <span style={{ color: "#fff", fontSize: 13, fontWeight: 500 }}>Offer accepted at Cognizant</span>
        </div>
        <div style={{ fontSize: 11, color: "#34d399" }}>Priya R. — CSE, Anna University</div>
      </FloatCard>
    </section>
  );
}