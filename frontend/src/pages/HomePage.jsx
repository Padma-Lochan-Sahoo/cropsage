import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext.jsx";
import LanguageSelector from "../components/LanguageSelector.jsx";

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

function FadeInSection({ children, delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { rootMargin: "-80px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.55s ease ${delay}s, transform 0.55s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ══ LANDING NAVBAR — fully responsive with hamburger ══ */
function LandingNavBar() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    if (menuOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  // Close on resize to md+
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return (
    <header
      ref={menuRef}
      className="fixed top-0 left-0 right-0 z-30 glass border-b border-emerald-500/10"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

      {/* ── Main bar ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 no-underline shrink-0">
          <span className="text-xl sm:text-2xl">🌾</span>
          <span className="font-display text-sm sm:text-base font-bold text-emerald-400 tracking-tight">CropSage</span>
        </Link>

        {/* Desktop nav (md+) */}
        <div className="hidden md:flex items-center gap-2 sm:gap-3">
          <LanguageSelector variant="auth" />
          <Link
            to="/auth?mode=signIn"
            className="btn-ghost text-xs px-4 py-2"
          >
            {t("auth.signIn")}
          </Link>
          <Link
            to="/auth?mode=signUp"
            className="btn-primary text-xs px-4 py-2"
          >
            {t("auth.signUp")}
          </Link>
        </div>

        {/* Mobile right side (below md) */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageSelector variant="auth" />

          {/* Hamburger */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            className="flex flex-col items-center justify-center w-9 h-9 rounded-lg border border-slate-700/60 bg-slate-900/60 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/40 transition-all duration-200 gap-[5px] px-2"
          >
            <span
              className="block h-[1.5px] w-5 bg-current rounded-full transition-all duration-300 origin-center"
              style={menuOpen ? { transform: "translateY(6.5px) rotate(45deg)" } : {}}
            />
            <span
              className="block h-[1.5px] w-5 bg-current rounded-full transition-all duration-200"
              style={menuOpen ? { opacity: 0, transform: "scaleX(0)" } : {}}
            />
            <span
              className="block h-[1.5px] w-5 bg-current rounded-full transition-all duration-300 origin-center"
              style={menuOpen ? { transform: "translateY(-6.5px) rotate(-45deg)" } : {}}
            />
          </button>
        </div>
      </div>

      {/* ── Mobile dropdown (below md) ── */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-slate-800/60 ${
          menuOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 py-3 flex flex-col gap-2 bg-slate-950/95" style={{ backdropFilter: "blur(20px)" }}>
          <Link
            to="/auth?mode=signIn"
            onClick={() => setMenuOpen(false)}
            className="w-full text-center py-2.5 rounded-xl text-sm font-semibold border border-slate-700 text-slate-300 hover:border-emerald-500/50 hover:text-emerald-300 hover:bg-emerald-950/20 transition-all duration-200"
          >
            {t("auth.signIn")}
          </Link>
          <Link
            to="/auth?mode=signUp"
            onClick={() => setMenuOpen(false)}
            className="w-full text-center py-2.5 rounded-xl text-sm font-semibold text-slate-950 transition-all duration-200 active:scale-95"
            style={{ background: "linear-gradient(135deg, #059669, #10b981)", boxShadow: "0 4px 20px rgba(16,185,129,0.25)" }}
          >
            {t("auth.signUp")}
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function HomePage() {
  const { token } = useAuth();
  const { t } = useTranslation();
  const crop = useTypewriter(CROPS);
  const [tab, setTab] = useState(0);
  const f = FEATURES[tab];
  const statsRef = useRef(null);
  const [statsInView, setStatsInView] = useState(false);
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setStatsInView(true); obs.disconnect(); }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  const farmers = useCounter(12400, statsInView);
  const diseases = useCounter(47, statsInView);
  const accuracy = useCounter(94, statsInView);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden font-sans">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(circle, #34d399 0%, transparent 70%)", filter: "blur(40px)" }} />
        <div className="absolute bottom-0 -left-40 w-[500px] h-[500px] rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle, #6ee7b7 0%, transparent 70%)", filter: "blur(50px)" }} />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: "radial-gradient(circle, #34d399 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      </div>

      {/* Always show landing navbar when not logged in */}
      {!token && <LandingNavBar />}

      {/* ══ HERO ══ */}
      <section
        className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-4 sm:px-6"
        style={{ paddingTop: token ? 40 : 120, paddingBottom: 60 }}
      >
        <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-emerald-500/30 bg-emerald-500/8 mb-6 sm:mb-8">
          <span className="text-lg sm:text-2xl">🌿</span>
          <span className="font-display text-sm sm:text-base font-semibold text-emerald-400 tracking-wide">
            {t("home.welcomeToCropSage")}
          </span>
          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-400 animate-pulse-slow" style={{ boxShadow: "0 0 8px #34d399" }} />
        </div>

        <h1 className="font-display font-black text-[clamp(36px,8.5vw,96px)] leading-[1.03] tracking-tight mb-4 sm:mb-5">
          {t("home.smarterFarming")}<br />
          <span className="gradient-text">{t("home.forEveryCrop")}</span>
        </h1>

        <p className="text-[clamp(16px,3vw,26px)] text-slate-500 font-light mb-4 sm:mb-5">
          {t("home.aiAssistantFor")}{" "}
          <span className="text-emerald-400 font-semibold">{crop}</span>
          <span className="inline-block w-0.5 h-[0.9em] bg-emerald-400 ml-1 align-middle animate-pulse" />
        </p>

        <p className="text-sm sm:text-base text-slate-600 max-w-lg leading-relaxed mb-8 sm:mb-10 px-2">
          {t("home.description")}
        </p>

        <div className="flex gap-3 flex-wrap justify-center mb-12 sm:mb-16">
          <Link to="/auth?mode=signUp" className="btn-primary text-sm px-6 sm:px-7 py-2.5 sm:py-3 font-display">
            {t("home.getStartedFree")}
          </Link>
          <button type="button" className="btn-ghost text-sm px-6 sm:px-7 py-2.5 sm:py-3">
            {t("home.watchDemo")}
          </button>
        </div>

        {/* Hero stats cards */}
        <div className="w-full max-w-3xl relative">
          <div className="card p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {[
              { label: "Diseases Detected Today", value: "12", sub: "+3 from yesterday", icon: "🔬", color: "#34d399" },
              { label: "Field Health Score", value: "87%", sub: "Above average ↑", icon: "🌱", color: "#a3e635" },
              { label: "Water Saved This Month", value: "2,400L", sub: "22% reduction", icon: "💧", color: "#38bdf8" },
            ].map((c, i) => (
              <div key={i} className="bg-slate-900/60 rounded-xl p-4 sm:p-5 border border-slate-800/80">
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                  <span className="text-[10px] text-slate-500 font-semibold tracking-widest uppercase leading-snug">{c.label}</span>
                  <span className="text-lg sm:text-xl">{c.icon}</span>
                </div>
                <div className="font-display text-2xl sm:text-3xl font-bold mb-1" style={{ color: c.color }}>{c.value}</div>
                <div className="text-xs text-slate-600">{c.sub}</div>
              </div>
            ))}
          </div>
          <div className="absolute -top-7 -right-7 w-28 h-28 rounded-full border border-dashed border-emerald-500/20 animate-spin-slow hidden sm:block" />
          <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full border border-dashed border-emerald-500/10 hidden sm:block"
            style={{ animation: "spin 16s linear infinite reverse" }} />
        </div>
      </section>

      {/* ══ MARQUEE ══ */}
      <div className="relative z-10 border-y border-emerald-500/8 py-3.5 bg-emerald-500/[0.02] overflow-hidden">
        <div className="flex" style={{ width: "max-content", animation: "marqueeScroll 30s linear infinite" }}>
          {[...CROPS_SUPPORTED, ...CROPS_SUPPORTED].map((item, i) => (
            <span key={i} className="px-5 sm:px-7 text-emerald-500 font-medium text-xs border-r border-emerald-500/20 whitespace-nowrap">{item}</span>
          ))}
        </div>
      </div>

      {/* ══ STATS ══ */}
      <section ref={statsRef} className="relative z-10 py-14 sm:py-20 px-4">
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {[
            { n: farmers.toLocaleString() + "+", label: "Farmers Helped", icon: "👨‍🌾" },
            { n: diseases + "+", label: "Diseases Identified", icon: "🦠" },
            { n: accuracy + "%", label: "Detection Accuracy", icon: "🎯" },
          ].map((s, i) => (
            <FadeInSection key={i} delay={i * 0.1}>
              <div className="card-hover text-center p-8 sm:p-10 rounded-2xl">
                <div className="text-3xl sm:text-4xl mb-3">{s.icon}</div>
                <div className="font-display text-[clamp(32px,5vw,56px)] font-bold text-emerald-400 leading-none mb-2">{s.n}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">{s.label}</div>
              </div>
            </FadeInSection>
          ))}
        </div>
      </section>

      <div className="h-px bg-slate-800/50 mx-auto max-w-6xl" />

      {/* ══ FEATURES ══ */}
      <section className="relative z-10 py-14 sm:py-20 px-4 max-w-6xl mx-auto">
        <FadeInSection>
          <div className="text-center mb-10 sm:mb-12">
            <p className="section-label mb-3">{t("home.features")}</p>
            <h2 className="font-display text-[clamp(26px,5vw,52px)] font-bold">{t("home.onePlatform")}</h2>
          </div>
        </FadeInSection>

        <FadeInSection delay={0.1}>
          <div className="flex gap-2 justify-center flex-wrap mb-6 sm:mb-8">
            {FEATURES.map((ft, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setTab(i)}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                  tab === i
                    ? "bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20"
                    : "bg-slate-900/60 text-slate-500 border border-slate-800 hover:text-emerald-400 hover:border-emerald-500/30"
                }`}
              >
                {ft.icon} {ft.label}
              </button>
            ))}
          </div>
        </FadeInSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <div className="card p-6 sm:p-8 lg:p-10">
            <div className="text-4xl sm:text-5xl mb-4 sm:mb-5">{f.icon}</div>
            <h3 className="font-display text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 leading-snug">{f.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-5 sm:mb-6">{f.desc}</p>
            <div className="flex flex-wrap gap-2">
              {f.tags.map((tag) => (
                <span key={tag} className="text-xs px-3 py-1 rounded-full bg-emerald-500/8 text-emerald-400 border border-emerald-500/20">{tag}</span>
              ))}
            </div>
          </div>

          <div className="card p-5 sm:p-6 bg-emerald-500/[0.02]">
            <div className="flex gap-1.5 mb-4 sm:mb-5">
              {["#ff5f57", "#ffbd2e", "#28ca41"].map((c) => (
                <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
              ))}
            </div>
            <div className="flex flex-col gap-3">
              {f.chat.map((m, i) => (
                <div key={i} className={`flex gap-2.5 items-end ${m.from === "user" ? "" : "flex-row-reverse"}`}>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: m.from === "user" ? "rgba(255,255,255,0.06)" : "#059669", color: m.from === "ai" ? "#fff" : undefined }}>
                    {m.from === "user" ? "👨‍🌾" : "AI"}
                  </div>
                  <div className={`max-w-[80%] px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl text-xs leading-relaxed ${
                    m.from === "user"
                      ? "bg-slate-800/60 border border-slate-700/60 text-slate-400 rounded-bl-sm"
                      : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 rounded-br-sm"
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 sm:mt-5 flex items-center gap-2.5 bg-slate-900/60 rounded-xl px-3 sm:px-4 py-2.5 border border-slate-800">
              <span className="text-xs text-slate-600 flex-1">Ask about your crops…</span>
              <div className="w-7 h-7 rounded-full bg-emerald-400 flex items-center justify-center text-xs text-slate-950 font-bold">↑</div>
            </div>
          </div>
        </div>
      </section>

      <div className="h-px bg-slate-800/50 mx-auto max-w-6xl" />

      {/* ══ TIPS ══ */}
      <section className="relative z-10 py-14 sm:py-20 px-4 max-w-6xl mx-auto">
        <FadeInSection>
          <div className="text-center mb-10 sm:mb-12">
            <p className="section-label mb-3">{t("home.farmerTips")}</p>
            <h2 className="font-display text-[clamp(26px,5vw,52px)] font-bold">{t("home.dailyWisdom")}</h2>
          </div>
        </FadeInSection>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {TIPS.map((tip, i) => (
            <FadeInSection key={i} delay={i * 0.07}>
              <div
                className="card p-5 sm:p-6 border-l-2 h-full transition-all duration-300 hover:-translate-y-1"
                style={{ borderLeftColor: tip.color }}
              >
                <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">{tip.icon}</div>
                <h4 className="font-semibold text-sm mb-2" style={{ color: tip.color }}>{tip.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{tip.body}</p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </section>

      <div className="h-px bg-slate-800/50 mx-auto max-w-6xl" />

      {/* ══ HOW IT WORKS ══ */}
      <section className="relative z-10 py-14 sm:py-20 px-4 max-w-4xl mx-auto">
        <FadeInSection>
          <div className="text-center mb-10 sm:mb-14">
            <p className="section-label mb-3">{t("home.howItWorks")}</p>
            <h2 className="font-display text-[clamp(26px,5vw,52px)] font-bold">{t("home.fromFieldToInsight")}</h2>
          </div>
        </FadeInSection>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 relative">
          <div className="hidden sm:block absolute top-11 left-[18%] right-[18%] h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
          {[
            { n: "01", icon: "🔐", title: "Create Account", desc: "Sign up free in 30 seconds. No credit card needed to start exploring crop intelligence." },
            { n: "02", icon: "🌾", title: "Ask or Upload", desc: "Type your crop question or drop a leaf photo for instant AI analysis and diagnosis." },
            { n: "03", icon: "📈", title: "Act & Track", desc: "Apply the advice to your fields and revisit history to track changes across seasons." },
          ].map((s, i) => (
            <FadeInSection key={i} delay={i * 0.12}>
              <div className="text-center">
                <div className="relative inline-flex mb-4 sm:mb-5">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 flex items-center justify-center text-2xl sm:text-3xl">
                    {s.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-400 flex items-center justify-center text-[10px] font-bold text-slate-950">
                    {s.n}
                  </div>
                </div>
                <h3 className="font-display text-sm sm:text-base font-bold mb-2">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </section>

      <div className="h-px bg-slate-800/50 mx-auto max-w-6xl" />

      {/* ══ TESTIMONIALS ══ */}
      <section className="relative z-10 py-14 sm:py-20 px-4 bg-emerald-500/[0.015]">
        <div className="max-w-6xl mx-auto">
          <FadeInSection>
            <div className="text-center mb-10 sm:mb-12">
              <p className="section-label mb-3">{t("home.testimonials")}</p>
              <h2 className="font-display text-[clamp(26px,5vw,52px)] font-bold">{t("home.trustedByFarmers")}</h2>
            </div>
          </FadeInSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {TESTIMONIALS.map((item, i) => (
              <FadeInSection key={i} delay={i * 0.1}>
                <div className="card p-5 sm:p-6 flex flex-col gap-4 h-full">
                  <div className="text-2xl sm:text-3xl" style={{ color: item.color }}>❝</div>
                  <p className="text-xs text-slate-500 leading-relaxed flex-1 italic">{item.q}</p>
                  <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-slate-950 text-sm shrink-0"
                      style={{ background: item.color }}>
                      {item.a}
                    </div>
                    <div>
                      <div className="text-xs font-semibold">{item.name}</div>
                      <div className="text-[10px] text-slate-500">{item.role}</div>
                    </div>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      <div className="h-px bg-slate-800/50 mx-auto max-w-6xl" />

      {/* ══ WHY FOCUSED ══ */}
      <section className="relative z-10 py-14 sm:py-20 px-4 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <FadeInSection>
            <div className="card p-6 sm:p-8 border-emerald-500/12 bg-emerald-500/[0.02] h-full">
              <div className="text-3xl sm:text-4xl mb-4 sm:mb-5">🎯</div>
              <h3 className="font-display text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Why only agriculture?</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">CropSage is intentionally trained on crops, soil, irrigation, and plant diseases only. This narrow focus keeps every answer accurate, practical, and genuinely useful for your fields.</p>
              <p className="text-sm text-slate-500 leading-relaxed">When a question falls outside agriculture, we clearly say:{" "}
                <span className="text-emerald-400 italic">"I am not trained in this topic."</span>
              </p>
            </div>
          </FadeInSection>
          <div className="flex flex-col gap-3 sm:gap-4">
            {[
              { icon: "🔒", title: "Secure & Private", desc: "Your farm data stays yours. Encrypted at rest, never shared." },
              { icon: "⚡", title: "Instant Responses", desc: "Answers in under 3 seconds, even for complex multi-crop disease queries." },
              { icon: "🌍", title: "Works Everywhere", desc: "Supports crops from tropical to temperate climates across 50+ countries." },
            ].map((item, i) => (
              <FadeInSection key={i} delay={i * 0.1}>
                <div className="card p-4 sm:p-5 flex gap-3 sm:gap-4 items-start">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-500/6 border border-emerald-500/15 flex items-center justify-center text-lg sm:text-xl shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-sm font-semibold mb-1">{item.title}</div>
                    <div className="text-xs text-slate-500 leading-relaxed">{item.desc}</div>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA BANNER ══ */}
      <section className="relative z-10 py-12 sm:py-16 px-4">
        <FadeInSection>
          <div className="max-w-2xl mx-auto text-center rounded-2xl sm:rounded-3xl border border-emerald-500/18 bg-gradient-to-br from-emerald-500/6 to-teal-500/4 p-8 sm:p-14 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-emerald-500/10 blur-2xl" />
            <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-emerald-600/8 blur-2xl" />
            <div className="text-4xl sm:text-5xl mb-4 sm:mb-5 relative z-10">🌿</div>
            <h2 className="font-display text-[clamp(22px,4vw,42px)] font-bold mb-3 sm:mb-4 relative z-10">{t("home.startGrowingSmarter")}</h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-6 sm:mb-8 max-w-md mx-auto relative z-10">{t("home.joinFarmersCta")}</p>
            <Link to="/auth?mode=signUp" className="btn-primary text-sm px-7 sm:px-9 py-3 sm:py-3.5 relative z-10 inline-flex font-display">
              {t("home.createFreeAccount")}
            </Link>
          </div>
        </FadeInSection>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="relative z-10 border-t border-slate-900 bg-[#010810] py-12 sm:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-10 sm:mb-12">
            {/* Brand — full width on mobile */}
            <div className="col-span-2 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="text-2xl">🌾</span>
                <span className="font-display text-lg font-bold text-emerald-400">CropSage</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xs">
                AI-powered agricultural intelligence for modern farmers and agronomists worldwide.
              </p>
            </div>
            {[
              { title: "Product", links: ["Crop Chat", "Disease Detection", "Irrigation Guide", "History Tracking"] },
              { title: "Resources", links: ["Documentation", "Blog & Research", "Video Tutorials", "API Access"] },
              { title: "Company", links: ["About CropSage", "Careers", "Privacy Policy", "Contact Us"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="section-label mb-3 sm:mb-4">{col.title}</h4>
                <ul className="flex flex-col gap-2 sm:gap-2.5">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="text-xs text-slate-600 hover:text-emerald-400 transition-colors duration-200">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-900/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-800 text-center sm:text-left">{t("home.copyright")}</p>
            <p className="text-xs text-slate-800 text-center sm:text-right">{t("home.focusedOnAgriculture")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}