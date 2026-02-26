import { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env?.VITE_API_BASE_URL || "http://localhost:5001";

const navItems = [
  {
    to: "/home",
    label: "Home",
    shortLabel: "H",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
        <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    to: "/chat",
    label: "Chat Assistant",
    shortLabel: "C",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
        <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 001.28.53l3.58-3.579a.78.78 0 01.527-.224 41.202 41.202 0 005.183-.5c1.437-.232 2.43-1.49 2.43-2.903V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0010 2zm0 7a1 1 0 100-2 1 1 0 000 2zM6 9a1 1 0 11-2 0 1 1 0 012 0zm5 1a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    to: "/disease-detection",
    label: "Disease Detection",
    shortLabel: "D",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
        <path d="M10.75 10.818v2.614A3.13 3.13 0 0011.888 13c.482-.315.612-.648.612-.875 0-.227-.13-.56-.612-.875a3.13 3.13 0 00-1.138-.432zM8.33 8.62c.053.055.115.11.176.161V5.157a3.1 3.1 0 00-.176.205 2.585 2.585 0 00-.178 2.956c.044.07.093.14.178.302z" />
        <path fillRule="evenodd" d="M7.629 1.472a.75.75 0 01.872 0l7.5 5.25a.75.75 0 01.249.832A4.498 4.498 0 0115 9.5c0 1.373-.587 2.608-1.525 3.469l1.775 1.775a.75.75 0 01-1.06 1.06l-1.775-1.775a4.5 4.5 0 01-6.13-6.13L4.51 5.124a.75.75 0 010-1.06l3.118-2.592zm-.879 5.5A3 3 0 1010.5 11.5a3 3 0 00-3.75-4.528z" clipRule="evenodd" />
      </svg>
    ),
  },
];

function Sidebar() {
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    if (!token) return;
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch {
        // ignore
      }
    };
    fetchUser();
  }, [token]);

  const displayName = user?.username || "Profile";
  const initial = (user?.username?.charAt(0) || "U").toUpperCase();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');

        .sidebar-root {
          font-family: 'DM Sans', sans-serif;
        }

        .sidebar-glow {
          background: radial-gradient(ellipse 80% 40% at 50% 0%, rgba(52,211,153,0.06) 0%, transparent 70%);
        }

        .nav-link-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
          border-radius: 10px;
          padding: 8px 10px;
          font-size: 13.5px;
          font-weight: 450;
          letter-spacing: 0.01em;
          color: #94a3b8;
          transition: color 0.18s ease, background 0.18s ease;
          text-decoration: none;
          overflow: hidden;
        }

        .nav-link-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%) scaleY(0);
          width: 2px;
          height: 60%;
          background: linear-gradient(180deg, #34d399, #10b981);
          border-radius: 0 2px 2px 0;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .nav-link-item:hover {
          color: #e2e8f0;
          background: rgba(148, 163, 184, 0.06);
        }

        .nav-link-item:hover::before {
          transform: translateY(-50%) scaleY(0.6);
        }

        .nav-link-item.active {
          color: #6ee7b7;
          background: rgba(52, 211, 153, 0.08);
        }

        .nav-link-item.active::before {
          transform: translateY(-50%) scaleY(1);
        }

        .nav-icon-wrap {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          border: 1px solid rgba(52, 211, 153, 0.2);
          background: rgba(52, 211, 153, 0.06);
          color: #6ee7b7;
          flex-shrink: 0;
          transition: background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
        }

        .nav-link-item:hover .nav-icon-wrap {
          background: rgba(52, 211, 153, 0.12);
          border-color: rgba(52, 211, 153, 0.35);
        }

        .nav-link-item.active .nav-icon-wrap {
          background: rgba(52, 211, 153, 0.15);
          border-color: rgba(52, 211, 153, 0.45);
          box-shadow: 0 0 10px rgba(52, 211, 153, 0.15);
        }

        .badge {
          margin-left: auto;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.06em;
          padding: 1.5px 5px;
          border-radius: 4px;
          background: rgba(52, 211, 153, 0.12);
          border: 1px solid rgba(52, 211, 153, 0.25);
          color: #34d399;
        }

        .section-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #475569;
          padding: 0 10px;
          margin-bottom: 2px;
        }

        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(148,163,184,0.08) 30%, rgba(148,163,184,0.08) 70%, transparent);
          margin: 6px 4px;
        }

        .sidebar-bottom {
          margin-top: auto;
          padding: 12px 0 4px;
        }

        .user-card {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 8px 10px;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.18s ease;
        }

        .user-card:hover {
          background: rgba(148, 163, 184, 0.06);
        }

        .user-avatar {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: linear-gradient(135deg, #059669, #34d399);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          color: #fff;
          flex-shrink: 0;
        }

        .user-info-name {
          font-size: 12.5px;
          font-weight: 500;
          color: #cbd5e1;
          line-height: 1.2;
        }

        .user-info-status {
          font-size: 10.5px;
          color: #475569;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .status-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 5px #34d399;
          animation: pulse-dot 2.5s infinite;
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
      `}</style>

      <aside
        className="sidebar-root fixed left-0 top-16 bottom-0 w-52 border-r border-slate-800/80 bg-slate-950/95 backdrop-blur-xl flex flex-col"
        style={{ backdropFilter: "blur(20px)" }}
      >
        {/* Top glow */}
        <div className="sidebar-glow absolute inset-0 pointer-events-none" />

        <nav className="relative flex flex-col flex-1 px-3 py-4 gap-1">
          <p className="section-label">Navigation</p>

          <div style={{ height: 8 }} />

          {navItems.map(({ to, label, icon, badge }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `nav-link-item${isActive ? " active" : ""}`
              }
            >
              <span className="nav-icon-wrap">{icon}</span>
              <span style={{ flex: 1 }}>{label}</span>
              {badge && <span className="badge">{badge}</span>}
            </NavLink>
          ))}

          {/* Bottom user area */}
          <div className="sidebar-bottom">
            <div className="divider" />
            <Link to="/profile" className="user-card">
              <div className="user-avatar">{initial}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="user-info-name">{displayName}</div>
                <div className="user-info-status">
                  <span className="status-dot" />
                  Manage account
                </div>
              </div>
            </Link>
          </div>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;