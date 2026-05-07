import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTranslation } from "react-i18next";
import LanguageSelector from "./LanguageSelector.jsx";

function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleSignOut = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // Close menu on route change / resize to lg
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <nav className="fixed inset-x-0 top-0 z-40 border-b border-slate-800/70 glass animate-fade-in" ref={menuRef}>
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

      {/* ── Main bar ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">

        {/* Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs tracking-wide">
            CS
          </div>
          <span className="font-display text-[15px] font-semibold tracking-tight text-slate-100">
            Crop<span className="text-emerald-400">Sage</span>
          </span>
        </div>

        {/* ── Desktop right-side (lg+) ── */}
        <div className="hidden lg:flex items-center gap-3">
          <LanguageSelector variant="navbar" />

          <div className="flex items-center gap-1.5">
            <span className="status-dot" />
            <span className="text-xs text-slate-600 whitespace-nowrap">
              {t("common.allSystemsNormal")}
            </span>
          </div>

          <div className="w-px h-4 bg-slate-800" />

          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-500 text-xs font-medium transition-all duration-200 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-950/20 active:scale-95"
          >
            {t("common.signOut")}
            <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-1.08a.75.75 0 10-1.004-1.115l-2.5 2.4a.75.75 0 000 1.09l2.5 2.4a.75.75 0 101.004-1.115l-1.048-1.08h9.546A.75.75 0 0019 10z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* ── Mobile / Tablet right-side (below lg) ── */}
        <div className="flex lg:hidden items-center gap-2">
          {/* Language selector always visible */}
          <LanguageSelector variant="navbar" />

          {/* Hamburger button */}
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            className="flex flex-col items-center justify-center w-9 h-9 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/40 transition-all duration-200 active:scale-95 gap-[5px] px-2"
          >
            {/* Animated hamburger → X */}
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

      {/* ── Mobile Dropdown Menu ── */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-slate-800/60 ${
          menuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 py-3 space-y-1 bg-slate-950/95" style={{ backdropFilter: "blur(20px)" }}>

          {/* Status row */}
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg">
            <span className="status-dot" />
            <span className="text-xs text-slate-500">
              {t("common.allSystemsNormal")}
            </span>
          </div>

          <div className="h-px bg-slate-800/80 mx-1" />

          {/* Sign out */}
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-all duration-200 active:scale-95"
          >
            <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor" className="shrink-0">
              <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-1.08a.75.75 0 10-1.004-1.115l-2.5 2.4a.75.75 0 000 1.09l2.5 2.4a.75.75 0 101.004-1.115l-1.048-1.08h9.546A.75.75 0 0019 10z" clipRule="evenodd" />
            </svg>
            {t("common.signOut")}
          </button>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;