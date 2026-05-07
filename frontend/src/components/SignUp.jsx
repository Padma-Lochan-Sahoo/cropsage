import { useState } from "react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTranslation } from "react-i18next";


const API_BASE = import.meta.env?.VITE_API_BASE_URL || "http://localhost:5001";
function SignUp() {
  const [state, setState] = useState({ username: "", email: "", password: "" });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

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
        `${API_BASE}/api/auth/signup`,
        { username, email, password }
      );
      login(response.data.token);
      navigate("/chat", { replace: true });
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
      const res = await axios.post(`${API_BASE}/api/auth/google`, {
        token: response.credential,
      });
      login(res.data.token);
      navigate("/chat", { replace: true });
    } catch (error) {
      console.error("Google signup error:", error);
      alert(t("auth.googleLoginFailed"));
    }
  };

  const handleGoogleLoginError = (error) => {
    console.error("Google signup error:", error);
    alert(t("auth.googleLoginFailed"));
  };

  return (
    <div className="space-y-5 animate-in">
      <div>
        <h2 className="font-display text-xl font-semibold text-slate-50">
          {t("auth.createAccount")}
        </h2>
        <p className="text-xs text-slate-500 mt-1">{t("auth.joinCropSage")}</p>
      </div>

      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleLoginSuccess}
          onError={handleGoogleLoginError}
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-800" />
        <span className="text-[11px] text-slate-600 font-medium">{t("common.or")}</span>
        <div className="flex-1 h-px bg-slate-800" />
      </div>

      <form onSubmit={handleOnSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="section-label">{t("auth.username")}</label>
          <input type="text" name="username" value={state.username} onChange={handleChange}
            placeholder={t("auth.usernamePlaceholder") || "Your name"} className="input-field" />
        </div>
        <div className="space-y-1.5">
          <label className="section-label">{t("auth.email")}</label>
          <input type="email" name="email" value={state.email} onChange={handleChange}
            placeholder="you@example.com" className="input-field" />
        </div>
        <div className="space-y-1.5">
          <label className="section-label">{t("auth.password")}</label>
          <div className="relative">
            <input
              type={passwordVisible ? "text" : "password"}
              name="password"
              value={state.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="input-field pr-10"
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

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3 font-display active:scale-95"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-green-900/40 border-t-green-900 animate-spin" />
              {t("auth.signingUp")}
            </span>
          ) : t("auth.signUpButton")}
        </button>
      </form>
    </div>
  );
}

export default SignUp;
