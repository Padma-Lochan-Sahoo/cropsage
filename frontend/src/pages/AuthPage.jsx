import { useState } from "react";
import SignIn from "../components/SignIn.jsx";
import SignUp from "../components/SignUp.jsx";

function AuthPage() {
  const [mode, setMode] = useState("signIn");
  const isSignIn = mode === "signIn";

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #020d08 0%, #040f0b 40%, #051a10 70%, #020d08 100%)",
        fontFamily: "'Sora', sans-serif",
      }}
    >
      {/* Google Font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap"
        rel="stylesheet"
      />

      {/* Ambient background orbs */}
      <div
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(circle, #10b981 0%, transparent 70%)",
          filter: "blur(60px)",
          animation: "pulse 8s ease-in-out infinite",
        }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-10 pointer-events-none"
        style={{
          background: "radial-gradient(circle, #34d399 0%, transparent 70%)",
          filter: "blur(80px)",
          animation: "pulse 12s ease-in-out infinite reverse",
        }}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.2); opacity: 0.25; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .fade-up {
          animation: fadeSlideUp 0.6s ease both;
        }
        .fade-up-1 { animation-delay: 0.1s; }
        .fade-up-2 { animation-delay: 0.2s; }
        .fade-up-3 { animation-delay: 0.3s; }
        .fade-up-4 { animation-delay: 0.4s; }
        .fade-up-5 { animation-delay: 0.5s; }
        .shimmer-text {
          background: linear-gradient(90deg, #6ee7b7, #10b981, #34d399, #6ee7b7);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 4s linear infinite;
        }
        .card-glow {
          box-shadow: 0 0 0 1px rgba(16,185,129,0.15), 0 32px 64px rgba(0,0,0,0.6), 0 0 80px rgba(16,185,129,0.08);
        }
        .toggle-btn {
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .stat-card {
          background: rgba(16,185,129,0.05);
          border: 1px solid rgba(16,185,129,0.12);
          transition: all 0.3s ease;
        }
        .stat-card:hover {
          background: rgba(16,185,129,0.1);
          border-color: rgba(16,185,129,0.25);
          transform: translateY(-2px);
        }
      `}</style>

      <div className="max-w-5xl w-full grid gap-10 md:grid-cols-[1fr_0.9fr] items-center relative z-10">

        {/* LEFT — Hero section */}
        <section className="space-y-6 pr-0 md:pr-6">
          <div className="fade-up fade-up-1 flex items-center gap-2">
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{
                fontFamily: "'Space Mono', monospace",
                color: "#10b981",
              }}
            >
              CropSage
            </span>
          </div>

          <div className="fade-up fade-up-2 space-y-2">
            <h1
              className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight text-slate-50"
            >
              Farming, guided
              <br />
              <span className="shimmer-text">by intelligence.</span>
            </h1>
          </div>

          <p className="fade-up fade-up-3 text-sm text-slate-400 leading-relaxed max-w-sm">
            Diagnose crop diseases, get irrigation schedules, and optimize your
            harvest — all through a conversational AI built for agriculture.
          </p>

          {/* Feature list */}
          <div className="fade-up fade-up-4 space-y-2.5 pt-2">
            {[
              { icon: "⚡", label: "Instant disease diagnosis" },
              { icon: "💧", label: "Smart irrigation recommendations" },
              { icon: "📈", label: "Yield optimization insights" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 group">
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                  style={{
                    background: "rgba(16,185,129,0.1)",
                    border: "1px solid rgba(16,185,129,0.2)",
                  }}
                >
                  {item.icon}
                </span>
                <span className="text-sm text-slate-300">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div className="fade-up fade-up-5 grid grid-cols-3 gap-3 pt-2">
            {[
              { value: "50K+", label: "Farmers" },
              { value: "98%", label: "Accuracy" },
              { value: "24/7", label: "Support" },
            ].map((stat) => (
              <div key={stat.label} className="stat-card rounded-xl p-3 text-center cursor-default">
                <div
                  className="text-lg font-bold"
                  style={{ color: "#10b981", fontFamily: "'Space Mono', monospace" }}
                >
                  {stat.value}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* RIGHT — Auth card */}
        <section className="relative fade-up fade-up-3">
          {/* Glow halo */}
          <div
            className="absolute -inset-3 rounded-3xl pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at center, rgba(16,185,129,0.12) 0%, transparent 70%)",
              filter: "blur(20px)",
            }}
          />

          <div
            className="relative rounded-2xl p-6 card-glow"
            style={{
              background: "rgba(5, 15, 10, 0.85)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(16,185,129,0.15)",
            }}
          >
            {/* Mode toggle */}
            <div
              className="inline-flex rounded-full p-1 mb-6 w-full"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {["signIn", "signUp"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className="toggle-btn flex-1 py-2 rounded-full text-xs font-semibold"
                  style={
                    mode === m
                      ? {
                          background: "linear-gradient(135deg, #059669, #10b981)",
                          color: "#022c1a",
                          boxShadow: "0 2px 12px rgba(16,185,129,0.35)",
                        }
                      : { color: "#94a3b8" }
                  }
                >
                  {m === "signIn" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>

            {isSignIn ? <SignIn /> : <SignUp />}
          </div>
        </section>
      </div>
    </div>
  );
}

export default AuthPage;