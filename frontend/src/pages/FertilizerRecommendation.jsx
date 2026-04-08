import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx";
import { useTranslation } from "react-i18next";

const API_BASE = import.meta.env?.VITE_API_BASE_URL || "http://localhost:5001";

const inputStyle =
  "w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition";

function FertilizerRecommendation() {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [form, setForm] = useState({
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    temperature: "",
    humidity: "",
    ph: "",
    rainfall: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const guide = result?.cultivationGuide;

  const renderList = (items, maxItems = 4) => {
    if (!Array.isArray(items) || items.length === 0) return null;
    const slice = items.slice(0, maxItems);
    const remaining = items.length - slice.length;
    return (
      <>
        <ul className="list-disc pl-5 space-y-1 text-slate-300 text-sm leading-relaxed">
          {slice.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
        {remaining > 0 ? (
          <p className="text-[11px] text-slate-500 mt-1">
            Showing first {maxItems} items (+{remaining} more in full guide)
          </p>
        ) : null}
      </>
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall } = form;
    if (
      nitrogen === "" ||
      phosphorus === "" ||
      potassium === "" ||
      temperature === "" ||
      humidity === "" ||
      ph === "" ||
      rainfall === ""
    ) {
      setError(t("crop.fillAllFields"));
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await axios.post(
        `${API_BASE}/api/fertilizer/recommend`,
        {
          nitrogen: parseInt(nitrogen, 10),
          phosphorus: parseInt(phosphorus, 10),
          potassium: parseInt(potassium, 10),
          temperature: parseFloat(temperature),
          humidity: parseFloat(humidity),
          ph: parseFloat(ph),
          rainfall: parseFloat(rainfall),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.msg || t("crop.failedRecommendation"));
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
          {t("crop.title")}
        </h1>
        <p className="text-slate-500 text-sm mt-1">{t("crop.subtitle")}</p>
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

        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
            {t("crop.nutrientLevels")}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <span className="text-slate-400 text-sm block mb-1">
                {t("crop.nitrogen")} (0–140)
              </span>
              <input
                type="number"
                name="nitrogen"
                value={form.nitrogen}
                onChange={handleChange}
                min="0"
                max="140"
                step="1"
                placeholder="e.g. 90"
                className={inputStyle}
              />
            </div>
            <div>
              <span className="text-slate-400 text-sm block mb-1">
                {t("crop.phosphorus")} (0–145)
              </span>
              <input
                type="number"
                name="phosphorus"
                value={form.phosphorus}
                onChange={handleChange}
                min="0"
                max="145"
                step="1"
                placeholder="e.g. 42"
                className={inputStyle}
              />
            </div>
            <div>
              <span className="text-slate-400 text-sm block mb-1">
                {t("crop.potassium")} (0–205)
              </span>
              <input
                type="number"
                name="potassium"
                value={form.potassium}
                onChange={handleChange}
                min="0"
                max="205"
                step="1"
                placeholder="e.g. 43"
                className={inputStyle}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
            {t("crop.weatherAndSoil")}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <span className="text-slate-400 text-sm block mb-1">
                {t("crop.temperature")} (°C)
              </span>
              <input
                type="number"
                name="temperature"
                value={form.temperature}
                onChange={handleChange}
                min="0"
                step="0.1"
                placeholder="e.g. 20.88"
                className={inputStyle}
              />
            </div>
            <div>
              <span className="text-slate-400 text-sm block mb-1">
                {t("crop.humidity")} (%)
              </span>
              <input
                type="number"
                name="humidity"
                value={form.humidity}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.1"
                placeholder="e.g. 82"
                className={inputStyle}
              />
            </div>
            <div>
              <span className="text-slate-400 text-sm block mb-1">
                {t("crop.ph")} (0–14)
              </span>
              <input
                type="number"
                name="ph"
                value={form.ph}
                onChange={handleChange}
                min="0"
                max="14"
                step="0.01"
                placeholder="e.g. 6.5"
                className={inputStyle}
              />
            </div>
            <div>
              <span className="text-slate-400 text-sm block mb-1">
                {t("crop.rainfall")} (mm)
              </span>
              <input
                type="number"
                name="rainfall"
                value={form.rainfall}
                onChange={handleChange}
                min="0"
                step="0.1"
                placeholder="e.g. 202.9"
                className={inputStyle}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-900 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {loading ? t("crop.gettingRecommendation") : t("crop.getRecommendation")}
        </button>
      </form>

      {result && (
        <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-slate-100 mb-3">
            {t("crop.recommendedCrop")}
          </h2>
          <p className="text-emerald-300 text-lg">
            {result.result}
          </p>
          <p className="text-slate-500 text-sm mt-3">
            {t("crop.recommendationNote")}
          </p>

          {guide && (
            <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-4">
              <h3 className="text-xl font-semibold text-emerald-300">
                Quick cultivation plan for{" "}
                {result.crop || "recommended crop"}
              </h3>

              {guide.overview && (
                <p className="text-slate-200 text-sm leading-relaxed">
                  {guide.overview}
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-100 mb-1">
                    Land prep (key steps)
                  </h4>
                  {renderList(guide.land_preparation, 3)}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-100 mb-1">
                    Sowing plan
                  </h4>
                  {renderList(guide.sowing_plan, 3)}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-100 mb-1">
                    Fertilizer & nutrients
                  </h4>
                  {renderList(guide.nutrient_plan, 3)}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-100 mb-1">
                    Irrigation
                  </h4>
                  {renderList(guide.irrigation_plan, 3)}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-100 mb-1">
                    Weed & pest basics
                  </h4>
                  {renderList(guide.weed_and_pest_management, 3)}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-100 mb-1">
                    Disease prevention
                  </h4>
                  {renderList(guide.disease_management, 3)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-100 mb-1">
                    Harvest & post-harvest
                  </h4>
                  {renderList(guide.harvesting_and_post_harvest, 3)}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-100 mb-1">
                    Avoid common mistakes
                  </h4>
                  {renderList(guide.mistakes_to_avoid, 3)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FertilizerRecommendation;
