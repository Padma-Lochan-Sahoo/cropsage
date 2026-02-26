import { useState, useEffect, useRef } from "react";

/* ─── Typewriter ─── */
const CROPS = ["Wheat 🌾", "Rice 🌿", "Corn 🌽", "Tomato 🍅", "Soybean 🫘", "Cotton 🌸"];
function useTypewriter(words) {
  const [display, setDisplay] = useState("");
  const [wi, setWi] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const cur = words[wi];
    const delay = deleting ? 50 : display.length === cur.length ? 1800 : 95;
    const t = setTimeout(() => {
      if (!deleting && display.length < cur.length) setDisplay(cur.slice(0, display.length + 1));
      else if (!deleting && display.length === cur.length) setDeleting(true);
      else if (deleting && display.length > 0) setDisplay(display.slice(0, -1));
      else { setDeleting(false); setWi((wi + 1) % words.length); }
    }, delay);
    return () => clearTimeout(t);
  });
  return display;
}

/* ─── Counter ─── */
function useCounter(end, active) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!active) return;
    let s = null, id;
    id = requestAnimationFrame(function tick(ts) {
      if (!s) s = ts;
      const p = Math.min((ts - s) / 2000, 1);
      setV(Math.floor((1 - Math.pow(1 - p, 3)) * end));
      if (p < 1) id = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(id);
  }, [end, active]);
  return v;
}

const FEATURES = [
  {
    icon: "💬", label: "Crop Chat",
    title: "Ask anything about your crops",
    desc: "From nitrogen deficiency to pest outbreaks — get expert-level answers in seconds. Strictly agriculture-focused so every answer is relevant.",
    tags: ["Nutrients", "Pests", "Diseases", "Soil pH"],
    chat: [
      { from: "user", text: "Why are my tomato leaves curling up?" },
      { from: "ai", text: "Leaf curl in tomatoes usually signals heat stress or broad mite infestation. Check leaf undersides for mites and ensure night temps are below 24°C." },
    ],
  },
  {
    icon: "🔬", label: "Disease Detection",
    title: "Identify diseases from a photo",
    desc: "Upload any leaf image. Our vision model spots early signs of blight, rust, mildew and 47+ other diseases before they spread.",
    tags: ["Blight", "Rust", "Mildew", "Mosaic"],
    chat: [
      { from: "user", text: "📷 Uploaded: corn_leaf_sample.jpg" },
      { from: "ai", text: "Detected: Northern Leaf Blight (74% confidence). Apply mancozeb fungicide within 48 hrs and remove infected lower leaves." },
    ],
  },
  {
    icon: "💧", label: "Irrigation",
    title: "Smart water scheduling",
    desc: "Crop-specific irrigation plans based on soil type, growth stage, and climate. Reduce water use by up to 30% without hurting yield.",
    tags: ["Drip", "Scheduling", "Water saving", "Soil moisture"],
    chat: [
      { from: "user", text: "How often should I water paddy in tillering stage?" },
      { from: "ai", text: "Maintain 2–5 cm standing water during active tillering. Switch to intermittent wetting once maximum tiller count is reached." },
    ],
  },
  {
    icon: "📋", label: "History",
    title: "Track every season",
    desc: "All conversations stored securely. Compare advice across seasons, spot recurring problems, and build a living knowledge base for your farm.",
    tags: ["Season logs", "Trend view", "Export", "Search"],
    chat: [
      { from: "user", text: "Show me last month's wheat queries" },
      { from: "ai", text: "Found 18 queries in January. Top issues: iron chlorosis (6x), irrigation timing (5x). Trend: iron deficiency rising." },
    ],
  },
];

