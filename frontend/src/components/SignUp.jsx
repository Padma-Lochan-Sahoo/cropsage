import { useState } from "react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../context/AuthContext.jsx";
import { useTranslation } from "react-i18next";

function SignUp() {
  const [state, setState] = useState({ username: "", email: "", password: "" });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useTranslation();

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setState((prev) => ({ ...prev, [name]: value }));
  };

  const handleOnSubmit = async (evt) => {
    evt.preventDefault();
    const { username, email, password } = state;
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5001/api/auth/signup",
        { username, email, password }
      );
      login(response.data.token);
      window.location.href = "/home";
    } catch (error) {
      console.error("There was an error signing up!", error);
      alert(t("auth.signupFailed"));
    } finally {
      setLoading(false);
    }
    setState({ username: "", email: "", password: "" });
  };

  const handleGoogleLoginSuccess = async (response) => {
    try {
      const res = await axios.post("http://localhost:5001/api/auth/google", {
        token: response.credential,
      });
      login(res.data.token);
      window.location.href = "/home";
    } catch (error) {
      console.error("Google signup error:", error);
      alert(t("auth.googleLoginFailed"));
    }
  };

  const handleGoogleLoginError = (error) => {
    console.error("Google signup error:", error);
    alert(t("auth.googleLoginFailed"));
  };

  const inputStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: "12px",
    padding: "10px 14px",
    fontSize: "13px",
    color: "#f1f5f9",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    fontFamily: "inherit",
  };

  const handleFocus = (e) => {
    e.target.style.borderColor = "rgba(16,185,129,0.5)";
    e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.1)";
  };
  const handleBlur = (e) => {
    e.target.style.borderColor = "rgba(255,255,255,0.09)";
    e.target.style.boxShadow = "none";
  };

  return (
    <div className="space-y-4">
      <div>
        <h2
          className="text-lg font-semibold text-slate-50"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          {t("auth.createAccount")}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {t("auth.joinFarmers")}
        </p>
      </div>

      {/* Google */}
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleLoginSuccess}
          onError={handleGoogleLoginError}
        />
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
        <span className="text-[11px] text-slate-600 font-medium">{t("common.or")}</span>
        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
      </div>

      {/* Form */}
      <form onSubmit={handleOnSubmit} className="space-y-3">
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{t("auth.username")}</label>
          <input
            type="text"
            name="username"
            value={state.username}
            onChange={handleChange}
            placeholder="John Doe"
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{t("auth.email")}</label>
          <input
            type="email"
            name="email"
            value={state.email}
            onChange={handleChange}
            placeholder="you@example.com"
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{t("auth.password")}</label>
          <div className="relative">
            <input
              type={passwordVisible ? "text" : "password"}
              name="password"
              value={state.password}
              onChange={handleChange}
              placeholder="Min. 8 characters"
              style={{ ...inputStyle, paddingRight: "40px" }}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
            <button
              type="button"
              onClick={() => setPasswordVisible((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {passwordVisible ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
            </button>
          </div>
        </div>

        {/* Password strength hint */}
        <p className="text-[11px] text-slate-600">
          {t("auth.passwordHint")}
        </p>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl py-2.5 text-sm font-semibold transition-all duration-200"
          style={{
            background: loading
              ? "rgba(16,185,129,0.4)"
              : "linear-gradient(135deg, #059669, #10b981)",
            color: "#022c1a",
            boxShadow: loading ? "none" : "0 4px 20px rgba(16,185,129,0.3)",
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "'Sora', sans-serif",
          }}
          onMouseEnter={(e) => {
            if (!loading) e.target.style.boxShadow = "0 4px 28px rgba(16,185,129,0.5)";
          }}
          onMouseLeave={(e) => {
            e.target.style.boxShadow = loading ? "none" : "0 4px 20px rgba(16,185,129,0.3)";
          }}
        >
          {loading ? t("auth.signingUp") : t("auth.signUpButton")}
        </button>

        <p className="text-[11px] text-slate-600 text-center">
          {t("auth.termsAndPrivacy")}
        </p>
      </form>
    </div>
  );
}

export default SignUp;