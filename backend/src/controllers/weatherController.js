import axios from "axios";
import User from "../models/User.js";

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";

/**
 * Generate crop advisories based on weather conditions
 */
function generateAdvisories(weather, forecast) {
  const advisories = [];
  const current = weather;
  const temp = current.main.temp;
  const humidity = current.main.humidity;
  const windSpeed = current.wind.speed;
  const weatherMain = current.weather[0]?.main?.toLowerCase() || "";
  const weatherDesc = current.weather[0]?.description?.toLowerCase() || "";

  // Temperature based advisories
  if (temp >= 40) {
    advisories.push({
      type: "danger",
      icon: "🔥",
      title: "Extreme Heat Alert",
      message: "Temperature is very high. Irrigate crops during early morning (5-7 AM) or late evening (6-8 PM). Consider shade nets for sensitive crops. Avoid fieldwork during peak hours.",
      crops: ["All crops", "Vegetables", "Fruits"],
    });
  } else if (temp >= 35) {
    advisories.push({
      type: "warning",
      icon: "☀️",
      title: "High Temperature Warning",
      message: "Schedule irrigation for cooler hours. Apply mulching to retain soil moisture. Monitor crops for heat stress symptoms like wilting.",
      crops: ["Tomato", "Pepper", "Leafy vegetables"],
    });
  } else if (temp <= 4) {
    advisories.push({
      type: "danger",
      icon: "❄️",
      title: "Frost Warning",
      message: "Frost conditions expected. Cover sensitive crops with cloth or plastic sheets. Apply light irrigation before sunset to protect roots. Avoid pruning.",
      crops: ["Banana", "Papaya", "Tomato", "Chili"],
    });
  } else if (temp <= 10) {
    advisories.push({
      type: "warning",
      icon: "🥶",
      title: "Cold Weather Advisory",
      message: "Low temperatures may slow crop growth. Consider row covers for sensitive seedlings. Delay transplanting until weather improves.",
      crops: ["Seedlings", "Young transplants"],
    });
  }

  // Rain based advisories
  if (weatherMain.includes("rain") || weatherMain.includes("drizzle")) {
    if (weatherDesc.includes("heavy") || weatherDesc.includes("extreme")) {
      advisories.push({
        type: "danger",
        icon: "🌧️",
        title: "Heavy Rain Alert",
        message: "Ensure proper drainage in fields. Postpone fertilizer and pesticide application. Check for waterlogging. Support tall crops to prevent lodging.",
        crops: ["Paddy", "Sugarcane", "Maize"],
      });
    } else {
      advisories.push({
        type: "info",
        icon: "🌦️",
        title: "Rain Expected",
        message: "Good conditions for crop growth. Skip irrigation today. Delay pesticide spraying by 24-48 hours. Monitor for fungal diseases after rain.",
        crops: ["All crops"],
      });
    }
  }

  // Humidity based advisories
  if (humidity >= 85) {
    advisories.push({
      type: "warning",
      icon: "💧",
      title: "High Humidity Alert",
      message: "High humidity increases disease risk. Monitor crops for fungal infections (blight, mildew, rust). Ensure adequate plant spacing for air circulation. Apply preventive fungicides if needed.",
      crops: ["Tomato", "Potato", "Grapes", "Onion"],
    });
  }

  // Wind based advisories
  if (windSpeed >= 15) {
    advisories.push({
      type: "warning",
      icon: "💨",
      title: "Strong Wind Warning",
      message: "Stake young plants and tall crops. Avoid pesticide spraying (drift risk). Check greenhouse/polyhouse structures. Delay irrigation with sprinklers.",
      crops: ["Banana", "Sugarcane", "Maize", "Vegetables"],
    });
  }

  // Thunderstorm advisory
  if (weatherMain.includes("thunderstorm")) {
    advisories.push({
      type: "danger",
      icon: "⛈️",
      title: "Thunderstorm Alert",
      message: "Seek shelter immediately. Avoid open fields and isolated trees. Postpone all field activities. Secure loose equipment and materials.",
      crops: ["All crops"],
    });
  }

  // Check forecast for upcoming conditions
  if (forecast && forecast.list) {
    const next24h = forecast.list.slice(0, 8);
    const hasUpcomingRain = next24h.some(
      (f) =>
        f.weather[0]?.main?.toLowerCase().includes("rain") ||
        f.weather[0]?.main?.toLowerCase().includes("thunderstorm")
    );
    const maxTempNext24h = Math.max(...next24h.map((f) => f.main.temp));
    const minTempNext24h = Math.min(...next24h.map((f) => f.main.temp));

    if (hasUpcomingRain && !weatherMain.includes("rain")) {
      advisories.push({
        type: "info",
        icon: "📅",
        title: "Rain Expected Soon",
        message: "Rain predicted in the next 24 hours. Complete pending pesticide/fertilizer applications today. Harvest mature crops if possible.",
        crops: ["All crops"],
      });
    }

    if (minTempNext24h <= 4 && temp > 4) {
      advisories.push({
        type: "warning",
        icon: "📉",
        title: "Temperature Drop Expected",
        message: "Frost conditions expected soon. Prepare protective covers. Apply potassium-based fertilizers to improve cold tolerance.",
        crops: ["Frost-sensitive crops"],
      });
    }
  }

  // Default good weather advisory
  if (advisories.length === 0) {
    advisories.push({
      type: "success",
      icon: "✅",
      title: "Favorable Conditions",
      message: "Weather conditions are good for most farming activities. Ideal time for sowing, transplanting, or fertilizer application.",
      crops: ["All crops"],
    });
  }

  return advisories;
}