const TIPS = [
  { icon: "🌱", color: "#34d399", title: "Test Soil pH", body: "Most crops prefer 6.0–7.0. Test every season — even small shifts affect nutrient uptake dramatically." },
  { icon: "💧", color: "#38bdf8", title: "Morning Irrigation", body: "Watering at dawn cuts evaporation by up to 30% vs afternoon watering." },
  { icon: "🌿", color: "#a3e635", title: "Scout Early", body: "Walk fields every 5–7 days. Catching disease in the first 10% of canopy keeps treatment costs low." },
  { icon: "☀️", color: "#fbbf24", title: "Rotate Crops", body: "Rotating families annually breaks pest cycles and naturally replenishes nitrogen in soil." },
  { icon: "🪲", color: "#f87171", title: "Integrated Pest Mgmt", body: "Combine biological controls + targeted sprays. Reduces chemical use 40–60% with equal protection." },
  { icon: "🌾", color: "#c084fc", title: "Harvest Timing", body: "Grain moisture at harvest matters. Wheat at 14% moisture stores well; below 12% risks losses." },
];

const TESTIMONIALS = [
  { q: "CropSage caught leaf blight two weeks before I could see it visually. Saved my entire tomato block.", name: "Ramesh Patil", role: "Farmer · Maharashtra", a: "R", color: "#34d399" },
  { q: "The irrigation guidance cut our water bill by 22% this season without any drop in yield.", name: "Anita Sharma", role: "Agronomist · Punjab", a: "A", color: "#38bdf8" },
  { q: "Finally an AI that stays on topic. Every answer is useful because it only knows farming.", name: "David Nkosi", role: "Farm Manager · Kenya", a: "D", color: "#fbbf24" },
  { q: "I use the history feature to compare my kharif vs rabi seasons. Incredible for planning.", name: "Priya Menon", role: "Farmer · Tamil Nadu", a: "P", color: "#c084fc" },
];

const CROPS_SUPPORTED = [
  "🌾 Wheat", "🌿 Rice", "🌽 Corn", "🍅 Tomato", "🫘 Soybean", "🌸 Cotton",
  "🥔 Potato", "🧅 Onion", "🌶️ Chili", "🍇 Grape", "☕ Coffee", "🍌 Banana",
  "🥭 Mango", "🍊 Citrus", "🫑 Bell Pepper", "🥦 Broccoli",
];

function Blobs() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
      <svg style={{ position: "absolute", top: "-10%", right: "-5%", width: "55vw", opacity: 0.07 }} viewBox="0 0 600 600">
        <defs><radialGradient id="b1" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#34d399"/><stop offset="100%" stopColor="transparent"/></radialGradient></defs>
        <ellipse cx="300" cy="300" rx="300" ry="260" fill="url(#b1)"/>
      </svg>
      <svg style={{ position: "absolute", bottom: "10%", left: "-8%", width: "45vw", opacity: 0.05 }} viewBox="0 0 500 500">
        <defs><radialGradient id="b2" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#6ee7b7"/><stop offset="100%" stopColor="transparent"/></radialGradient></defs>
        <circle cx="250" cy="250" r="250" fill="url(#b2)"/>
      </svg>
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.025 }}>
        <defs>
          <pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#34d399"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)"/>
      </svg>
    </div>
  );
}

