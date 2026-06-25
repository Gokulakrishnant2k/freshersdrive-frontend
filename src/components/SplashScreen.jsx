import { useEffect, useRef, useState } from "react";
import "./SplashScreen.css";

const WORD = "FresherSpot";
const ACCENT_START = 7;

export default function SplashScreen({ onComplete }) {
  const [letters, setLetters] = useState([]);
  const [phase, setPhase] = useState("intro"); // "intro" | "done"
  const shellRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const built = WORD.split("").map((ch, i) => ({
      ch,
      accent: i >= ACCENT_START,
      id: i,
    }));
    setLetters(built);
    spawnParticles();

    const timer = setTimeout(() => {
      setPhase("done");
      onComplete?.();
    }, 4200);

    return () => clearTimeout(timer);
  }, []);

  function spawnParticles() {
    if (!shellRef.current) return;
    particlesRef.current.forEach((p) => p.remove());
    particlesRef.current = [];
    for (let i = 0; i < 16; i++) {
      const p = document.createElement("div");
      p.className = "fs-particle";
      const sz = 2 + Math.random() * 5;
      p.style.cssText = `
        width:${sz}px;height:${sz}px;
        left:${5 + Math.random() * 90}%;
        bottom:${-8 + Math.random() * 20}px;
        animation-duration:${5 + Math.random() * 5}s;
        animation-delay:${Math.random() * 4}s;
      `;
      shellRef.current.appendChild(p);
      particlesRef.current.push(p);
    }
  }

  if (phase === "done") return null;

  return (
    <div className="fs-shell" ref={shellRef}>
      <div className="fs-stage">
        <div className="fs-icon-wrap">
          <div className="fs-ring fs-ring1" />
          <div className="fs-ring fs-ring2" />
          <div className="fs-icon-box">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="6" width="20" height="12" rx="3" stroke="#fff" strokeWidth="1.8" />
              <circle cx="2.5" cy="12" r="1.8" fill="#07080f" />
              <circle cx="21.5" cy="12" r="1.8" fill="#07080f" />
            </svg>
          </div>
        </div>

        <div className="fs-brand-name" aria-label="FresherSpot">
          {letters.map((l, i) => (
            <span
              key={l.id}
              className={`fs-letter${l.accent ? " fs-accent" : ""}`}
              style={{ animationDelay: `${0.95 + i * 0.06}s` }}
            >
              {l.ch}
            </span>
          ))}
        </div>

        <div className="fs-tagline-wrap">
          <div className="fs-quote">"</div>
          <div className="fs-tline fs-tline1">
            Where <em>'no experience?'</em>
          </div>
          <div className="fs-tline fs-tline2">
            stops being <span>the answer.</span>
          </div>
          <div className="fs-sep" />
          <div className="fs-dots">
            <span className="fs-dot" style={{ animationDelay: "3.2s" }} />
            <span className="fs-dot" style={{ animationDelay: "3.4s" }} />
            <span className="fs-dot" style={{ animationDelay: "3.6s" }} />
          </div>
        </div>
      </div>
    </div>
  );
}