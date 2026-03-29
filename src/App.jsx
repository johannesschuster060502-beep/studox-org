import { useState, useEffect, useRef } from "react";

/* ─── Constants ─────────────────────────────────────────────────────────────── */
const INFO_URL = "https://studox.info";

/* ─── Particle Canvas ───────────────────────────────────────────────────────── */
function Particles() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current, ctx = c.getContext("2d");
    let raf;
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
    // Warm rose + blue + amber palette for "heart" feel
    const pts = Array.from({ length: 70 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.6 + 0.3,
      hue: [340, 220, 30, 200, 355][Math.floor(Math.random() * 5)],
      sat: Math.random() * 30 + 50,
      a: Math.random() * 0.35 + 0.08,
      vy: -(Math.random() * 0.12 + 0.02),
      vx: (Math.random() - 0.5) * 0.04,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      pts.forEach((p) => {
        p.y += p.vy; p.x += p.vx;
        if (p.y < 0) { p.y = c.height; p.x = Math.random() * c.width; }
        if (p.x < 0 || p.x > c.width) p.vx *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},${p.sat}%,65%,${p.a})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />;
}

/* ─── Heart pulse logo mark ─────────────────────────────────────────────────── */
function ImpactMark({ size = 38 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id="im-bg" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="50%" stopColor="#e11d48" />
          <stop offset="100%" stopColor="#9f1239" />
        </radialGradient>
        <filter id="im-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" result="blur" />
          <feFlood floodColor="#f43f5e" floodOpacity="0.6" />
          <feComposite in2="blur" operator="in" result="g" />
          <feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#im-bg)" filter="url(#im-glow)" />
      {/* Heart path */}
      <path d="M20 30 C20 30 9 22 9 15.5 C9 11.4 12.1 8.5 15.5 8.5 C17.5 8.5 19.2 9.5 20 11 C20.8 9.5 22.5 8.5 24.5 8.5 C27.9 8.5 31 11.4 31 15.5 C31 22 20 30 20 30Z" fill="white" opacity="0.95" />
      <ellipse cx="16" cy="13.5" rx="2" ry="1.5" fill="white" opacity="0.45" transform="rotate(-20 16 13.5)" />
    </svg>
  );
}

/* ─── Animated counter ──────────────────────────────────────────────────────── */
function AnimCounter({ target, suffix = "", prefix = "", duration = 1800 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const step = (ts) => {
          if (!start) start = ts;
          const prog = Math.min((ts - start) / duration, 1);
          const ease = 1 - Math.pow(1 - prog, 3);
          setVal(Math.floor(ease * target));
          if (prog < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        io.disconnect();
      }
    }, { threshold: 0.4 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [target, duration]);
  return <span ref={ref}>{prefix}{val.toLocaleString("de")}{suffix}</span>;
}

/* ─── Donate Modal ──────────────────────────────────────────────────────────── */
function DonateModal({ onClose }) {
  const [amount, setAmount] = useState(15);
  const [custom, setCustom] = useState("");
  const [step, setStep]     = useState(1);
  const [name, setName]     = useState("");
  const [email, setEmail]   = useState("");
  const [focus, setFocus]   = useState(null);

  const finalAmount = custom ? parseFloat(custom) || 0 : amount;

  const impactLines = {
    5:  "1 Woche Lernmaterial für ein Kind",
    10: "1 Monat Serverkosten für 200 Schüler",
    15: "Mentor-Training für eine Freiwillige",
    25: "1 Clubraum-Buchung für 8 Wochen",
    50: "Vollständige Ausstattung einer Lerngruppe",
  };
  const impactText = custom ? "Jeder Euro verändert ein Leben." : (impactLines[finalAmount] || "Jeder Euro verändert ein Leben.");

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.88)", backdropFilter: "blur(24px)", padding: "20px" }} onClick={onClose}>
      <div style={{
        width: "min(500px,100%)", borderRadius: 28,
        background: "radial-gradient(ellipse at 50% 0%, rgba(244,63,94,0.14) 0%, rgba(3,3,20,0.99) 70%)",
        border: "1px solid rgba(244,63,94,0.3)",
        boxShadow: "0 0 100px rgba(244,63,94,0.12), 0 30px 80px rgba(0,0,0,0.8)",
        animation: "modal-in 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards",
        maxHeight: "90dvh", overflowY: "auto",
      }} onClick={(e) => e.stopPropagation()}>
        {step === 1 ? (
          <div style={{ padding: "36px 28px 32px", position: "relative" }}>
            <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "none", cursor: "pointer", color: "#6b7280", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>

            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 52, marginBottom: 10, animation: "heartbeat 1.4s ease-in-out infinite" }}>❤️</div>
              <h2 style={{ color: "#fff", fontWeight: 900, fontSize: 24, marginBottom: 8 }}>Bildung braucht dich.</h2>
              <p style={{ color: "#9ca3af", fontSize: 13.5, lineHeight: 1.55 }}>
                Jeder Euro fließt direkt in Bildungsprojekte. Keine Boni. Keine Manager. Nur Schüler.
              </p>
            </div>

            {/* Impact preview */}
            <div style={{ padding: "12px 16px", borderRadius: 14, background: "rgba(244,63,94,0.07)", border: "1px solid rgba(244,63,94,0.2)", marginBottom: 20, textAlign: "center" }}>
              <p style={{ color: "#fb7185", fontSize: 13, fontWeight: 600 }}>✨ {impactText}</p>
            </div>

            <p style={{ color: "#9ca3af", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Betrag wählen</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 10 }}>
              {[5, 10, 15, 25, 50].slice(0, 4).map((n) => (
                <button key={n} onClick={() => { setAmount(n); setCustom(""); }}
                  style={{ padding: "10px 6px", borderRadius: 12, border: `1.5px solid ${amount === n && !custom ? "rgba(244,63,94,0.6)" : "rgba(255,255,255,0.08)"}`, background: amount === n && !custom ? "rgba(244,63,94,0.12)" : "rgba(255,255,255,0.03)", color: amount === n && !custom ? "#fb7185" : "#6b7280", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
                  €{n}
                </button>
              ))}
            </div>
            <input type="number" placeholder="Eigener Betrag (€)" value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onFocus={() => setFocus("custom")} onBlur={() => setFocus(null)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: `1px solid ${focus === "custom" ? "rgba(244,63,94,0.4)" : "rgba(255,255,255,0.1)"}`, color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none", marginBottom: 20, transition: "border-color 0.2s" }} />

            <input type="text" placeholder="Dein Name *" value={name} onChange={(e) => setName(e.target.value)}
              onFocus={() => setFocus("name")} onBlur={() => setFocus(null)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: `1px solid ${focus === "name" ? "rgba(244,63,94,0.4)" : "rgba(255,255,255,0.1)"}`, color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none", marginBottom: 10, transition: "border-color 0.2s" }} />
            <input type="email" placeholder="E-Mail *" value={email} onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocus("email")} onBlur={() => setFocus(null)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: `1px solid ${focus === "email" ? "rgba(244,63,94,0.4)" : "rgba(255,255,255,0.1)"}`, color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none", marginBottom: 20, transition: "border-color 0.2s" }} />

            <button onClick={() => { if (name && email && finalAmount > 0) setStep(2); }}
              disabled={!name || !email || finalAmount <= 0}
              style={{ width: "100%", padding: "14px", borderRadius: 14, background: !name || !email ? "rgba(244,63,94,0.18)" : "linear-gradient(135deg,#e11d48,#f97316)", border: "none", color: "#fff", fontWeight: 800, fontSize: 15, cursor: !name || !email ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "transform 0.2s, opacity 0.2s", opacity: !name || !email ? 0.6 : 1, boxShadow: name && email ? "0 0 30px rgba(244,63,94,0.3)" : "none" }}
              onMouseEnter={(e) => { if (name && email) e.currentTarget.style.transform = "scale(1.015)"; }}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              {finalAmount > 0 ? `❤️ €${finalAmount} für Bildung spenden` : "Betrag eingeben"}
            </button>
            <p style={{ textAlign: "center", color: "#374151", fontSize: 11, marginTop: 12 }}>🔒 Sicher · 100% gemeinnützig · Steuerlich absetzbar (AT)</p>
          </div>
        ) : (
          <div style={{ padding: "56px 32px", textAlign: "center" }}>
            <div style={{ fontSize: 72, marginBottom: 16, animation: "bounce-in 0.5s cubic-bezier(0.34,1.56,0.64,1)" }}>🎉</div>
            <h2 style={{ color: "#fff", fontWeight: 900, fontSize: 28, marginBottom: 12 }}>Danke, {name}! 💙</h2>
            <p style={{ color: "#9ca3af", fontSize: 15, lineHeight: 1.7, marginBottom: 8 }}>
              Du hast gerade echte Bildung ermöglicht. Dein Beitrag von{" "}
              <strong style={{ color: "#fb7185" }}>€{finalAmount}</strong> geht zu 100% in aktive Projekte.
            </p>
            <p style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.65, marginBottom: 24 }}>
              Du bekommst eine Spendenbestätigung an <strong style={{ color: "#93c5fd" }}>{email}</strong>.
            </p>
            <div style={{ padding: "16px 20px", borderRadius: 16, background: "rgba(244,63,94,0.06)", border: "1px solid rgba(244,63,94,0.18)", marginBottom: 28 }}>
              <p style={{ color: "#fb7185", fontSize: 13, fontWeight: 600 }}>✨ {impactText}</p>
            </div>
            <a href={INFO_URL} style={{ display: "inline-block", padding: "12px 28px", borderRadius: 12, background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)", color: "#c4b5fd", fontWeight: 700, fontSize: 14, textDecoration: "none", marginBottom: 12 }}>
              🎮 Jetzt Demo ausprobieren →
            </a>
            <br />
            <button onClick={onClose} style={{ padding: "10px 24px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#6b7280", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit", marginTop: 8 }}>
              Schließen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Volunteer Modal ───────────────────────────────────────────────────────── */
function VolunteerModal({ onClose }) {
  const [role, setRole]   = useState("");
  const [name, setName]   = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg]     = useState("");
  const [sent, setSent]   = useState(false);
  const [focus, setFocus] = useState(null);

  const roles = [
    { id: "teacher",      label: "Lehrperson",      icon: "👨‍🏫", desc: "Lehre Schüler ehrenamtlich" },
    { id: "mentor",       label: "Mentor/in",        icon: "🤝", desc: "Begleite auf dem Lernweg" },
    { id: "psychologist", label: "Psycholog/in",     icon: "🧠", desc: "Psychologische Unterstützung" },
    { id: "developer",    label: "Entwickler/in",    icon: "💻", desc: "Baue die Plattform mit auf" },
    { id: "designer",     label: "Designer/in",      icon: "🎨", desc: "Gestalte die Lernwelt" },
    { id: "other",        label: "Anderes Talent",   icon: "✨", desc: "Jede Fähigkeit zählt" },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.88)", backdropFilter: "blur(24px)", padding: "20px" }} onClick={onClose}>
      <div style={{
        width: "min(540px,100%)", borderRadius: 28, maxHeight: "90dvh", overflowY: "auto",
        background: "radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.12) 0%, rgba(3,3,20,0.99) 70%)",
        border: "1px solid rgba(16,185,129,0.28)",
        boxShadow: "0 0 80px rgba(16,185,129,0.1), 0 30px 80px rgba(0,0,0,0.8)",
        animation: "modal-in 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards",
      }} onClick={(e) => e.stopPropagation()}>
        {!sent ? (
          <div style={{ padding: "36px 28px 32px", position: "relative" }}>
            <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "none", cursor: "pointer", color: "#6b7280", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>

            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 52, marginBottom: 10, animation: "float 2.5s ease-in-out infinite" }}>🌱</div>
              <h2 style={{ color: "#fff", fontWeight: 900, fontSize: 24, marginBottom: 8 }}>Werde Teil der Bewegung.</h2>
              <p style={{ color: "#9ca3af", fontSize: 13.5, lineHeight: 1.55 }}>
                Kein Gehalt. Dafür strahlende Kinderaugen und das Wissen, Europa besser gemacht zu haben.
              </p>
            </div>

            <p style={{ color: "#9ca3af", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Ich möchte als … helfen</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
              {roles.map((r) => (
                <button key={r.id} onClick={() => setRole(r.id)}
                  style={{ padding: "12px", borderRadius: 14, border: `1.5px solid ${role === r.id ? "rgba(16,185,129,0.55)" : "rgba(255,255,255,0.07)"}`, background: role === r.id ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.025)", cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "all 0.2s" }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{r.icon}</div>
                  <p style={{ color: role === r.id ? "#6ee7b7" : "#9ca3af", fontWeight: 700, fontSize: 12.5, marginBottom: 2 }}>{r.label}</p>
                  <p style={{ color: "#4b5563", fontSize: 11, lineHeight: 1.35 }}>{r.desc}</p>
                </button>
              ))}
            </div>

            <input type="text" placeholder="Dein Name *" value={name} onChange={(e) => setName(e.target.value)}
              onFocus={() => setFocus("name")} onBlur={() => setFocus(null)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: `1px solid ${focus === "name" ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.1)"}`, color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none", marginBottom: 10, transition: "border-color 0.2s" }} />
            <input type="email" placeholder="E-Mail *" value={email} onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocus("email")} onBlur={() => setFocus(null)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: `1px solid ${focus === "email" ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.1)"}`, color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none", marginBottom: 10, transition: "border-color 0.2s" }} />
            <textarea placeholder="Kurze Vorstellung (optional)" value={msg} onChange={(e) => setMsg(e.target.value)} rows={3}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none", resize: "vertical", marginBottom: 20 }} />

            <button onClick={() => { if (name && email && role) setSent(true); }}
              disabled={!name || !email || !role}
              style={{ width: "100%", padding: "14px", borderRadius: 14, background: !name || !email || !role ? "rgba(16,185,129,0.15)" : "linear-gradient(135deg,#059669,#0891b2)", border: "none", color: "#fff", fontWeight: 800, fontSize: 15, cursor: !name || !email || !role ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "transform 0.2s", opacity: !name || !email || !role ? 0.5 : 1, boxShadow: name && email && role ? "0 0 30px rgba(16,185,129,0.25)" : "none" }}
              onMouseEnter={(e) => { if (name && email && role) e.currentTarget.style.transform = "scale(1.015)"; }}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              🌱 Jetzt bewerben
            </button>
            <p style={{ textAlign: "center", color: "#374151", fontSize: 11, marginTop: 12 }}>Wir melden uns innerhalb von 48 Stunden.</p>
          </div>
        ) : (
          <div style={{ padding: "56px 32px", textAlign: "center" }}>
            <div style={{ fontSize: 72, marginBottom: 16, animation: "bounce-in 0.5s cubic-bezier(0.34,1.56,0.64,1)" }}>🌟</div>
            <h2 style={{ color: "#fff", fontWeight: 900, fontSize: 26, marginBottom: 12 }}>Willkommen in der Familie, {name}! 💚</h2>
            <p style={{ color: "#9ca3af", fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>
              Du bist jetzt offiziell Teil von StudoX Impact. Gemeinsam verändern wir Europa — ein Kind nach dem anderen.
              Wir melden uns bald unter <strong style={{ color: "#6ee7b7" }}>{email}</strong>.
            </p>
            <a href={INFO_URL} style={{ display: "inline-block", padding: "12px 28px", borderRadius: 12, background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)", color: "#c4b5fd", fontWeight: 700, fontSize: 14, textDecoration: "none", marginBottom: 12 }}>
              🎮 Demo ausprobieren →
            </a>
            <br />
            <button onClick={onClose} style={{ padding: "10px 24px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#6b7280", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit", marginTop: 8 }}>
              Schließen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main App ──────────────────────────────────────────────────────────────── */
export default function App() {
  const [showDonate,    setShowDonate]    = useState(false);
  const [showVolunteer, setShowVolunteer] = useState(false);
  const [scrollY,       setScrollY]       = useState(0);
  const [manifestoOpen, setManifestoOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <div style={{ minHeight: "100dvh", background: "#030314", color: "#fff", fontFamily: "'Inter Variable','Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", overflowX: "hidden" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #030314; }
        html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
        input, textarea, select { font-size: 16px !important; touch-action: manipulation; }
        button, a { touch-action: manipulation; -webkit-tap-highlight-color: transparent; }

        @keyframes modal-up {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-10px); }
        }
        @keyframes bounce-in {
          from { transform: scale(0) rotate(-10deg); }
          to   { transform: scale(1) rotate(0deg); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(50px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes heartbeat {
          0%,100% { transform: scale(1); }
          14%      { transform: scale(1.15); }
          28%      { transform: scale(1); }
          42%      { transform: scale(1.1); }
          56%      { transform: scale(1); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.9); opacity: 0.6; }
          50%  { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0.6; }
        }
        @keyframes badge-pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(244,63,94,0.4); }
          50%      { box-shadow: 0 0 0 8px rgba(244,63,94,0); }
        }
        @keyframes manifesto-in {
          from { opacity: 0; max-height: 0; }
          to   { opacity: 1; max-height: 600px; }
        }
        @keyframes card-rise {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shine {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .cta-btn  { transition: transform 0.22s, box-shadow 0.22s; }
        .cta-btn:hover  { transform: translateY(-3px) scale(1.02); }
        .cta-btn:active { transform: scale(0.97); }
        .hover-lift { transition: transform 0.25s, border-color 0.25s, box-shadow 0.25s; }
        .hover-lift:hover { transform: translateY(-5px); box-shadow: 0 12px 40px rgba(0,0,0,0.4) !important; }

        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #030314; }
        ::-webkit-scrollbar-thumb { background: rgba(244,63,94,0.25); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(244,63,94,0.4); }
      `}</style>

      <Particles />
      {/* Subtle grid */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: "linear-gradient(rgba(244,63,94,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.018) 1px,transparent 1px)", backgroundSize: "80px 80px" }} />

      {/* ── NAV ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, height: 64, padding: "0 28px",
        background: scrollY > 20 ? "rgba(3,3,20,0.94)" : "transparent",
        backdropFilter: scrollY > 20 ? "blur(24px)" : "none",
        borderBottom: scrollY > 20 ? "1px solid rgba(255,255,255,0.05)" : "none",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        transition: "all 0.3s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ImpactMark size={36} />
          <div style={{ lineHeight: 1 }}>
            <div style={{ color: "#fff", fontWeight: 900, fontSize: 15.5 }}>StudoX Impact</div>
            <div style={{ color: "#f87171", fontSize: 10, fontWeight: 600, letterSpacing: 0.5 }}>Non-Profit · gemeinnützig</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {/* Desktop: section links */}
          <a href="#story" style={{ color: "#6b7280", fontSize: 12.5, fontWeight: 600, textDecoration: "none", padding: "6px 10px", display: "none" }} className="nav-desktop">Mission</a>
          <a href="#volunteer" style={{ color: "#6b7280", fontSize: 12.5, fontWeight: 600, textDecoration: "none", padding: "6px 10px", display: "none" }} className="nav-desktop">Mitmachen</a>

          {/* Platform pill buttons */}
          <a href="https://studox.eu" target="_blank" rel="noopener"
            style={{ padding: "7px 13px", borderRadius: 100, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#9ca3af", fontSize: 12, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 10 }}>🌐</span> studox.eu
          </a>
          <a href={INFO_URL} target="_blank" rel="noopener"
            style={{ padding: "7px 13px", borderRadius: 100, background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.28)", color: "#c4b5fd", fontSize: 12, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 5 }}>
            <span>🎮</span> studox.info
          </a>
          <button className="cta-btn" onClick={() => setShowDonate(true)}
            style={{ padding: "8px 18px", borderRadius: 100, background: "linear-gradient(135deg,#e11d48,#f97316)", border: "none", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 0 20px rgba(244,63,94,0.3)", whiteSpace: "nowrap" }}>
            ❤️ Spenden
          </button>
        </div>
      </nav>

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ── HERO ── */}
        <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "100px 24px 80px", textAlign: "center", position: "relative" }}>
          {/* Warm glow */}
          <div style={{ position: "absolute", top: "35%", left: "50%", transform: "translate(-50%,-50%)", width: 800, height: 800, background: "radial-gradient(circle, rgba(244,63,94,0.07) 0%, transparent 65%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "55%", left: "30%", width: 400, height: 400, background: "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 65%)", pointerEvents: "none" }} />

          <div style={{ animation: "slide-up 0.9s cubic-bezier(0.34,1.2,0.64,1) forwards" }}>
            {/* Independence badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 18px",
              borderRadius: 100, marginBottom: 12,
              background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.28)",
              animation: "badge-pulse 3s ease-in-out infinite",
            }}>
              <span style={{ fontSize: 14 }}>❤️</span>
              <span style={{ color: "#fb7185", fontSize: 11.5, fontWeight: 700, letterSpacing: 0.8 }}>UNABHÄNGIGE GEMEINNÜTZIGE ORGANISATION</span>
            </div>

            {/* EU badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 18px",
              borderRadius: 100, marginBottom: 32, marginLeft: 8,
              background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.25)",
            }}>
              <span style={{ fontSize: 14 }}>🇪🇺</span>
              <span style={{ color: "#93c5fd", fontSize: 11.5, fontWeight: 700, letterSpacing: 0.8 }}>EUROPÄISCHE BILDUNGSINITIATIVE</span>
            </div>

            <h1 style={{ fontSize: "clamp(44px,9vw,104px)", fontWeight: 900, lineHeight: 0.97, letterSpacing: -4, marginBottom: 28 }}>
              <span style={{ background: "linear-gradient(135deg,#fff 0%,#fecdd3 40%,#93c5fd 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", display: "block" }}>
                Bildung
              </span>
              <span style={{ background: "linear-gradient(135deg,#f43f5e 0%,#fb923c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", display: "block" }}>
                rettet Leben.
              </span>
            </h1>

            <p style={{ color: "#9ca3af", fontSize: "clamp(16px,2.5vw,20px)", maxWidth: 560, margin: "0 auto 16px", lineHeight: 1.65 }}>
              StudoX Impact ist eine eigenständige gemeinnützige Organisation — gegründet aus der Überzeugung, dass kein Kind in Europa an fehlender Bildung scheitern sollte.
            </p>
            <p style={{ color: "#6b7280", fontSize: "clamp(13px,1.8vw,15px)", maxWidth: 500, margin: "0 auto 36px", lineHeight: 1.7 }}>
              Wir sind kein Marketingprojekt. Wir sind keine Abteilung eines Unternehmens. Wir sind Menschen, die brennen — für Bildung, für Kinder, für Europa.
            </p>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 20 }}>
              <button className="cta-btn" onClick={() => setShowDonate(true)}
                style={{ padding: "16px 36px", borderRadius: 16, background: "linear-gradient(135deg,#e11d48,#f97316)", border: "none", color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 0 60px rgba(244,63,94,0.3), 0 20px 40px rgba(0,0,0,0.4)" }}>
                ❤️ Jetzt spenden
              </button>
              <button className="cta-btn" onClick={() => setShowVolunteer(true)}
                style={{ padding: "16px 36px", borderRadius: 16, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.28)", color: "#6ee7b7", fontWeight: 700, fontSize: 16, cursor: "pointer", fontFamily: "inherit" }}>
                🌱 Ehrenamtlich helfen
              </button>
            </div>

            {/* Demo teaser link */}
            <a href={INFO_URL} target="_blank" rel="noopener"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#6b7280", fontSize: 13, textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#9ca3af"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#6b7280"}
            >
              <span>🎮</span>
              <span>Neugierig auf StudoX? Demo auf studox.info ausprobieren →</span>
            </a>
          </div>

          {/* Scroll hint */}
          <div style={{ position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)", animation: "float 2s ease-in-out infinite", opacity: 0.4 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
          </div>
        </section>

        {/* ── INDEPENDENCE BANNER ── */}
        <section style={{
          padding: "48px 24px",
          background: "linear-gradient(135deg, rgba(244,63,94,0.04) 0%, rgba(3,3,20,0) 50%, rgba(59,130,246,0.04) 100%)",
          borderTop: "1px solid rgba(244,63,94,0.1)",
          borderBottom: "1px solid rgba(59,130,246,0.1)",
        }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "center", alignItems: "stretch" }}>
              {[
                { icon: "🏛️", color: "#f43f5e", title: "Eigenständige NGO", desc: "StudoX Impact ist rechtlich und organisatorisch vollständig von der StudoX GmbH unabhängig. Eigener Vorstand, eigene Satzung, eigene Mission." },
                { icon: "💯", color: "#10b981", title: "100% Transparenz", desc: "Jährliche Finanzberichte, öffentliche Ausgaben, kein Gehalt für Vorstände. Jeder Cent ist nachverfolgbar — weil ihr uns das Vertrauen schenkt." },
                { icon: "🇪🇺", color: "#3b82f6", title: "Pan-europäisch & gemeinnützig", desc: "In Österreich registriert, europaweit tätig. Alle Projekte sind kostenlos zugänglich — in jeder EU-Sprache, für jedes Kind." },
              ].map((b) => (
                <div key={b.title} className="hover-lift" style={{
                  flex: "1 1 240px", padding: "24px 22px", borderRadius: 20,
                  background: `${b.color}07`, border: `1px solid ${b.color}18`,
                  boxShadow: `0 0 0 rgba(0,0,0,0)`,
                }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{b.icon}</div>
                  <h3 style={{ color: "#fff", fontWeight: 800, fontSize: 15, marginBottom: 8 }}>{b.title}</h3>
                  <p style={{ color: "#6b7280", fontSize: 13, lineHeight: 1.65 }}>{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── IMPACT STATS ── */}
        <section style={{ padding: "90px 24px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 16px", borderRadius: 100, marginBottom: 16, background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.22)" }}>
              <span style={{ color: "#fb7185", fontSize: 11.5, fontWeight: 700, letterSpacing: 0.8 }}>🎯 UNSER ZIEL FÜR EUROPA</span>
            </div>
            <h2 style={{ fontSize: "clamp(28px,5vw,52px)", fontWeight: 900, letterSpacing: -2, color: "#fff", marginBottom: 56, lineHeight: 1.1 }}>
              Zahlen mit Seele.
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 28 }}>
              {[
                { target: 1000000, suffix: "+", label: "Schüler erreichen", icon: "🎓", color: "#8b5cf6" },
                { target: 27, suffix: "", label: "EU-Länder", icon: "🇪🇺", color: "#3b82f6" },
                { target: 10000, suffix: "+", label: "Freiwillige weltweit", icon: "🌱", color: "#10b981" },
                { target: 100, suffix: "%", label: "Kostenlos für Lernende", icon: "❤️", color: "#f43f5e" },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: "center", padding: "28px 20px", borderRadius: 20, background: `${s.color}06`, border: `1px solid ${s.color}14` }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{s.icon}</div>
                  <p style={{ fontSize: 44, fontWeight: 900, letterSpacing: -2, lineHeight: 1, marginBottom: 6 }}>
                    <span style={{ background: `linear-gradient(135deg,#fff,${s.color})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                      <AnimCounter target={s.target} suffix={s.suffix} />
                    </span>
                  </p>
                  <p style={{ color: "#6b7280", fontSize: 12.5, fontWeight: 500, lineHeight: 1.4 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── OUR STORY / MANIFESTO ── */}
        <section id="story" style={{ padding: "90px 24px", background: "rgba(244,63,94,0.025)", borderTop: "1px solid rgba(244,63,94,0.07)" }}>
          <div style={{ maxWidth: 820, margin: "0 auto" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 16px", borderRadius: 100, marginBottom: 20, background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.22)" }}>
              <span style={{ fontSize: 14 }}>📖</span>
              <span style={{ color: "#fb7185", fontSize: 11.5, fontWeight: 700, letterSpacing: 0.8 }}>UNSERE GESCHICHTE</span>
            </div>

            <h2 style={{ fontSize: "clamp(28px,5vw,52px)", fontWeight: 900, letterSpacing: -1.5, color: "#fff", marginBottom: 24, lineHeight: 1.1 }}>
              Warum wir existieren.
            </h2>

            <p style={{ color: "#9ca3af", fontSize: 16, lineHeight: 1.85, marginBottom: 20 }}>
              Alles begann mit einer einfachen Beobachtung: Kinder in Wien lernen mit modernsten Tools. Kinder 200 km entfernt — in kleinen Dörfern, in ärmeren Regionen, in Schulen ohne Budget — lernen wie vor 30 Jahren.
            </p>
            <p style={{ color: "#6b7280", fontSize: 15, lineHeight: 1.85, marginBottom: 20 }}>
              Das ist keine Frage der Intelligenz. Das ist eine Frage der <em style={{ color: "#9ca3af" }}>Ressourcen</em>. Und das akzeptieren wir nicht.
            </p>

            {/* Quote block */}
            <div style={{ margin: "36px 0", padding: "24px 28px", borderRadius: 20, background: "rgba(244,63,94,0.06)", border: "1px solid rgba(244,63,94,0.15)", borderLeft: "3px solid #f43f5e" }}>
              <p style={{ color: "#fecdd3", fontSize: 18, fontStyle: "italic", lineHeight: 1.65, fontWeight: 600 }}>
                "Bildung ist kein Privileg. Sie ist ein Grundrecht. Und wir kämpfen dafür, dass das endlich gelebt wird — in jedem Land, in jeder Sprache, für jedes Kind."
              </p>
              <p style={{ color: "#6b7280", fontSize: 12, marginTop: 12, fontWeight: 600 }}>— Gründungsteam, StudoX Impact</p>
            </div>

            {/* Expandable manifesto */}
            <button onClick={() => setManifestoOpen(x => !x)}
              style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", color: "#fb7185", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", padding: "8px 0", marginBottom: manifestoOpen ? 20 : 0 }}>
              <span style={{ transition: "transform 0.3s", transform: manifestoOpen ? "rotate(90deg)" : "rotate(0)" }}>▶</span>
              {manifestoOpen ? "Weniger lesen" : "Unser vollständiges Manifest lesen"}
            </button>

            {manifestoOpen && (
              <div style={{ animation: "slide-up 0.4s ease forwards" }}>
                {[
                  "Wir glauben, dass Neugier das kostbarste Gut eines Kindes ist. Unsere Aufgabe ist es, diese Neugier zu nähren — nicht mit leeren Versprechen, sondern mit echten Werkzeugen.",
                  "Wir glauben an ehrenamtliches Engagement als politischen Akt. Jede Stunde, die eine Lehrerin, ein Mentor oder ein Entwickler unentgeltlich gibt, ist ein Statement gegen Gleichgültigkeit.",
                  "Wir glauben nicht an Bildung als Produkt. Deshalb ist StudoX für Lernende kostenlos — heute, morgen und für immer. Punkt.",
                  "Wir sind unabhängig. Wir nehmen keine politischen Gelder. Wir sind keiner Partei verpflichtet. Unsere einzige Verpflichtung gilt den Kindern Europas.",
                  "Wir messen unseren Erfolg nicht in Downloads oder Klicks — sondern darin, ob eine Schülerin aus Bulgarien dieselbe Chance hat wie einer aus Österreich.",
                ].map((t, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, marginBottom: 16, alignItems: "flex-start" }}>
                    <span style={{ color: "#f43f5e", fontSize: 18, lineHeight: "24px", flexShrink: 0 }}>♥</span>
                    <p style={{ color: "#9ca3af", fontSize: 15, lineHeight: 1.75 }}>{t}</p>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: 36, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
              {[
                { icon: "🎓", color: "#8b5cf6", title: "Gamified Learning", desc: "XP, Quests und Achievements machen Lernen zur Leidenschaft, nicht zur Pflicht." },
                { icon: "🏛️", color: "#10b981", title: "Offline Clubs", desc: "Echte Lerngruppen in echten Räumen — digital unterstützt, lokal verankert." },
                { icon: "🧠", color: "#3b82f6", title: "Mentoring & Seele", desc: "Freiwillige Lehrer, Mentoren, Psychologen. Weil Technik allein nicht reicht." },
                { icon: "🌍", color: "#f97316", title: "27 Länder, eine Vision", desc: "Mehrsprachig, kulturoffen, konzipiert für ganz Europa — nicht nur für Wien." },
                { icon: "♾️", color: "#ec4899", title: "Kostenlos für immer", desc: "Für Lernende bleibt StudoX immer gratis. Keine Ausnahmen, keine Hintertüren." },
                { icon: "📊", color: "#06b6d4", title: "Volle Transparenz", desc: "Offene Bücher, öffentliche Berichte, kein Cent verschwindet ohne Erklärung." },
              ].map((f) => (
                <div key={f.title} className="hover-lift" style={{ padding: "22px", borderRadius: 18, background: `${f.color}07`, border: `1px solid ${f.color}16` }}>
                  <div style={{ fontSize: 26, marginBottom: 10 }}>{f.icon}</div>
                  <h3 style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{f.title}</h3>
                  <p style={{ color: "#6b7280", fontSize: 12.5, lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── DEMO TEASER ── */}
        <section style={{ padding: "90px 24px" }}>
          <div style={{ maxWidth: 820, margin: "0 auto" }}>
            <div style={{ borderRadius: 28, overflow: "hidden", position: "relative", background: "linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(6,182,212,0.08) 50%, rgba(16,185,129,0.08) 100%)", border: "1px solid rgba(139,92,246,0.25)", padding: "52px 40px", textAlign: "center" }}>
              {/* Background glow */}
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 500, height: 300, background: "radial-gradient(ellipse, rgba(139,92,246,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

              <div style={{ position: "relative" }}>
                <div style={{ fontSize: 52, marginBottom: 16, animation: "float 3s ease-in-out infinite" }}>🎮</div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 16px", borderRadius: 100, marginBottom: 20, background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)" }}>
                  <span style={{ color: "#c4b5fd", fontSize: 11.5, fontWeight: 700, letterSpacing: 0.8 }}>✨ LIVE DEMO VERFÜGBAR</span>
                </div>
                <h2 style={{ fontSize: "clamp(26px,4vw,46px)", fontWeight: 900, letterSpacing: -1.5, color: "#fff", marginBottom: 16, lineHeight: 1.1 }}>
                  Erlebe StudoX selbst.
                </h2>
                <p style={{ color: "#9ca3af", fontSize: 16, lineHeight: 1.65, maxWidth: 520, margin: "0 auto 32px" }}>
                  Auf <strong style={{ color: "#c4b5fd" }}>studox.info</strong> kannst du StudoX Flow und Offline Clubs direkt ausprobieren — kein Account, keine Installation. Einfach reinspringen und erleben, wofür wir brennen.
                </p>

                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
                  <a href={`${INFO_URL}/#demo`} target="_blank" rel="noopener" className="cta-btn"
                    style={{ display: "inline-block", padding: "14px 32px", borderRadius: 14, background: "linear-gradient(135deg,#7c3aed,#0891b2)", border: "none", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", textDecoration: "none", boxShadow: "0 0 40px rgba(139,92,246,0.25)" }}>
                    🎓 StudoX Flow Demo
                  </a>
                  <a href={`${INFO_URL}/#demo`} target="_blank" rel="noopener" className="cta-btn"
                    style={{ display: "inline-block", padding: "14px 32px", borderRadius: 14, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#6ee7b7", fontWeight: 700, fontSize: 15, cursor: "pointer", textDecoration: "none" }}>
                    🏛️ Offline Clubs Demo
                  </a>
                </div>

                <p style={{ color: "#4b5563", fontSize: 12 }}>
                  Kein Account · Kostenlos · Sofort startbar
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── VOLUNTEER ── */}
        <section id="volunteer" style={{ padding: "90px 24px", background: "rgba(16,185,129,0.03)", borderTop: "1px solid rgba(16,185,129,0.07)" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 52, alignItems: "center" }}>
              <div style={{ flex: 1, minWidth: 280 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 16px", borderRadius: 100, marginBottom: 20, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.22)" }}>
                  <span style={{ fontSize: 13 }}>🌱</span>
                  <span style={{ color: "#6ee7b7", fontSize: 11.5, fontWeight: 700, letterSpacing: 0.8 }}>EHRENAMT</span>
                </div>
                <h2 style={{ fontSize: "clamp(26px,4vw,46px)", fontWeight: 900, letterSpacing: -1.5, color: "#fff", marginBottom: 18, lineHeight: 1.1 }}>
                  Dein Talent<br />verändert Europa.
                </h2>
                <p style={{ color: "#9ca3af", fontSize: 15, lineHeight: 1.8, marginBottom: 16 }}>
                  Du brauchst kein Gehalt, um etwas zu bewegen. Du brauchst nur den Willen — und wir geben dir alles andere. Struktur, Begleitung, eine Community, die für dasselbe brennt wie du.
                </p>
                <p style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.8, marginBottom: 32 }}>
                  Egal ob du 2 Stunden pro Woche oder 20 hast. Ob du Lehrperson, Entwickler, Designer oder einfach ein Mensch mit Herz bist — es gibt einen Platz für dich bei StudoX Impact.
                </p>
                <button className="cta-btn" onClick={() => setShowVolunteer(true)}
                  style={{ padding: "14px 32px", borderRadius: 14, background: "linear-gradient(135deg,#059669,#0891b2)", border: "none", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 0 40px rgba(16,185,129,0.2)" }}>
                  🌱 Jetzt Freiwillige/r werden
                </button>
              </div>

              <div style={{ flex: 1, minWidth: 280 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { icon: "👨‍🏫", label: "Lehrpersonen",     color: "#8b5cf6", who: "Teile dein Wissen" },
                    { icon: "🤝", label: "Mentoren",          color: "#06b6d4", who: "Begleite Lernende" },
                    { icon: "🧠", label: "Psycholog/innen",   color: "#10b981", who: "Stärke Seelen" },
                    { icon: "💻", label: "Entwickler/innen",  color: "#f97316", who: "Baue die Zukunft" },
                    { icon: "🎨", label: "Designer/innen",    color: "#ec4899", who: "Gestalte Schönes" },
                    { icon: "✨", label: "Alle Talente",      color: "#fbbf24", who: "Jeder Beitrag zählt" },
                  ].map((r) => (
                    <button key={r.label} onClick={() => setShowVolunteer(true)} className="hover-lift"
                      style={{ padding: "16px 14px", borderRadius: 16, background: `${r.color}07`, border: `1px solid ${r.color}16`, display: "flex", alignItems: "center", gap: 10, cursor: "pointer", textAlign: "left", fontFamily: "inherit", boxShadow: "none" }}>
                      <span style={{ fontSize: 24, flexShrink: 0 }}>{r.icon}</span>
                      <div>
                        <p style={{ color: "#d1d5db", fontWeight: 700, fontSize: 12.5, marginBottom: 2 }}>{r.label}</p>
                        <p style={{ color: "#4b5563", fontSize: 11 }}>{r.who}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── DONATE ── */}
        <section style={{ padding: "100px 24px", textAlign: "center" }}>
          <div style={{ maxWidth: 660, margin: "0 auto" }}>
            <div style={{ fontSize: 60, marginBottom: 20, animation: "heartbeat 2s ease-in-out infinite" }}>💙</div>
            <h2 style={{ fontSize: "clamp(30px,5.5vw,60px)", fontWeight: 900, letterSpacing: -2, color: "#fff", marginBottom: 16, lineHeight: 1.05 }}>
              Jeder Euro ist<br />ein Versprechen.
            </h2>
            <p style={{ color: "#9ca3af", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              Wir veröffentlichen jedes Jahr vollständige Finanzberichte. Du siehst genau, wohin deine Spende geht — und was sie bewirkt hat.
            </p>
            <p style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7, marginBottom: 36 }}>
              Keine Managementgehälter. Kein Marketing-Budget. Nur Bildung.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 10, marginBottom: 24 }}>
              {[
                { a: 5,  label: "1 Woche Lernmaterial" },
                { a: 10, label: "200 Schüler / Monat" },
                { a: 25, label: "Mentor-Training" },
                { a: 50, label: "Club-Ausstattung" },
              ].map(({ a, label }) => (
                <button key={a} className="cta-btn" onClick={() => setShowDonate(true)}
                  style={{ padding: "14px 10px", borderRadius: 14, background: "rgba(244,63,94,0.07)", border: "1px solid rgba(244,63,94,0.2)", cursor: "pointer", fontFamily: "inherit" }}>
                  <p style={{ color: "#fb7185", fontWeight: 800, fontSize: 20, marginBottom: 4 }}>€{a}</p>
                  <p style={{ color: "#6b7280", fontSize: 11, lineHeight: 1.35 }}>{label}</p>
                </button>
              ))}
            </div>

            <button className="cta-btn" onClick={() => setShowDonate(true)}
              style={{ padding: "16px 48px", borderRadius: 16, background: "linear-gradient(135deg,#e11d48,#f97316)", border: "none", color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 0 60px rgba(244,63,94,0.25), 0 20px 40px rgba(0,0,0,0.4)", marginBottom: 16 }}>
              ❤️ Jetzt spenden
            </button>
            <p style={{ color: "#374151", fontSize: 12 }}>
              🔒 Sicher · 🇦🇹 In Österreich registriert · 📊 Vollständige Transparenz
            </p>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ padding: "64px 24px 40px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 48, justifyContent: "space-between", marginBottom: 48 }}>
              {/* Brand */}
              <div style={{ flex: "1 1 220px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <ImpactMark size={34} />
                  <div>
                    <div style={{ color: "#fff", fontWeight: 900, fontSize: 16 }}>StudoX Impact</div>
                    <div style={{ color: "#6b7280", fontSize: 11 }}>Non-Profit Organisation</div>
                  </div>
                </div>
                <p style={{ color: "#4b5563", fontSize: 13, lineHeight: 1.65, maxWidth: 260 }}>
                  Eigenständige gemeinnützige Organisation für digitale Bildung in Europa. Gegründet mit Herz, getragen von Freiwilligen.
                </p>
              </div>

              {/* Links */}
              <div style={{ flex: "1 1 140px" }}>
                <p style={{ color: "#6b7280", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Organisation</p>
                {[["Mission", "#story"], ["Ehrenamt", "#volunteer"], ["Spenden", "#"], ["Transparenz", "#"]].map(([l, h]) => (
                  <a key={l} href={h} onClick={h === "#" ? (e) => { e.preventDefault(); setShowDonate(true); } : undefined}
                    style={{ display: "block", color: "#4b5563", fontSize: 13, textDecoration: "none", marginBottom: 9, transition: "color 0.2s" }}
                    onMouseEnter={(e) => e.target.style.color = "#9ca3af"} onMouseLeave={(e) => e.target.style.color = "#4b5563"}>{l}</a>
                ))}
              </div>

              {/* StudoX platforms */}
              <div style={{ flex: "1 1 160px" }}>
                <p style={{ color: "#6b7280", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>StudoX Plattformen</p>
                {[
                  { l: "studox.info — Infos & Demo", h: INFO_URL, c: "#8b5cf6" },
                  { l: "flow.studox.eu", h: "https://flow.studox.eu", c: "#8b5cf6" },
                  { l: "clubs.studox.eu", h: "https://clubs.studox.eu", c: "#10b981" },
                  { l: "core.studox.eu", h: "https://core.studox.eu", c: "#06b6d4" },
                ].map(({ l, h, c }) => (
                  <a key={l} href={h} target="_blank" rel="noopener"
                    style={{ display: "block", color: "#4b5563", fontSize: 12.5, textDecoration: "none", marginBottom: 8, transition: "color 0.2s" }}
                    onMouseEnter={(e) => e.target.style.color = c} onMouseLeave={(e) => e.target.style.color = "#4b5563"}>{l}</a>
                ))}
                <p style={{ color: "#2d2d3a", fontSize: 11, marginTop: 10, lineHeight: 1.4 }}>
                  StudoX Impact ist rechtlich unabhängig von der StudoX GmbH.
                </p>
              </div>
            </div>

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: 24, display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ color: "#2d2d3a", fontSize: 12 }}>© 2026 StudoX Impact · Gemeinnützig · 🇪🇺 Für Europa, von Europa.</p>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <span style={{ color: "#1f2937", fontSize: 11 }}>Kein Unternehmen. Eine Bewegung.</span>
                <span style={{ fontSize: 16, animation: "heartbeat 2s ease-in-out infinite" }}>❤️</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {showDonate    && <DonateModal    onClose={() => setShowDonate(false)} />}
      {showVolunteer && <VolunteerModal onClose={() => setShowVolunteer(false)} />}
    </div>
  );
}
