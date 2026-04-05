import { NavLink } from "react-router-dom";

const items = [
  { to: "/chat", label: "Chat", icon: "💬" },
  { to: "/disease-detection", label: "Disease", icon: "🔬" },
  { to: "/weather", label: "Weather", icon: "🌤️" },
  { to: "/fertilizer", label: "Fertilizer", icon: "📋" },
  { to: "/profile", label: "Profile", icon: "👤" },
];

function MobileNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-xl">
      <div className="grid grid-cols-5">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-2 text-[10px] ${
                isActive ? "text-emerald-300" : "text-slate-400"
              }`
            }
          >
            <span className="text-sm leading-none">{item.icon}</span>
            <span className="mt-1">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default MobileNav;

