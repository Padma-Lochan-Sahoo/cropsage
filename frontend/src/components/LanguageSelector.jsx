import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "en", labelKey: "languages.en" },
  { code: "hi", labelKey: "languages.hi" },
  { code: "or", labelKey: "languages.or" },
];

function LanguageSelector({ className = "", variant = "navbar" }) {
  const { t, i18n } = useTranslation();

  const baseClass =
    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition cursor-pointer";
  const isCompact = variant === "compact";
  const isAuth = variant === "auth";

  return (
    <div className={`relative group ${className}`}>
      <button
        type="button"
        className={`${baseClass} ${
          variant === "navbar"
            ? "bg-slate-800/60 border-slate-700 text-slate-300 hover:border-emerald-500/40 hover:text-emerald-400"
            : isAuth
            ? "bg-white/5 border-white/10 text-slate-300 hover:border-emerald-500/30 hover:text-emerald-400"
            : "bg-white/5 border-white/10 text-slate-300 hover:border-emerald-500/30 hover:text-emerald-400"
        }`}
        aria-label={t("common.language")}
      >
        <span className="text-base leading-none" aria-hidden>
          🌐
        </span>
        {!isCompact && (
          <span className="max-w-[80px] truncate">
            {LANGUAGES.find((l) => l.code === i18n.language)?.code === "en"
              ? "English"
              : t(LANGUAGES.find((l) => l.code === i18n.language)?.labelKey || "languages.en")}
          </span>
        )}
        <svg
          className="w-3.5 h-3.5 opacity-70"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className="absolute right-0 top-full mt-1 py-1 min-w-[140px] rounded-xl border border-slate-700 bg-slate-900 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => i18n.changeLanguage(lang.code)}
            className={`w-full text-left px-4 py-2.5 text-sm transition ${
              i18n.language === lang.code
                ? "bg-emerald-500/15 text-emerald-400 font-medium"
                : "text-slate-300 hover:bg-slate-800 hover:text-slate-100"
            }`}
          >
            {lang.code === "en" ? "English" : t(lang.labelKey)}
          </button>
        ))}
      </div>
    </div>
  );
}

export default LanguageSelector;
