import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx";
import { useTranslation } from "react-i18next";

const API_BASE = import.meta.env?.VITE_API_BASE_URL || "http://localhost:5001";

const SOIL_TYPES = [
  { value: "clay", label: "Clay" },
  { value: "loam", label: "Loam" },
  { value: "sandy", label: "Sandy" },
  { value: "silt", label: "Silt" },
  { value: "clay_loam", label: "Clay Loam" },
  { value: "sandy_loam", label: "Sandy Loam" },
];

const PH_OPTIONS = [
  { value: "acidic", label: "Acidic (below 6)" },
  { value: "neutral", label: "Neutral (6–7)" },
  { value: "alkaline", label: "Alkaline (above 7)" },
];

const NPK_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const CROP_OPTIONS = [
  { value: "", label: "— Suggest crops for my soil first —" },
  { value: "Rice", label: "Rice" },
  { value: "Wheat", label: "Wheat" },
  { value: "Maize", label: "Maize" },
  { value: "Cotton", label: "Cotton" },
  { value: "Sugarcane", label: "Sugarcane" },
  { value: "Tomato", label: "Tomato" },
  { value: "Groundnut", label: "Groundnut" },
  { value: "Chickpea", label: "Chickpea" },
  { value: "Potato", label: "Potato" },
  { value: "Soybean", label: "Soybean" },
  { value: "Barley", label: "Barley" },
  { value: "Mustard", label: "Mustard" },
  { value: "Pearl millet", label: "Pearl millet" },
  { value: "Sorghum", label: "Sorghum" },
  { value: "Tea", label: "Tea" },
  { value: "Jute", label: "Jute" },
  { value: "Oats", label: "Oats" },
  { value: "Rye", label: "Rye" },
  { value: "Lentil", label: "Lentil" },
  { value: "Onion", label: "Onion" },
  { value: "Carrot", label: "Carrot" },
  { value: "Watermelon", label: "Watermelon" },
];

const inputStyle =
  "w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition";

