import axios from "axios";
import User from "../models/User.js";

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";

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
    });
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(400).json({ msg: "Location not found" });
    }
    res.status(500).json({ msg: "Failed to fetch weather data" });
  }
};
