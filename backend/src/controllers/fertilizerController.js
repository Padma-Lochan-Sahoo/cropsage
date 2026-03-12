/**
 * Crop Recommendation Controller
 * Forwards soil & weather parameters to Flask ML API for crop recommendation.
 * Inputs: Nitrogen, Phosphorus, Potassium, temperature, humidity, ph, rainfall
 */

import axios from "axios";
import FormData from "form-data";

const CROP_API_URL = process.env.CROP_RECOMMENDATION_API_URL || "http://127.0.0.1:5000";

/**
 * POST /api/fertilizer/recommend
 * Body: { nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall }
 * All numeric values. Model predicts best crop to cultivate.
 */
export const recommend = async (req, res) => {
  try {
    const {
      nitrogen,
      phosphorus,
      potassium,
      temperature,
      humidity,
      ph,
      rainfall,
    } = req.body || {};

    const n = parseInt(nitrogen, 10);
    const p = parseInt(phosphorus, 10);
    const k = parseInt(potassium, 10);
    const temp = parseFloat(temperature);
    const hum = parseFloat(humidity);
    const phVal = parseFloat(ph);
    const rain = parseFloat(rainfall);

    if (
      Number.isNaN(n) ||
      Number.isNaN(p) ||
      Number.isNaN(k) ||
      Number.isNaN(temp) ||
      Number.isNaN(hum) ||
      Number.isNaN(phVal) ||
      Number.isNaN(rain)
    ) {
      return res.status(400).json({
        msg: "All fields are required: nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall (numeric values)",
      });
    }

    const formData = new FormData();
    formData.append("Nitrogen", String(n));
    formData.append("Phosphorus", String(p));
    formData.append("Potassium", String(k));
    formData.append("Temperature", String(temp));
    formData.append("Humidity", String(hum));
    formData.append("pH", String(phVal));
    formData.append("Rainfall", String(rain));

    const response = await axios.post(
      `${CROP_API_URL}/recommend-crop`,
      formData,
      {
        headers: formData.getHeaders(),
      }
    );

    const { result } = response.data || {};
    return res.json({
      result: result || "Could not get recommendation",
      crop: result ? (result.match(/^([a-z]+)/i) || [])[1] : null,
    });
  } catch (err) {
    console.error("Crop recommendation error:", err.message);
    const status = err.response?.status || 500;
    const msg =
      err.response?.data?.error || err.message || "Crop recommendation failed";
    return res.status(status === 200 ? 500 : status).json({
      msg: typeof msg === "string" ? msg : "Crop recommendation failed",
    });
  }
};
