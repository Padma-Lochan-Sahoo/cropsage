import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx";
import { useTranslation } from "react-i18next";


const API_BASE = import.meta.env?.VITE_API_BASE_URL || "http://localhost:5001";

function FertilizerRecommendation() {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [form, setForm] = useState({
    nitrogen: "", phosphorus: "", potassium: "",
    temperature: "", humidity: "", ph: "", rainfall: "",
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
        <ul className="space-y-1.5">
          {slice.map((item, idx) => (
            <li key={idx} className="flex gap-2 text-xs text-slate-400 leading-relaxed">
              <span className="text-emerald-500 mt-0.5 shrink-0">▸</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        {remaining > 0 && (
          <p className="text-[11px] text-slate-600 mt-1">+{remaining} more in full guide</p>
        )}
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
    if (!nitrogen || !phosphorus || !potassium || !temperature || !humidity || !ph || !rainfall) {
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
      setError(err.response?.data?.msg || t("crop.error"));
    } finally {
      setLoading(false);
    }
  };

  const fields1 = [
    { name: "nitrogen", label: `${t("crop.nitrogen")} (0–140)`, placeholder: "e.g. 90", min: 0, max: 140, step: 1 },
    { name: "phosphorus", label: `${t("crop.phosphorus")} (0–145)`, placeholder: "e.g. 42", min: 0, max: 145, step: 1 },
    { name: "potassium", label: `${t("crop.potassium")} (0–205)`, placeholder: "e.g. 43", min: 0, max: 205, step: 1 },
  ];

  const fields2 = [
    { name: "temperature", label: `${t("crop.temperature")} (°C)`, placeholder: "e.g. 20.88", step: 0.1, min: 0 },
    { name: "humidity", label: `${t("crop.humidity")} (%)`, placeholder: "e.g. 82", min: 0, max: 100, step: 0.1 },
    { name: "ph", label: `${t("crop.ph")} (0–14)`, placeholder: "e.g. 6.5", min: 0, max: 14, step: 0.01 },
    { name: "rainfall", label: `${t("crop.rainfall")} (mm)`, placeholder: "e.g. 202.9", min: 0, step: 0.1 },
  ];

  const guideCards = guide ? [
    { title: "Land prep", data: guide.land_preparation },
    { title: "Sowing plan", data: guide.sowing_plan },
    { title: "Fertilizer & nutrients", data: guide.nutrient_plan },
    { title: "Irrigation", data: guide.irrigation_plan },
    { title: "Weed & pest basics", data: guide.weed_and_pest_management },
    { title: "Disease prevention", data: guide.disease_management },
    { title: "Harvest & post-harvest", data: guide.harvesting_and_post_harvest },
    { title: "Avoid common mistakes", data: guide.mistakes_to_avoid },
  ] : [];

  return (
    <div
      
      
      
      className="max-w-3xl mx-auto py-6 px-4 space-y-6"
    >
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-50">{t("crop.title")}</h1>
        <p className="text-sm text-slate-500 mt-1">{t("crop.subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* NPK */}
        <div className="card p-5 space-y-3">
          <label className="section-label">{t("crop.npkValues")}</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {fields1.map((f) => (
              <div key={f.name} className="space-y-1">
                <span className="text-xs text-slate-500">{f.label}</span>
                <input
                  type="number"
                  name={f.name}
                  value={form[f.name]}
                  onChange={handleChange}
                  min={f.min} max={f.max} step={f.step}
                  placeholder={f.placeholder}
                  className="input-field"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Weather & Soil */}
        <div className="card p-5 space-y-3">
          <label className="section-label">{t("crop.weatherAndSoil")}</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {fields2.map((f) => (
              <div key={f.name} className="space-y-1">
                <span className="text-xs text-slate-500">{f.label}</span>
                <input
                  type="number"
                  name={f.name}
                  value={form[f.name]}
                  onChange={handleChange}
                  min={f.min} max={f.max} step={f.step}
                  placeholder={f.placeholder}
                  className="input-field"
                />
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/25 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-green-900/40 border-t-green-900 animate-spin" />
              {t("crop.gettingRecommendation")}
            </span>
          ) : t("crop.getRecommendation")}
        </button>
      </form>

      {/* Result */}
      
        {result && (
          <div
            
            
            
            className="space-y-4"
          >
            <div className="card p-6">
              <h2 className="font-display text-lg font-semibold text-slate-100 mb-2">{t("crop.recommendedCrop")}</h2>
              <p className="text-2xl font-bold text-emerald-400">{result.result}</p>
              <p className="text-slate-500 text-xs mt-2">{t("crop.recommendationNote")}</p>
            </div>

            {guide && (
              <div className="card p-6 border-emerald-500/25 bg-emerald-500/[0.03] space-y-5">
                <h3 className="font-display text-lg font-semibold text-emerald-300">
                  Quick cultivation plan for {result.crop || "recommended crop"}
                </h3>
                {guide.overview && (
                  <p className="text-slate-300 text-sm leading-relaxed">{guide.overview}</p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {guideCards.filter(c => c.data && c.data.length).map((c, i) => (
                    <div
                      key={i}
                      
                      
                      
                      className="space-y-2"
                    >
                      <h4 className="text-xs font-semibold text-slate-300">{c.title}</h4>
                      {renderList(c.data, 3)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      
    </div>
  );
}

export default FertilizerRecommendation;