function FertilizerRecommendation() {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [form, setForm] = useState({
    soilType: "",
    ph: "",
    nitrogen: "medium",
    phosphorus: "medium",
    potassium: "medium",
    crop: "",
    region: "",
    areaAcres: "1",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.soilType || !form.ph) {
      setError(t("fertilizer.selectSoilAndPh"));
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await axios.post(
        `${API_BASE}/api/fertilizer/recommend`,
        {
          soilType: form.soilType,
          ph: form.ph,
          nitrogen: form.nitrogen,
          phosphorus: form.phosphorus,
          potassium: form.potassium,
          crop: form.crop || undefined,
          region: form.region.trim() || undefined,
          areaAcres: form.areaAcres ? parseFloat(form.areaAcres) : undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.msg || t("fertilizer.failedRecommendation"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      <div>
        <h1
          className="text-2xl font-bold text-slate-50"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {t("fertilizer.title")}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {t("fertilizer.subtitle")}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-slate-900/50 border border-slate-800 p-6 space-y-5"
      >
        {error && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
              {t("fertilizer.soilType")}
            </label>
            <select
              name="soilType"
              value={form.soilType}
              onChange={handleChange}
              className={inputStyle}
              required
            >
              <option value="">{t("fertilizer.soilTypePlaceholder")}</option>
              {SOIL_TYPES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
              {t("fertilizer.soilPh")}
            </label>
            <select
              name="ph"
              value={form.ph}
              onChange={handleChange}
              className={inputStyle}
              required
            >
              <option value="">{t("fertilizer.soilPhPlaceholder")}</option>
              {PH_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
            {t("fertilizer.nutrientLevels")}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <span className="text-slate-400 text-sm block mb-1">{t("fertilizer.nitrogen")}</span>
              <select
                name="nitrogen"
                value={form.nitrogen}
                onChange={handleChange}
                className={inputStyle}
              >
                {NPK_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span className="text-slate-400 text-sm block mb-1">{t("fertilizer.phosphorus")}</span>
              <select
                name="phosphorus"
                value={form.phosphorus}
                onChange={handleChange}
                className={inputStyle}
              >
                {NPK_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span className="text-slate-400 text-sm block mb-1">{t("fertilizer.potassium")}</span>
              <select
                name="potassium"
                value={form.potassium}
                onChange={handleChange}
                className={inputStyle}
              >
                {NPK_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
              {t("fertilizer.cropOptional")}
            </label>
            <select
              name="crop"
              value={form.crop}
              onChange={handleChange}
              className={inputStyle}
            >
              <option value="">{t("fertilizer.cropSuggestFirst")}</option>
              {CROP_OPTIONS.filter((o) => o.value).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">
              {t("fertilizer.cropHint")}
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
              {t("fertilizer.areaAcres")}
            </label>
            <input
              type="number"
              name="areaAcres"
              value={form.areaAcres}
              onChange={handleChange}
              min="0.1"
              step="0.1"
              placeholder={t("fertilizer.areaPlaceholder")}
              className={inputStyle}
            />
            <p className="text-xs text-slate-500 mt-1">
              {t("fertilizer.areaHint")}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
            {t("fertilizer.regionOptional")}
          </label>
          <input
            type="text"
            name="region"
            value={form.region}
            onChange={handleChange}
            placeholder={t("fertilizer.regionPlaceholder")}
            className={inputStyle}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-900 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {loading ? t("fertilizer.gettingRecommendation") : t("fertilizer.getRecommendation")}
        </button>
      </form>

      {result && (
        <div className="space-y-6">
          {/* Suitable crops */}
          <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-6">
            <h2 className="text-lg font-semibold text-slate-100 mb-3">
              {t("fertilizer.suitableCrops")}
            </h2>
            <p className="text-slate-400 text-sm mb-4">
              {t("fertilizer.suitableCropsDesc")}
            </p>
            <div className="flex flex-wrap gap-2">
              {result.suitableCrops?.map((c) => (
                <span
                  key={c}
                  className="px-3 py-1.5 rounded-full text-sm bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Fertilizer recommendations */}
          {result.cropUsed && (
            <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-6">
              <h2 className="text-lg font-semibold text-slate-100 mb-2">
                {t("fertilizer.fertilizerFor")} {result.cropUsed}
              </h2>
              <p className="text-slate-500 text-sm mb-4">
                {t("fertilizer.areaLabel")}: {result.areaAcres} {t("fertilizer.acres")}
              </p>
              <div className="space-y-4">
                {result.fertilizerRecommendations?.length > 0 ? (
                  result.fertilizerRecommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-700 bg-slate-800/40 p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="font-medium text-emerald-400">{rec.type}</span>
                        <span className="text-slate-500">→</span>
                        <span className="font-medium text-slate-200">{rec.fertilizer}</span>
                        {rec.npk && rec.npk !== "-" && (
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-400">
                            N-P-K: {rec.npk}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="text-slate-500">{t("fertilizer.perAcre")}:</span>{" "}
                          <span className="text-slate-200">{rec.kgPerAcre} kg</span>
                        </div>
                        <div>
                          <span className="text-slate-500">{t("fertilizer.total")} ({result.areaAcres} ac):</span>{" "}
                          <span className="text-slate-200 font-medium">{rec.totalKg} kg</span>
                        </div>
                      </div>
                      <p className="text-slate-400 text-sm mt-2">
                        <span className="text-slate-500">{t("fertilizer.timing")}:</span> {rec.timing}
                      </p>
                      {rec.note && (
                        <p className="text-slate-500 text-xs mt-1">{rec.note}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-sm">
                    {t("fertilizer.soilAdequate")}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Tips */}
          {result.tips && result.tips.length > 0 && (
            <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-5">
              <h3 className="text-emerald-400 font-semibold mb-2">{t("fertilizer.tips")}</h3>
              <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside">
                {result.tips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FertilizerRecommendation;
