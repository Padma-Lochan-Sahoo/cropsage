import { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext.jsx";

const API_BASE = import.meta.env?.VITE_API_BASE_URL || "http://localhost:5001";

const navItems = [
  {
    to: "/chat", labelKey: "nav.chatAssistant",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 001.28.53l3.58-3.579a.78.78 0 01.527-.224 41.202 41.202 0 005.183-.5c1.437-.232 2.43-1.49 2.43-2.903V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0010 2zm0 7a1 1 0 100-2 1 1 0 000 2zM6 9a1 1 0 11-2 0 1 1 0 012 0zm5 1a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    to: "/disease-detection", labelKey: "nav.diseaseDetection",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M10.75 10.818v2.614A3.13 3.13 0 0011.888 13c.482-.315.612-.648.612-.875 0-.227-.13-.56-.612-.875a3.13 3.13 0 00-1.138-.432zM8.33 8.62c.053.055.115.11.176.161V5.157a3.1 3.1 0 00-.176.205 2.585 2.585 0 00-.178 2.956c.044.07.093.14.178.302z" />
        <path fillRule="evenodd" d="M7.629 1.472a.75.75 0 01.872 0l7.5 5.25a.75.75 0 01.249.832A4.498 4.498 0 0115 9.5c0 1.373-.587 2.608-1.525 3.469l1.775 1.775a.75.75 0 01-1.06 1.06l-1.775-1.775a4.5 4.5 0 01-6.13-6.13L4.51 5.124a.75.75 0 010-1.06l3.118-2.592zm-.879 5.5A3 3 0 1010.5 11.5a3 3 0 00-3.75-4.528z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    to: "/weather", labelKey: "nav.weatherAdvisory",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M13.75 6.5a3.75 3.75 0 00-3.75 3.75.75.75 0 01-1.5 0 5.25 5.25 0 1110.5 0 .75.75 0 01-1.5 0 3.75 3.75 0 00-3.75-3.75z" clipRule="evenodd" />
        <path d="M7 8.5A4.5 4.5 0 002.5 13a.75.75 0 001.5 0A3 3 0 117 14a.75.75 0 000 1.5A4.5 4.5 0 107 8.5z" />
      </svg>
    ),
  },
  {
    to: "/fertilizer", labelKey: "nav.fertilizerRecommendation",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
      </svg>
    ),
  },
];

function Sidebar() {
  const [user, setUser] = useState(null);
  const { token } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    if (!token) return;
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch { /* ignore */ }
    };
    fetchUser();
  }, [token]);

  const displayName = user?.username || t("nav.profile");
  const initial = (user?.username?.charAt(0) || "U").toUpperCase();

  return (
    <aside
      className="hidden md:flex fixed left-0 top-14 bottom-0 w-52 border-r border-slate-800/80 bg-slate-950/95 flex-col z-30 animate-slide-in-left"
      style={{ backdropFilter: "blur(20px)" }}
    >
      <div className="absolute inset-0 pointer-events-none opacity-60"
        style={{ background: "radial-gradient(ellipse 80% 40% at 50% 0%, rgba(52,211,153,0.05) 0%, transparent 70%)" }} />

      <nav className="relative flex flex-col flex-1 px-2.5 py-4 gap-0.5">
        <p className="section-label px-2.5 mb-3">{t("nav.navigation")}</p>

        {navItems.map(({ to, labelKey, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <span className="flex items-center justify-center w-7 h-7 rounded-lg border border-emerald-500/20 bg-emerald-500/6 shrink-0 transition-all duration-200">
              {icon}
            </span>
            <span className="flex-1 text-[13px]">{t(labelKey)}</span>
          </NavLink>
        ))}

        <div className="mt-auto pt-3">
          <div className="h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent mb-3" />
          <Link to="/profile" className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-slate-800/50 transition-colors duration-200 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-slate-300 truncate">{displayName}</div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="status-dot scale-75" />
                <span className="text-[10px] text-slate-500">{t("nav.manageAccount")}</span>
              </div>
            </div>
          </Link>
        </div>
      </nav>
    </aside>
  );
}

export default Sidebar;
