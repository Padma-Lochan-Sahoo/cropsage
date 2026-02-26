import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        .navbar-root {
          font-family: 'DM Sans', sans-serif;
        }

        .navbar-logo-icon {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 9px;
          background: linear-gradient(135deg, rgba(52,211,153,0.15) 0%, rgba(16,185,129,0.08) 100%);
          border: 1px solid rgba(52,211,153,0.35);
          color: #34d399;
          font-weight: 700;
          font-size: 12px;
          letter-spacing: 0.03em;
          box-shadow: 0 0 16px rgba(52,211,153,0.1), inset 0 1px 0 rgba(255,255,255,0.05);
          transition: box-shadow 0.2s ease;
        }

        .navbar-logo-icon::after {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 9px;
          background: linear-gradient(135deg, rgba(52,211,153,0.2), transparent 60%);
          pointer-events: none;
        }

        .navbar-wordmark {
          font-size: 16px;
          font-weight: 650;
          letter-spacing: -0.02em;
          color: #f1f5f9;
        }

        .navbar-wordmark span {
          color: #34d399;
        }

        .nav-pill {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 3px 4px;
          border-radius: 10px;
          background: rgba(15,23,42,0.6);
          border: 1px solid rgba(148,163,184,0.08);
        }

        .nav-pill-link {
          font-size: 13px;
          font-weight: 500;
          color: #64748b;
          padding: 5px 12px;
          border-radius: 7px;
          text-decoration: none;
          transition: color 0.15s ease, background 0.15s ease;
          letter-spacing: 0.005em;
          cursor: pointer;
        }

        .nav-pill-link:hover {
          color: #cbd5e1;
          background: rgba(148,163,184,0.07);
        }

        .nav-pill-link.active {
          color: #6ee7b7;
          background: rgba(52,211,153,0.09);
        }

        .signout-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: #475569;
          background: transparent;
          border: 1px solid rgba(148,163,184,0.1);
          border-radius: 8px;
          padding: 6px 13px;
          cursor: pointer;
          transition: color 0.15s ease, border-color 0.15s ease, background 0.15s ease;
          letter-spacing: 0.01em;
        }

        .signout-btn:hover {
          color: #f87171;
          border-color: rgba(248,113,113,0.25);
          background: rgba(248,113,113,0.05);
        }

        .signout-btn svg {
          transition: transform 0.15s ease;
        }

        .signout-btn:hover svg {
          transform: translateX(2px);
        }

        .navbar-divider {
          width: 1px;
          height: 16px;
          background: rgba(148,163,184,0.12);
          margin: 0 4px;
        }

        .version-tag {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          color: #34d399;
          background: rgba(52,211,153,0.08);
          border: 1px solid rgba(52,211,153,0.18);
          border-radius: 4px;
          padding: 1px 5px;
          text-transform: uppercase;
        }
      `}</style>

      <nav className="navbar-root fixed inset-x-0 top-0 z-40 border-b border-slate-800/70"
        style={{ background: "rgba(2,8,23,0.92)", backdropFilter: "blur(20px)" }}
      >
        {/* Subtle top highlight line */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "1px",
          background: "linear-gradient(90deg, transparent 0%, rgba(52,211,153,0.3) 30%, rgba(52,211,153,0.3) 70%, transparent 100%)"
        }} />

        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between" style={{ height: 56 }}>

          {/* Left — Logo */}
          <div className="flex items-center gap-2.5">
            <div className="navbar-logo-icon">CS</div>
            <span className="navbar-wordmark">Crop<span>Sage</span></span>
          </div>

          {/* Right — Actions */}
          <div className="flex items-center gap-3">
            {/* Status badge */}
            <div className="hidden sm:flex items-center gap-1.5" style={{ fontSize: 12, color: "#475569" }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%", background: "#34d399",
                boxShadow: "0 0 6px #34d399", animation: "pulse-dot 2.5s infinite", display: "inline-block"
              }} />
              <span style={{ color: "#334155", fontSize: 12 }}>All systems normal</span>
            </div>

            <div className="navbar-divider hidden sm:block" />

            <button type="button" onClick={handleSignOut} className="signout-btn">
              Sign out
              <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd"/>
                <path fillRule="evenodd" d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-1.08a.75.75 0 10-1.004-1.115l-2.5 2.4a.75.75 0 000 1.09l2.5 2.4a.75.75 0 101.004-1.115l-1.048-1.08h9.546A.75.75 0 0019 10z" clipRule="evenodd"/>
              </svg>
            </button>
          </div>
        </div>

        <style>{`
          @keyframes pulse-dot {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
        `}</style>
      </nav>
    </>
  );
}

export default Navbar;