/**
 * GET /api/weather
 * Get weather data and advisories for user's farm location
 */
export const getWeatherAdvisory = async (req, res) => {
  try {
    if (!OPENWEATHER_API_KEY) {
      return res.status(500).json({
        msg: "Weather service not configured. Please add OPENWEATHER_API_KEY to server environment.",
      });
    }

    const user = await User.findById(req.user.id).lean();
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (!user.farmLocation || user.farmLocation.trim() === "") {
      return res.status(400).json({
        msg: "Farm location not set",
        needsLocation: true,
      });
    }

    const location = user.farmLocation;

    // Fetch current weather using city name
    const weatherRes = await axios.get(`${OPENWEATHER_BASE_URL}/weather`, {
      params: {
        q: location,
        appid: OPENWEATHER_API_KEY,
        units: "metric",
      },
    });

    // Fetch 5-day forecast
    const forecastRes = await axios.get(`${OPENWEATHER_BASE_URL}/forecast`, {
      params: {
        q: location,
        appid: OPENWEATHER_API_KEY,
        units: "metric",
      },
    });

    const weather = weatherRes.data;
    const forecast = forecastRes.data;

    // Generate advisories
    const advisories = generateAdvisories(weather, forecast);

    res.json({
      location: {
        name: weather.name,
        country: weather.sys.country,
        coord: weather.coord,
      },
      current: {
        temp: Math.round(weather.main.temp),
        feels_like: Math.round(weather.main.feels_like),
        temp_min: Math.round(weather.main.temp_min),
        temp_max: Math.round(weather.main.temp_max),
        humidity: weather.main.humidity,
        pressure: weather.main.pressure,
        wind_speed: weather.wind.speed,
        wind_deg: weather.wind.deg,
        clouds: weather.clouds.all,
        visibility: weather.visibility,
        weather: weather.weather[0],
        sunrise: weather.sys.sunrise,
        sunset: weather.sys.sunset,
      },
      forecast: forecast.list.slice(0, 16).map((f) => ({
        dt: f.dt,
        temp: Math.round(f.main.temp),
        temp_min: Math.round(f.main.temp_min),
        temp_max: Math.round(f.main.temp_max),
        humidity: f.main.humidity,
        weather: f.weather[0],
        wind_speed: f.wind.speed,
        pop: f.pop,
      })),
      advisories,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(400).json({
        msg: "Location not found. Please update your farm location in profile.",
        needsLocation: true,
      });
    }
    if (err.response?.status === 401) {
      return res.status(500).json({ msg: "Weather API key invalid" });
    }
    res.status(500).json({ msg: "Failed to fetch weather data" });
  }
};

/**
 * GET /api/weather/reverse-geocode?lat=X&lon=Y
 * Convert coordinates to city name using OpenWeather Geocoding API
 */
export const reverseGeocode = async (req, res) => {
  try {
    if (!OPENWEATHER_API_KEY) {
      return res.status(500).json({ msg: "Weather service not configured" });
    }

    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ msg: "lat and lon are required" });
    }

    const geoRes = await axios.get(
      "http://api.openweathermap.org/geo/1.0/reverse",
      {
        params: {
          lat: parseFloat(lat),
          lon: parseFloat(lon),
          limit: 1,
          appid: OPENWEATHER_API_KEY,
        },
      }
    );

    if (!geoRes.data || geoRes.data.length === 0) {
      return res.status(404).json({ msg: "Location not found" });
    }

    const loc = geoRes.data[0];
    // Return a simple location string that OpenWeather will recognize
    const locationName = loc.state
      ? `${loc.name}, ${loc.state}, ${loc.country}`
      : `${loc.name}, ${loc.country}`;

    res.json({
      name: loc.name,
      state: loc.state || null,
      country: loc.country,
      locationString: locationName,
    });
  } catch (err) {
    res.status(500).json({ msg: "Failed to get location name" });
  }
};

/**
 * GET /api/weather/location?q=city
 * Get weather for a specific location (without saving)
 */
export const getWeatherByLocation = async (req, res) => {
  try {
    if (!OPENWEATHER_API_KEY) {
      return res.status(500).json({
        msg: "Weather service not configured",
      });
    }

    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ msg: "Location query required" });
    }

    const weatherRes = await axios.get(`${OPENWEATHER_BASE_URL}/weather`, {
      params: {
        q,
        appid: OPENWEATHER_API_KEY,
        units: "metric",
      },
    });

    const forecastRes = await axios.get(`${OPENWEATHER_BASE_URL}/forecast`, {
      params: {
        q,
        appid: OPENWEATHER_API_KEY,
        units: "metric",
      },
    });

    const weather = weatherRes.data;
    const forecast = forecastRes.data;
    const advisories = generateAdvisories(weather, forecast);

    res.json({
      location: {
        name: weather.name,
        country: weather.sys.country,
        coord: weather.coord,
      },
      current: {
        temp: Math.round(weather.main.temp),
        feels_like: Math.round(weather.main.feels_like),
        humidity: weather.main.humidity,
        wind_speed: weather.wind.speed,
        weather: weather.weather[0],
      },
      advisories,
    });
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(400).json({ msg: "Location not found" });
    }
    res.status(500).json({ msg: "Failed to fetch weather data" });
  }
};
