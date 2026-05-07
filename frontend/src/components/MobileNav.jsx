import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

const items = [
  {
    to: "/chat", label: "Chat",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 001.28.53l3.58-3.579a.78.78 0 01.527-.224 41.202 41.202 0 005.183-.5c1.437-.232 2.43-1.49 2.43-2.903V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0010 2zm0 7a1 1 0 100-2 1 1 0 000 2zM6 9a1 1 0 11-2 0 1 1 0 012 0zm5 1a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    to: "/disease-detection", label: "Disease",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M7.629 1.472a.75.75 0 01.872 0l7.5 5.25a.75.75 0 01.249.832A4.498 4.498 0 0115 9.5c0 1.373-.587 2.608-1.525 3.469l1.775 1.775a.75.75 0 01-1.06 1.06l-1.775-1.775a4.5 4.5 0 01-6.13-6.13L4.51 5.124a.75.75 0 010-1.06l3.118-2.592zm-.879 5.5A3 3 0 1010.5 11.5a3 3 0 00-3.75-4.528z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    to: "/weather", label: "Weather",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M13.75 6.5a3.75 3.75 0 00-3.75 3.75.75.75 0 01-1.5 0 5.25 5.25 0 1110.5 0 .75.75 0 01-1.5 0 3.75 3.75 0 00-3.75-3.75z" clipRule="evenodd" />
        <path d="M7 8.5A4.5 4.5 0 002.5 13a.75.75 0 001.5 0A3 3 0 117 14a.75.75 0 000 1.5A4.5 4.5 0 107 8.5z" />
      </svg>
    ),
  },
  {
    to: "/fertilizer", label: "Fertilizer",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    to: "/profile", label: "Profile",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd" />
      </svg>
    ),
  },
];

function MobileNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden border-t border-slate-800/80 glass animate-slide-up">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
      <div className="grid grid-cols-5 px-1 py-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-2 gap-0.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-emerald-400 bg-emerald-950/50"
                  : "text-slate-500 hover:text-slate-300"
              }`
            }
          >
            {item.icon}
            <span className="text-[9px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default MobileNav;
