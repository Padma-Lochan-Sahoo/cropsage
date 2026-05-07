import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import SignIn from "../components/SignIn.jsx";
import SignUp from "../components/SignUp.jsx";
import { useTranslation } from "react-i18next";
import LanguageSelector from "../components/LanguageSelector.jsx";

function AuthPage() {
  const [searchParams] = useSearchParams();
  const urlMode = searchParams.get("mode");
  const [mode, setMode] = useState(
    urlMode === "signUp" || urlMode === "signIn" ? urlMode : "signIn"
  );
  const isSignIn = mode === "signIn";
  const { t } = useTranslation();

  useEffect(() => {
    const m = searchParams.get("mode");
    if (m === "signUp" || m === "signIn") setMode(m);
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden bg-slate-950">
      {/* Background orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-15 pointer-events-none animate-float"
        style={{ background: "radial-gradient(circle, #10b981 0%, transparent 70%)", filter: "blur(70px)" }} />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, #34d399 0%, transparent 70%)", filter: "blur(80px)", animation: "float 12s ease-in-out infinite reverse" }} />
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      {/* Language selector */}
      <div className="absolute top-4 right-4">
        <LanguageSelector variant="auth" />
      </div>

      {/* Logo */}
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs">CS</div>
        <span className="font-display text-sm font-semibold text-slate-200">Crop<span className="text-emerald-400">Sage</span></span>
      </div>

      <div className="w-full max-w-md relative z-10 animate-in">
        {/* Card */}
        <div className="card p-8">
          {/* Tab switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/80 border border-slate-800 mb-6">
            {["signIn", "signUp"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 active:scale-95 ${
                  mode === m
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {m === "signIn" ? t("auth.signIn") : t("auth.signUp")}
              </button>
            ))}
          </div>

          {isSignIn ? <SignIn key="signin" /> : <SignUp key="signup" />}

          {/* Switch link */}
          <p className="text-center text-xs text-slate-500 mt-6">
            {isSignIn ? t("auth.noAccount") : t("auth.haveAccount")}{" "}
            <button
              type="button"
              onClick={() => setMode(isSignIn ? "signUp" : "signIn")}
              className="text-emerald-500 hover:text-emerald-300 font-medium transition-colors"
            >
              {isSignIn ? t("auth.signUp") : t("auth.signIn")}
            </button>
          </p>
        </div>

        <p className="text-center text-[11px] text-slate-700 mt-4">
          {t("auth.termsHint") || "By signing in, you agree to our Terms of Service and Privacy Policy."}
        </p>
      </div>
    </div>
  );
}

export default AuthPage;