function Marquee({ items }) {
  const doubled = [...items, ...items];
  return (
    <div style={{ overflow: "hidden" }}>
      <div style={{ display: "flex", animation: "marquee 28s linear infinite", width: "max-content" }}>
        {doubled.map((item, i) => (
          <span key={i} style={{ padding: "0 28px", fontSize: 13, color: "#6ee7b7", fontWeight: 500, borderRight: "1px solid rgba(52,211,153,0.2)", whiteSpace: "nowrap" }}>{item}</span>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const crop = useTypewriter(CROPS);
  const [tab, setTab] = useState(0);
  const [statsOn, setStatsOn] = useState(false);
  const statsRef = useRef();
  const farmers = useCounter(12000, statsOn);
  const diseases = useCounter(47, statsOn);
  const accuracy = useCounter(94, statsOn);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsOn(true); }, { threshold: 0.3 });
    if (statsRef.current) io.observe(statsRef.current);
    return () => io.disconnect();
  }, []);

  const f = FEATURES[tab];

  return (
    <div style={{ background: "#030712", color: "#f1f5f9", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", overflowX: "hidden", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        .serif { font-family: 'Playfair Display', serif; }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes spinSlow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulseGlow { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.15)} }
        @keyframes shimmer { 0%{background-position:-300% center} 100%{background-position:300% center} }
        @keyframes blink { 50%{opacity:0} }
        @keyframes badgePulse {
          0%,100%{ box-shadow: 0 0 0 0 rgba(52,211,153,0.5), 0 0 30px rgba(52,211,153,0.15); }
          50%{ box-shadow: 0 0 0 10px rgba(52,211,153,0), 0 0 50px rgba(52,211,153,0.25); }
        }
        .cta-btn {
          background: linear-gradient(135deg, #34d399, #059669);
          color: #030712; font-weight: 700; border: none;
          border-radius: 14px; padding: 14px 32px; font-size: 14px;
          cursor: pointer; transition: all 0.3s ease; letter-spacing: 0.02em;
          font-family: 'DM Sans', sans-serif;
        }
        .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(52,211,153,0.35); }
        .ghost-btn {
          background: transparent; color: #94a3b8; font-weight: 500;
          border: 1px solid rgba(148,163,184,0.2);
          border-radius: 14px; padding: 14px 28px; font-size: 14px;
          cursor: pointer; transition: all 0.3s ease;
          font-family: 'DM Sans', sans-serif;
        }
        .ghost-btn:hover { border-color: rgba(52,211,153,0.4); color: #34d399; }
        .card { border-radius: 20px; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.025); backdrop-filter: blur(12px); transition: all 0.3s; }
        .card:hover { border-color: rgba(52,211,153,0.2); }
        .shimmer-green {
          background: linear-gradient(90deg,#34d399 0%,#6ee7b7 25%,#a7f3d0 50%,#34d399 75%,#059669 100%);
          background-size: 300% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          animation: shimmer 5s linear infinite;
        }
        .welcome-badge {
          display: inline-flex; align-items: center; gap: 14px;
          background: linear-gradient(135deg, rgba(52,211,153,0.12), rgba(5,150,105,0.08));
          border: 1.5px solid rgba(52,211,153,0.35);
          border-radius: 100px;
          padding: 16px 40px;
          animation: badgePulse 3s ease-in-out infinite;
        }
        .tab-btn {
          padding: 9px 20px; border-radius: 10px;
          font-size: 13px; font-weight: 500; cursor: pointer;
          transition: all 0.25s; border: 1px solid transparent;
          font-family: 'DM Sans', sans-serif;
        }
        .tab-active { background: #34d399; color: #030712; font-weight: 700; }
        .tab-inactive { background: rgba(255,255,255,0.04); color: #64748b; border-color: rgba(255,255,255,0.08); }
        .tab-inactive:hover { color: #34d399; border-color: rgba(52,211,153,0.3); }
        .cursor-blink { display:inline-block; width:3px; height:0.9em; background:#34d399; margin-left:3px; vertical-align:middle; animation:blink 1s step-end infinite; border-radius:1px; }
        .tip-card { border-radius: 18px; padding: 22px; border: 1px solid rgba(255,255,255,0.05); background: rgba(255,255,255,0.02); transition: all 0.3s; }
        .tip-card:hover { transform: translateY(-4px); background: rgba(255,255,255,0.04); }
        .section-label { font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #34d399; }
        .divider { border: none; border-top: 1px solid rgba(255,255,255,0.05); margin: 0; }
        .stat-card { border-radius: 20px; border: 1px solid rgba(52,211,153,0.12); background: linear-gradient(135deg, rgba(52,211,153,0.05), rgba(5,150,105,0.03)); padding: 40px 24px; text-align: center; transition: all 0.3s; }
        .stat-card:hover { border-color: rgba(52,211,153,0.3); transform: translateY(-4px); box-shadow: 0 20px 40px rgba(52,211,153,0.08); }
        * { box-sizing: border-box; }
      `}</style>

      <Blobs />

      {/* ══ HERO ══ */}
      <section style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px 60px", textAlign: "center" }}>

        {/* BIG Welcome Badge */}
        <div style={{ animation: "fadeUp 0.5s ease both", marginBottom: 36 }}>
          <div className="welcome-badge">
            <span style={{ fontSize: 32 }}>🌿</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: "#34d399", letterSpacing: "0.04em", fontFamily: "'DM Sans', sans-serif" }}>Welcome to CropSage</span>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#34d399", animation: "pulseGlow 2s ease-in-out infinite", flexShrink: 0 }} />
          </div>
        </div>

        {/* Headline */}
        <div style={{ animation: "fadeUp 0.6s 0.1s ease both", opacity: 0, animationFillMode: "forwards" }}>
          <h1 className="serif" style={{ fontSize: "clamp(44px, 8.5vw, 96px)", lineHeight: 1.03, marginBottom: 16, fontWeight: 900, letterSpacing: "-0.02em" }}>
            Smarter farming<br/>
            <span className="shimmer-green">for every crop</span>
          </h1>
        </div>

        {/* Typewriter */}
        <div style={{ animation: "fadeUp 0.6s 0.2s ease both", opacity: 0, animationFillMode: "forwards", marginBottom: 24 }}>
          <p style={{ fontSize: "clamp(18px, 3vw, 28px)", color: "#475569", fontWeight: 300 }}>
            AI assistant for{" "}
            <span style={{ color: "#34d399", fontWeight: 600 }}>{crop}</span>
            <span className="cursor-blink" />
          </p>
        </div>

        {/* Description */}
        <div style={{ animation: "fadeUp 0.6s 0.3s ease both", opacity: 0, animationFillMode: "forwards", marginBottom: 40 }}>
          <p style={{ fontSize: 16, color: "#3d4f63", maxWidth: 540, lineHeight: 1.85, margin: "0 auto" }}>
            Disease detection, irrigation planning, crop health Q&A — all in one place. Purpose-built for farmers and agronomists who need accurate, actionable answers.
          </p>
        </div>

        {/* CTAs */}
        <div style={{ animation: "fadeUp 0.6s 0.4s ease both", opacity: 0, animationFillMode: "forwards", display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginBottom: 64 }}>
          <button className="cta-btn">Get Started Free →</button>
          <button className="ghost-btn">▶ Watch Demo</button>
        </div>

        {/* Hero dashboard cards */}
        <div style={{ animation: "fadeUp 0.8s 0.5s ease both", opacity: 0, animationFillMode: "forwards", width: "100%", maxWidth: 860, position: "relative" }}>
          <div className="card" style={{ padding: "24px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {[
              { label: "Diseases Detected Today", value: "12", sub: "+3 from yesterday", icon: "🔬", color: "#34d399", delay: "0s" },
              { label: "Field Health Score", value: "87%", sub: "Above average ↑", icon: "🌱", color: "#a3e635", delay: "0.3s" },
              { label: "Water Saved This Month", value: "2,400L", sub: "22% reduction", icon: "💧", color: "#38bdf8", delay: "0.6s" },
            ].map((c, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: "20px", border: "1px solid rgba(255,255,255,0.06)", animation: `floatY ${3.5 + i * 0.5}s ease-in-out ${c.delay} infinite` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <span style={{ fontSize: 10, color: "#475569", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", lineHeight: 1.4 }}>{c.label}</span>
                  <span style={{ fontSize: 22 }}>{c.icon}</span>
                </div>
                <div style={{ fontSize: 34, fontWeight: 800, color: c.color, marginBottom: 4, fontFamily: "'Playfair Display', serif" }}>{c.value}</div>
                <div style={{ fontSize: 12, color: "#334155" }}>{c.sub}</div>
              </div>
            ))}
          </div>
          {/* Decorative spinning rings */}
          <div style={{ position: "absolute", top: -28, right: -28, width: 110, height: 110, borderRadius: "50%", border: "1px dashed rgba(52,211,153,0.2)", animation: "spinSlow 22s linear infinite" }} />
          <div style={{ position: "absolute", top: -14, right: -14, width: 80, height: 80, borderRadius: "50%", border: "1px dashed rgba(52,211,153,0.1)", animation: "spinSlow 16s linear infinite reverse" }} />
        </div>
      </section>

      {/* ══ MARQUEE ══ */}
      <div style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(52,211,153,0.08)", borderBottom: "1px solid rgba(52,211,153,0.08)", padding: "14px 0", background: "rgba(52,211,153,0.025)" }}>
        <Marquee items={CROPS_SUPPORTED} />
      </div>

      {/* ══ STATS ══ */}
      <section ref={statsRef} style={{ position: "relative", zIndex: 1, padding: "80px 24px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
          {[
            { n: farmers.toLocaleString() + "+", label: "Farmers Helped", icon: "👨‍🌾" },
            { n: diseases + "+", label: "Diseases Identified", icon: "🦠" },
            { n: accuracy + "%", label: "Detection Accuracy", icon: "🎯" },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div style={{ fontSize: 36, marginBottom: 12 }}>{s.icon}</div>
              <div className="serif" style={{ fontSize: "clamp(36px,5vw,58px)", color: "#34d399", fontWeight: 700, lineHeight: 1, marginBottom: 8 }}>{s.n}</div>
              <div style={{ fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: "0.12em" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <hr className="divider" />

      {/* ══ FEATURES ══ */}
      <section style={{ position: "relative", zIndex: 1, padding: "80px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p className="section-label" style={{ marginBottom: 14 }}>Features</p>
          <h2 className="serif" style={{ fontSize: "clamp(30px,5vw,52px)", fontWeight: 700 }}>One platform. Every need.</h2>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 36 }}>
          {FEATURES.map((ft, i) => (
            <button key={i} className={`tab-btn ${tab === i ? "tab-active" : "tab-inactive"}`} onClick={() => setTab(i)}>
              {ft.icon} {ft.label}
            </button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div className="card" style={{ padding: "36px 40px" }}>
            <div style={{ fontSize: 48, marginBottom: 20 }}>{f.icon}</div>
            <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 14, lineHeight: 1.3 }}>{f.title}</h3>
            <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.9, marginBottom: 24 }}>{f.desc}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {f.tags.map(t => (
                <span key={t} style={{ fontSize: 12, padding: "5px 14px", borderRadius: 100, background: "rgba(52,211,153,0.08)", color: "#34d399", border: "1px solid rgba(52,211,153,0.2)" }}>{t}</span>
              ))}
            </div>
          </div>
          <div className="card" style={{ padding: "28px", background: "rgba(5,150,105,0.03)" }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
              {["#ff5f57","#ffbd2e","#28ca41"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {f.chat.map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: m.from === "user" ? "flex-start" : "flex-end", gap: 10, alignItems: "flex-end" }}>
                  {m.from === "user" && <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>👨‍🌾</div>}
                  <div style={{ maxWidth: "78%", padding: "12px 16px", borderRadius: m.from === "user" ? "18px 18px 18px 4px" : "18px 18px 4px 18px", background: m.from === "user" ? "rgba(255,255,255,0.06)" : "rgba(52,211,153,0.1)", border: m.from === "user" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(52,211,153,0.2)", fontSize: 13, lineHeight: 1.6, color: m.from === "user" ? "#94a3b8" : "#a7f3d0" }}>{m.text}</div>
                  {m.from === "ai" && <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#059669", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0, color: "#fff" }}>AI</div>}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "10px 14px", border: "1px solid rgba(255,255,255,0.07)" }}>
              <span style={{ fontSize: 12, color: "#334155", flex: 1 }}>Ask about your crops…</span>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#34d399", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#030712", fontWeight: 800 }}>↑</div>
            </div>
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* ══ TIPS ══ */}
      <section style={{ position: "relative", zIndex: 1, padding: "80px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p className="section-label" style={{ marginBottom: 14 }}>Farmer Tips</p>
          <h2 className="serif" style={{ fontSize: "clamp(30px,5vw,52px)", fontWeight: 700 }}>Daily wisdom from the field</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 18 }}>
          {TIPS.map((tip, i) => (
            <div key={i} className="tip-card" style={{ borderLeft: `3px solid ${tip.color}` }}>
              <div style={{ fontSize: 30, marginBottom: 12 }}>{tip.icon}</div>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: tip.color, marginBottom: 8 }}>{tip.title}</h4>
              <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.85 }}>{tip.body}</p>
            </div>
          ))}
        </div>
      </section>

      <hr className="divider" />

      {/* ══ HOW IT WORKS ══ */}
      <section style={{ position: "relative", zIndex: 1, padding: "80px 24px", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p className="section-label" style={{ marginBottom: 14 }}>How It Works</p>
          <h2 className="serif" style={{ fontSize: "clamp(30px,5vw,52px)", fontWeight: 700 }}>From field to insight in 3 steps</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 32, position: "relative" }}>
          <div style={{ position: "absolute", top: 44, left: "18%", right: "18%", height: 1, background: "linear-gradient(90deg,transparent,rgba(52,211,153,0.3),transparent)" }} />
          {[
            { n: "01", icon: "🔐", title: "Create Account", desc: "Sign up free in 30 seconds. No credit card needed to start exploring crop intelligence." },
            { n: "02", icon: "🌾", title: "Ask or Upload", desc: "Type your crop question or drop a leaf photo for instant AI analysis and diagnosis." },
            { n: "03", icon: "📈", title: "Act & Track", desc: "Apply the advice to your fields and revisit history to track changes across seasons." },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ position: "relative", display: "inline-flex", marginBottom: 20 }}>
                <div style={{ width: 88, height: 88, borderRadius: 24, background: "rgba(52,211,153,0.05)", border: "1px solid rgba(52,211,153,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>{s.icon}</div>
                <div style={{ position: "absolute", top: -8, right: -8, width: 26, height: 26, borderRadius: "50%", background: "#34d399", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#030712" }}>{s.n}</div>
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>{s.title}</h3>
              <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.85 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <hr className="divider" />

      {/* ══ TESTIMONIALS ══ */}
      <section style={{ position: "relative", zIndex: 1, padding: "80px 24px", background: "rgba(52,211,153,0.015)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p className="section-label" style={{ marginBottom: 14 }}>Testimonials</p>
            <h2 className="serif" style={{ fontSize: "clamp(30px,5vw,52px)", fontWeight: 700 }}>Trusted by farmers worldwide</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px,1fr))", gap: 20 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="card" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ fontSize: 28, color: t.color }}>❝</div>
                <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.9, flex: 1, fontStyle: "italic" }}>{t.q}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: t.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#030712", fontSize: 15 }}>{t.a}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: "#475569" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* ══ WHY FOCUSED ══ */}
      <section style={{ position: "relative", zIndex: 1, padding: "80px 24px", maxWidth: 960, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div className="card" style={{ padding: "40px", background: "rgba(52,211,153,0.03)", borderColor: "rgba(52,211,153,0.12)" }}>
            <div style={{ fontSize: 40, marginBottom: 20 }}>🎯</div>
            <h3 className="serif" style={{ fontSize: 26, marginBottom: 14, fontWeight: 700 }}>Why only agriculture?</h3>
            <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.9 }}>CropSage is intentionally trained on crops, soil, irrigation, and plant diseases only. This narrow focus keeps every answer accurate, practical, and genuinely useful for your fields.</p>
            <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.9, marginTop: 14 }}>When a question falls outside agriculture, we clearly say: <span style={{ color: "#34d399", fontStyle: "italic" }}>"I am not trained in this topic."</span></p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { icon: "🔒", color: "#34d399", title: "Secure & Private", desc: "Your farm data stays yours. Encrypted at rest, never shared." },
              { icon: "⚡", color: "#fbbf24", title: "Instant Responses", desc: "Answers in under 3 seconds, even for complex multi-crop disease queries." },
              { icon: "🌍", color: "#38bdf8", title: "Works Everywhere", desc: "Supports crops from tropical to temperate climates across 50+ countries." },
            ].map((item, i) => (
              <div key={i} className="card" style={{ padding: "20px 24px", display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `rgba(52,211,153,0.07)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{item.icon}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.7 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA BANNER ══ */}
      <section style={{ position: "relative", zIndex: 1, padding: "60px 24px 80px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center", borderRadius: 28, border: "1px solid rgba(52,211,153,0.18)", background: "linear-gradient(135deg, rgba(52,211,153,0.06) 0%, rgba(5,150,105,0.04) 100%)", padding: "56px 40px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(52,211,153,0.1) 0%, transparent 70%)" }} />
          <div style={{ position: "absolute", bottom: -30, left: -30, width: 150, height: 150, borderRadius: "50%", background: "radial-gradient(circle, rgba(5,150,105,0.08) 0%, transparent 70%)" }} />
          <div style={{ fontSize: 52, marginBottom: 20, position: "relative", zIndex: 1 }}>🌿</div>
          <h2 className="serif" style={{ fontSize: "clamp(26px,4vw,44px)", fontWeight: 700, marginBottom: 16, position: "relative", zIndex: 1 }}>Start growing smarter today</h2>
          <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.8, marginBottom: 32, maxWidth: 420, margin: "0 auto 32px", position: "relative", zIndex: 1 }}>Join 12,000+ farmers using CropSage to protect their harvests. Free to start, no credit card required.</p>
          <button className="cta-btn" style={{ fontSize: 16, padding: "16px 44px", position: "relative", zIndex: 1 }}>Create Free Account →</button>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.05)", background: "#010810", padding: "60px 24px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr", gap: 40, marginBottom: 48 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 28 }}>🌾</span>
                <span className="serif" style={{ fontSize: 24, color: "#34d399", fontWeight: 700 }}>CropSage</span>
              </div>
              <p style={{ fontSize: 13, color: "#334155", lineHeight: 1.85, maxWidth: 240, marginBottom: 20 }}>AI-powered agricultural intelligence for modern farmers and agronomists worldwide.</p>
              <div style={{ display: "flex", gap: 10 }}>
                {["𝕏", "in", "gh"].map((s, i) => (
                  <a key={i} href="#" style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#475569", textDecoration: "none", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.target.style.borderColor = "rgba(52,211,153,0.4)"; e.target.style.color = "#34d399"; }}
                    onMouseLeave={e => { e.target.style.borderColor = "rgba(255,255,255,0.07)"; e.target.style.color = "#475569"; }}
                  >{s}</a>
                ))}
              </div>
            </div>
            {[
              { title: "Product", links: ["Crop Chat", "Disease Detection", "Irrigation Guide", "History Tracking"] },
              { title: "Resources", links: ["Documentation", "Blog & Research", "Video Tutorials", "API Access"] },
              { title: "Company", links: ["About CropSage", "Careers", "Privacy Policy", "Contact Us"] },
            ].map(col => (
              <div key={col.title}>
                <h4 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#475569", marginBottom: 18 }}>{col.title}</h4>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 11 }}>
                  {col.links.map(l => (
                    <li key={l}><a href="#" style={{ fontSize: 13, color: "#334155", textDecoration: "none", transition: "color 0.2s" }}
                      onMouseEnter={e => e.target.style.color = "#34d399"}
                      onMouseLeave={e => e.target.style.color = "#334155"}
                    >{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <p style={{ fontSize: 12, color: "#1e293b" }}>© 2025 CropSage · Built with 💚 for farmers everywhere</p>
            <p style={{ fontSize: 12, color: "#1e293b" }}>Focused on agriculture. Always.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}