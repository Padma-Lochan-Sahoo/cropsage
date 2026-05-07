import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx";
import { FaCrosshairs } from "react-icons/fa";
import { useTranslation } from "react-i18next";


const API_BASE = import.meta.env?.VITE_API_BASE_URL || "http://localhost:5001";

function WeatherAdvisory() {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [needsLocation, setNeedsLocation] = useState(false);
  const [editingLocation, setEditingLocation] = useState(false);
  const [locationInput, setLocationInput] = useState("");
  const [locating, setLocating] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [cropSuggestions, setCropSuggestions] = useState(null);
  const [suggestionsError, setSuggestionsError] = useState("");

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API_BASE}/api/weather`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
      setNeedsLocation(false);
      setEditingLocation(false);
      setSavingLocation(false);
      setCropSuggestions(null);
      setSuggestionsError("");
    } catch (err) {
      if (err.response?.data?.needsLocation) {
        setNeedsLocation(true);
      } else {
        setError(err.response?.data?.msg || "Failed to load weather data");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGetCropSuggestions = async () => {
    if (!data) return;
    try {
      setSuggestionsLoading(true);
      setSuggestionsError("");
      const res = await axios.post(
        `${API_BASE}/api/weather/crop-suggestions`,
        { weatherData: data },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCropSuggestions(res.data);
    } catch (err) {
      setSuggestionsError(err.response?.data?.msg || "Failed to get crop suggestions");
    } finally {
      setSuggestionsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchWeather();
  }, [token]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await axios.get(`${API_BASE}/api/weather/reverse-geocode`, {
            params: { lat: latitude, lon: longitude },
            headers: { Authorization: `Bearer ${token}` },
          });
          setLocationInput(res.data.locationString);
        } catch {
          setLocationInput(`${latitude.toFixed(4)},${longitude.toFixed(4)}`);
          setLocationError("Could not get city name, using coordinates instead");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocationError("Could not get your location. Please check browser permissions.");
        setLocating(false);
      }
    );
  };

  const handleSaveLocation = async () => {
    if (!locationInput.trim()) {
      setLocationError("Please enter a location");
      return;
    }
    setSavingLocation(true);
    setLocationError("");
    try {
      await axios.patch(
        `${API_BASE}/api/profile`,
        { farmLocation: locationInput.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchWeather();
    } catch (err) {
      setLocationError(err.response?.data?.msg || "Failed to save location");
      setSavingLocation(false);
    }
  };

  const formatTime = (timestamp) =>
    new Date(timestamp * 1000).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const formatDate = (timestamp) =>
    new Date(timestamp * 1000).toLocaleDateString("en-IN", { weekday: "short", hour: "2-digit", minute: "2-digit" });

  const getWeatherIcon = (iconCode) => `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-9 h-9 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin" />
        <p className="text-sm text-slate-500">{t("weather.loadingWeather")}</p>
      </div>
    );
  }

  if (needsLocation || editingLocation) {
    const title = needsLocation ? t("weather.farmLocationRequired") : t("weather.changeLocationTitle");
    const subtitle = needsLocation
      ? t("weather.farmLocationSubtitle")
      : t("weather.changeLocationSubtitle");

    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div
          
          
          className="w-full max-w-md card p-8"
        >
          <div className="text-4xl mb-4 text-center">📍</div>
          <h2 className="font-display text-xl font-bold text-center mb-1">{title}</h2>
          <p className="text-sm text-slate-500 text-center mb-6">{subtitle}</p>

          <div className="space-y-3">
            <input
              type="text"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              placeholder={t("weather.locationPlaceholder") || "City, State, Country"}
              className="input-field"
              onKeyDown={(e) => e.key === "Enter" && handleSaveLocation()}
            />
            {locationError && <p className="text-xs text-red-400">{locationError}</p>}

            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={locating}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-50 transition"
            >
              <FaCrosshairs size={13} />
              {locating ? "Getting location..." : "Use current location"}
            </button>

            <div className="flex gap-2 pt-1">
              {editingLocation && (
                <button
                  type="button"
                  onClick={() => { setEditingLocation(false); setLocationInput(""); setLocationError(""); }}
                  className="btn-ghost flex-1 py-2.5 text-sm"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={handleSaveLocation}
                disabled={savingLocation || !locationInput.trim()}
                className="btn-primary flex-1 py-2.5"
              >
                {savingLocation ? t("weather.saving") : t("weather.getWeatherAdvisory")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <div className="card text-center p-10">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="font-display text-xl font-semibold text-red-300 mb-2">Error</h2>
          <p className="text-slate-400 text-sm mb-6">{error}</p>
          <button onClick={fetchWeather} className="btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { location, current, forecast } = data;

  return (
    <div
      
      
      
      className="max-w-4xl mx-auto py-6 px-4 space-y-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-50">{t("weather.title")}</h1>
          <p className="text-slate-500 text-sm mt-1">{t("weather.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="text-right">
            <p className="text-emerald-400 font-medium text-sm">{location.name}, {location.country}</p>
            <p className="text-slate-600 text-xs">Updated {new Date(data.fetchedAt).toLocaleTimeString()}</p>
          </div>
          <button
            onClick={() => { setEditingLocation(true); setLocationInput(""); setLocationError(""); }}
            className="btn-ghost text-xs py-1.5 px-3"
          >
            {t("weather.changeLocation")}
          </button>
          <button
            onClick={handleGetCropSuggestions}
            disabled={suggestionsLoading}
            
            className="btn-primary text-xs py-1.5 px-3"
          >
            {suggestionsLoading ? "Getting..." : "Crop Suggestions"}
          </button>
        </div>
      </div>

      {/* Crop Suggestions */}
      
        {(cropSuggestions || suggestionsError) && (
          <div
            
            
            
            className="card p-5"
          >
            {suggestionsError ? (
              <p className="text-red-300 text-sm">{suggestionsError}</p>
            ) : (
              <>
                <p className="text-emerald-300 text-sm font-medium mb-4">{cropSuggestions?.summary}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(cropSuggestions?.crops || []).map((item, idx) => (
                    <div key={idx} className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-3">
                      <p className="text-slate-100 font-semibold text-sm">{item.name}</p>
                      <p className="text-slate-400 text-xs mt-1">{item.reason}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      

      {/* Current Weather */}
      <div className="card p-6">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <img src={getWeatherIcon(current.weather.icon)} alt={current.weather.description} className="w-20 h-20" />
            <div>
              <p className="font-display text-5xl font-bold text-slate-50">{current.temp}°C</p>
              <p className="text-slate-400 capitalize text-sm mt-0.5">{current.weather.description}</p>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 ml-auto min-w-[280px]">
            {[
              { label: "Feels Like", value: `${current.feels_like}°C` },
              { label: "Humidity", value: `${current.humidity}%` },
              { label: "Wind", value: `${current.wind_speed} m/s` },
              { label: "Clouds", value: `${current.clouds}%` },
            ].map((item) => (
              <div key={item.label} className="text-center p-3 rounded-xl bg-slate-800/50">
                <p className="section-label mb-1">{item.label}</p>
                <p className="text-lg font-semibold text-slate-200">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <span>🌅</span>
            <span className="text-slate-400 text-sm">Sunrise: {formatTime(current.sunrise)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🌇</span>
            <span className="text-slate-400 text-sm">Sunset: {formatTime(current.sunset)}</span>
          </div>
        </div>
      </div>

      {/* 48-hour Forecast */}
      <div>
        <h2 className="font-display text-base font-semibold text-slate-100 mb-4">📅 {t("weather.forecast48h")}</h2>
        <div className="overflow-x-auto pb-2 no-scrollbar">
          <div className="flex gap-2" style={{ minWidth: "max-content" }}>
            {forecast.map((f, idx) => (
              <div
                key={idx}
                
                
                
                className="flex flex-col items-center p-3 rounded-xl bg-slate-900/60 border border-slate-800 min-w-[84px]"
              >
                <p className="text-[10px] text-slate-500 mb-2">{formatDate(f.dt)}</p>
                <img src={getWeatherIcon(f.weather.icon)} alt={f.weather.description} className="w-10 h-10" />
                <p className="text-base font-semibold text-slate-200">{f.temp}°C</p>
                <p className="text-[10px] text-slate-500">{f.humidity}% 💧</p>
                {f.pop > 0 && (
                  <p className="text-[10px] text-sky-400 mt-0.5">{Math.round(f.pop * 100)}% 🌧️</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-2xl bg-emerald-500/8 border border-emerald-500/20 p-5">
        <h3 className="text-emerald-400 font-semibold mb-3 text-sm">💡 {t("weather.quickTips")}</h3>
        <ul className="text-xs text-slate-400 space-y-1.5">
          <li className="flex gap-2"><span className="text-emerald-500">•</span> Check weather every morning before field activities</li>
          <li className="flex gap-2"><span className="text-emerald-500">•</span> Plan irrigation based on upcoming rain predictions</li>
          <li className="flex gap-2"><span className="text-emerald-500">•</span> Apply pesticides only when no rain is expected for 24 hours</li>
          <li className="flex gap-2"><span className="text-emerald-500">•</span> Update your farm location for accurate local forecasts</li>
        </ul>
      </div>
    </div>
  );
}

export default WeatherAdvisory;
