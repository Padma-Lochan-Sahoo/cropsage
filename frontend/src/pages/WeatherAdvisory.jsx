import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx";
import { FaCrosshairs } from "react-icons/fa";

const API_BASE = import.meta.env?.VITE_API_BASE_URL || "http://localhost:5001";

function WeatherAdvisory() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [needsLocation, setNeedsLocation] = useState(false);

  // Location editing state
  const [editingLocation, setEditingLocation] = useState(false);
  const [locationInput, setLocationInput] = useState("");
  const [locating, setLocating] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");

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
          // Call backend to get city name from coordinates using OpenWeather API
          const res = await axios.get(
            `${API_BASE}/api/weather/reverse-geocode`,
            {
              params: { lat: latitude, lon: longitude },
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          // Set the location name that OpenWeather recognizes
          setLocationInput(res.data.locationString);
        } catch {
          // Fallback to coordinates if reverse geocoding fails
          setLocationInput(`${latitude.toFixed(4)},${longitude.toFixed(4)}`);
          setLocationError("Could not get city name, using coordinates instead");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocationError("Could not get your location. Please check permissions.");
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

  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-IN", {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getWeatherIcon = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  const getAdvisoryStyle = (type) => {
    switch (type) {
      case "danger":
        return "bg-red-500/15 border-red-500/30 text-red-300";
      case "warning":
        return "bg-amber-500/15 border-amber-500/30 text-amber-300";
      case "success":
        return "bg-emerald-500/15 border-emerald-500/30 text-emerald-300";
      default:
        return "bg-sky-500/15 border-sky-500/30 text-sky-300";
    }
  };

  const inputStyle =
    "w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading weather data...</p>
        </div>
      </div>
    );
  }

  // Location Form - shown when needsLocation or editingLocation
  if (needsLocation || editingLocation) {
    const title = needsLocation ? "Farm Location Required" : "Change Location";
    const subtitle = needsLocation
      ? "Enter your farm location to get weather-based advisories"
      : "Update your farm location for accurate weather data";

    return (
      <div className="max-w-lg mx-auto py-8 px-4">
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-amber-500/20 flex items-center justify-center">
              <span className="text-2xl">📍</span>
            </div>
            <h2 className="text-xl font-semibold text-slate-100">{title}</h2>
            <p className="text-slate-400 text-sm mt-1">{subtitle}</p>
          </div>

          {locationError && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-sm">
              {locationError}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                Farm Location
              </label>
              <input
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder="e.g., Gunupur, Odisha or Mumbai, India"
                className={inputStyle}
                autoFocus
              />
              <p className="text-xs text-slate-500 mt-1">
                Enter a city/town name for best results
              </p>
            </div>

            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={locating}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              <FaCrosshairs size={14} />
              {locating ? "Getting location..." : "Use current location"}
            </button>

            <div className="flex gap-3 pt-2">
              {editingLocation && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingLocation(false);
                    setLocationInput("");
                    setLocationError("");
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={handleSaveLocation}
                disabled={savingLocation || !locationInput.trim()}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-900 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {savingLocation ? "Saving..." : "Get Weather Advisory"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto py-12 px-4">
        <div className="text-center p-8 rounded-2xl bg-red-500/10 border border-red-500/30">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-red-300 mb-2">Error</h2>
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { location, current, forecast, advisories } = data;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1
            className="text-2xl font-bold text-slate-50"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Weather Advisory
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Real-time weather insights for your farm
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-emerald-400 font-medium">
              {location.name}, {location.country}
            </p>
            <p className="text-slate-500 text-xs">
              Updated {new Date(data.fetchedAt).toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={() => {
              setEditingLocation(true);
              setLocationInput("");
              setLocationError("");
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
          >
            Change location
          </button>
        </div>
      </div>

      {/* Current Weather Card */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 p-6">
        <div className="flex flex-wrap items-center gap-6">
          {/* Temperature */}
          <div className="flex items-center gap-4">
            <img
              src={getWeatherIcon(current.weather.icon)}
              alt={current.weather.description}
              className="w-20 h-20"
            />
            <div>
              <p className="text-5xl font-bold text-slate-50">
                {current.temp}°C
              </p>
              <p className="text-slate-400 capitalize">
                {current.weather.description}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 ml-auto">
            <div className="text-center p-3 rounded-xl bg-slate-800/50">
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">
                Feels Like
              </p>
              <p className="text-lg font-semibold text-slate-200">
                {current.feels_like}°C
              </p>
            </div>
            <div className="text-center p-3 rounded-xl bg-slate-800/50">
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">
                Humidity
              </p>
              <p className="text-lg font-semibold text-slate-200">
                {current.humidity}%
              </p>
            </div>
            <div className="text-center p-3 rounded-xl bg-slate-800/50">
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">
                Wind
              </p>
              <p className="text-lg font-semibold text-slate-200">
                {current.wind_speed} m/s
              </p>
            </div>
            <div className="text-center p-3 rounded-xl bg-slate-800/50">
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">
                Clouds
              </p>
              <p className="text-lg font-semibold text-slate-200">
                {current.clouds}%
              </p>
            </div>
          </div>
        </div>

        {/* Sunrise/Sunset */}
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-700">
          <div className="flex items-center gap-2">
            <span>🌅</span>
            <span className="text-slate-400 text-sm">
              Sunrise: {formatTime(current.sunrise)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>🌇</span>
            <span className="text-slate-400 text-sm">
              Sunset: {formatTime(current.sunset)}
            </span>
          </div>
        </div>
      </div>

      {/* Advisories */}
      <div>
        <h2 className="text-lg font-semibold text-slate-100 mb-4">
          🌾 Crop Advisories
        </h2>
        <div className="space-y-3">
          {advisories.map((advisory, idx) => (
            <div
              key={idx}
              className={`rounded-xl border p-4 ${getAdvisoryStyle(
                advisory.type
              )}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{advisory.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{advisory.title}</h3>
                  <p className="text-sm opacity-90 leading-relaxed">
                    {advisory.message}
                  </p>
                  {advisory.crops && advisory.crops.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {advisory.crops.map((crop, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-0.5 rounded-full bg-white/10"
                        >
                          {crop}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 48-hour Forecast */}
      <div>
        <h2 className="text-lg font-semibold text-slate-100 mb-4">
          📅 48-Hour Forecast
        </h2>
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-3" style={{ minWidth: "max-content" }}>
            {forecast.map((f, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center p-3 rounded-xl bg-slate-900/50 border border-slate-800 min-w-[90px]"
              >
                <p className="text-xs text-slate-500 mb-2">
                  {formatDate(f.dt)}
                </p>
                <img
                  src={getWeatherIcon(f.weather.icon)}
                  alt={f.weather.description}
                  className="w-10 h-10"
                />
                <p className="text-lg font-semibold text-slate-200">
                  {f.temp}°C
                </p>
                <p className="text-xs text-slate-500">{f.humidity}% 💧</p>
                {f.pop > 0 && (
                  <p className="text-xs text-sky-400 mt-1">
                    {Math.round(f.pop * 100)}% 🌧️
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-5">
        <h3 className="text-emerald-400 font-semibold mb-2">💡 Quick Tips</h3>
        <ul className="text-sm text-slate-300 space-y-1">
          <li>• Check weather every morning before field activities</li>
          <li>• Plan irrigation based on upcoming rain predictions</li>
          <li>• Apply pesticides only when no rain is expected for 24 hours</li>
          <li>• Update your farm location for accurate local forecasts</li>
        </ul>
      </div>
    </div>
  );
}

export default WeatherAdvisory;
